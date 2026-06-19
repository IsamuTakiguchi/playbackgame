import { getMicStream } from "../utils/permissions";
import { decodeBlob } from "./decode";
import { getCtx } from "./AudioEngine";
import { trimSilence } from "./trim";

/**
 * マイク録音。MediaRecorder で録り、停止時に decodeAudioData → トリム済み
 * AudioBuffer を返す。ライブのレベル監視用に AnalyserNode も提供する。
 */

function pickSupportedMime(): string {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
    "audio/ogg",
  ];
  for (const m of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m)) {
      return m;
    }
  }
  return ""; // ブラウザ既定に任せる
}

export interface RecordingHandle {
  /** 0..1 のおおよその入力レベル。レベルメーター用。 */
  getLevel(): number;
  /** 録音停止 → トリム済み AudioBuffer を返す。 */
  stop(): Promise<AudioBuffer>;
  /** 破棄（保存しない場合）。 */
  cancel(): void;
}

export async function startRecording(): Promise<RecordingHandle> {
  const stream = await getMicStream();
  const ctx = getCtx();

  // ライブのレベル監視
  const sourceNode = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 1024;
  sourceNode.connect(analyser);
  const levelBuf = new Uint8Array(analyser.fftSize);

  const mimeType = pickSupportedMime();
  const rec = mimeType
    ? new MediaRecorder(stream, { mimeType })
    : new MediaRecorder(stream);
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };
  rec.start();

  const cleanup = () => {
    sourceNode.disconnect();
    analyser.disconnect();
    stream.getTracks().forEach((t) => t.stop());
  };

  return {
    getLevel(): number {
      analyser.getByteTimeDomainData(levelBuf);
      let peak = 0;
      for (let i = 0; i < levelBuf.length; i++) {
        const v = Math.abs(levelBuf[i] - 128) / 128;
        if (v > peak) peak = v;
      }
      return peak;
    },

    stop(): Promise<AudioBuffer> {
      return new Promise<AudioBuffer>((resolve, reject) => {
        rec.onstop = async () => {
          try {
            const blob = new Blob(chunks, {
              type: rec.mimeType || "audio/webm",
            });
            const decoded = await decodeBlob(blob);
            const trimmed = trimSilence(decoded, ctx);
            resolve(trimmed);
          } catch (err) {
            reject(err);
          } finally {
            cleanup();
          }
        };
        rec.stop();
      });
    },

    cancel(): void {
      try {
        if (rec.state !== "inactive") rec.stop();
      } catch {
        /* noop */
      }
      cleanup();
    },
  };
}
