import { getCtx } from "./AudioEngine";

/**
 * Blob / ArrayBuffer を AudioBuffer にデコードする。
 *
 * iOS Safari 対策:
 * - 古い Safari は Promise を返さずコールバック形式のみ → 両対応する。
 * - 稀に decodeAudioData が解決しない事象があるため、タイムアウトを設ける
 *   （タイムアウト時は reject し、呼び出し側でエラー画面を出せるようにする）。
 */
export async function decodeBlob(blob: Blob): Promise<AudioBuffer> {
  const arrayBuffer = await blob.arrayBuffer();
  return decodeArrayBuffer(arrayBuffer);
}

const DECODE_TIMEOUT_MS = 8000;

export function decodeArrayBuffer(arrayBuffer: ArrayBuffer): Promise<AudioBuffer> {
  const ctx = getCtx();
  // decodeAudioData は引数を detach することがあるためコピーを渡す
  const data = arrayBuffer.slice(0);

  return new Promise<AudioBuffer>((resolve, reject) => {
    let settled = false;
    const finishOk = (buf: AudioBuffer) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(buf);
    };
    const finishNg = (e: unknown) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(e instanceof Error ? e : new Error("音声のデコードに失敗しました"));
    };

    const timer = setTimeout(
      () => finishNg(new Error("音声のデコードがタイムアウトしました")),
      DECODE_TIMEOUT_MS,
    );

    try {
      // コールバック形式（全 Safari 対応）。新しいブラウザは Promise も返す。
      const maybe = ctx.decodeAudioData(data, finishOk, finishNg);
      if (maybe && typeof (maybe as Promise<AudioBuffer>).then === "function") {
        (maybe as Promise<AudioBuffer>).then(finishOk, finishNg);
      }
    } catch (e) {
      finishNg(e);
    }
  });
}
