import { encodeWav } from "./encode-wav";

/**
 * 音声エンジン。
 *
 * - デコード/逆再生（バッファ処理）には AudioContext を使う。
 * - **出力（再生）は HTMLAudioElement** を使う。iOS Safari の WebAudio 出力は
 *   着信音(リンガー)音量・消音スイッチに紐づいて無音になりやすいが、<audio> は
 *   メディア音量で鳴り消音スイッチも無視するため、確実に音が出る。
 */

let ctx: AudioContext | null = null;

export function getCtx(): AudioContext {
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") {
    void ctx.resume();
  }
  return ctx;
}

/** 出力用の共有 <audio> 要素。 */
let audioEl: HTMLAudioElement | null = null;
let currentUrl: string | null = null;
let currentResolve: (() => void) | null = null;

function getAudioEl(): HTMLAudioElement {
  if (!audioEl) {
    audioEl = new Audio();
    audioEl.setAttribute("playsinline", "");
    audioEl.preload = "auto";
  }
  return audioEl;
}

/**
 * 最初のユーザー操作（タップ/クリック）の中で呼び、音声を「アンロック」する。
 * - AudioContext を生成＋resume（decode 用）。
 * - <audio> をジェスチャ内で一度 play→pause して温める（iOS 対策）。
 */
export function unlockAudio(): void {
  const c = getCtx();
  if (c.state === "suspended") void c.resume();
  try {
    const el = getAudioEl();
    // 無音の極小 WAV を一瞬再生して <audio> を解錠
    const silent = c.createBuffer(1, 2205, 22050);
    const url = URL.createObjectURL(encodeWav(silent));
    el.src = url;
    el.muted = true;
    const p = el.play();
    if (p && typeof p.then === "function") {
      p.then(() => {
        el.pause();
        el.muted = false;
        URL.revokeObjectURL(url);
      }).catch(() => {
        el.muted = false;
        URL.revokeObjectURL(url);
      });
    } else {
      el.muted = false;
    }
  } catch {
    /* 解錠失敗は致命ではない */
  }
}

/**
 * AudioContext が running になるまで待つ。decodeAudioData の前の保険。
 */
export async function ensureRunning(): Promise<void> {
  const c = getCtx();
  if (c.state === "suspended") {
    try {
      await c.resume();
    } catch {
      /* resume 不可でも続行 */
    }
  }
}

/** いま鳴っている音を止める。保留中の再生 Promise も解決する。 */
export function stopPlayback(): void {
  if (audioEl) {
    try {
      audioEl.pause();
      audioEl.currentTime = 0;
    } catch {
      /* noop */
    }
  }
  if (currentUrl) {
    URL.revokeObjectURL(currentUrl);
    currentUrl = null;
  }
  if (currentResolve) {
    const r = currentResolve;
    currentResolve = null;
    r();
  }
}

/**
 * AudioBuffer を WAV 化して <audio> で再生する。
 * 再生完了 or 停止で解決する Promise を返す。
 */
export function play(buffer: AudioBuffer): Promise<void> {
  stopPlayback();

  const el = getAudioEl();
  el.muted = false;
  const blob = encodeWav(buffer);
  const url = URL.createObjectURL(blob);
  currentUrl = url;
  el.src = url;

  return new Promise<void>((resolve, reject) => {
    currentResolve = resolve;

    const cleanup = () => {
      el.removeEventListener("ended", onEnded);
      if (currentUrl === url) {
        URL.revokeObjectURL(url);
        currentUrl = null;
      }
    };
    const onEnded = () => {
      cleanup();
      if (currentResolve === resolve) {
        currentResolve = null;
        resolve();
      }
    };
    el.addEventListener("ended", onEnded);

    const p = el.play();
    if (p && typeof p.then === "function") {
      p.catch((e: unknown) => {
        cleanup();
        if (currentResolve === resolve) currentResolve = null;
        reject(e instanceof Error ? e : new Error(String(e)));
      });
    }
  });
}

/** 動作確認用のテストトーン（440Hz, 約0.4秒）。 */
export function makeTestTone(): AudioBuffer {
  const c = getCtx();
  const sr = c.sampleRate;
  const len = Math.floor(sr * 0.4);
  const buf = c.createBuffer(1, len, sr);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    data[i] = Math.sin((2 * Math.PI * 440 * i) / sr) * 0.3;
  }
  return buf;
}
