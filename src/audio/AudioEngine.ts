/**
 * AudioContext を 1 つだけ持つシングルトン。
 *
 * - ブラウザはユーザー操作前の音声を禁止するため、最初のユーザー操作で生成する。
 * - 再生・録音の入口ごとに resume() する。
 * - AudioBufferSourceNode は使い捨てなので、再生のたびに生成する。
 */

let ctx: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | null = null;

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

/**
 * 最初のユーザー操作（タップ/クリック）の中で呼び、AudioContext を生成＋resume し、
 * さらに「無音バッファを1回再生」して iOS Safari の音声出力を解錠する。
 * iOS は resume だけでは出力が解錠されないことがあるため、この空再生が要。
 */
export function unlockAudio(): void {
  const c = getCtx();
  if (c.state === "suspended") void c.resume();
  try {
    const buffer = c.createBuffer(1, 1, 22050);
    const src = c.createBufferSource();
    src.buffer = buffer;
    src.connect(c.destination);
    src.start(0);
  } catch {
    /* 解錠の空再生に失敗しても致命ではない */
  }
}

/**
 * AudioContext が running になるまで待つ。decodeAudioData / 再生の前の保険。
 * （resume はユーザー操作内で呼ばれている前提。ここでは完了を待つだけ。）
 */
export async function ensureRunning(): Promise<void> {
  const c = getCtx();
  if (c.state === "suspended") {
    try {
      await c.resume();
    } catch {
      /* resume 不可でも続行（デコード自体は可能なことが多い） */
    }
  }
}

/** いま鳴っている音を止める。 */
export function stopPlayback(): void {
  if (currentSource) {
    try {
      currentSource.stop();
    } catch {
      /* 既に停止済みなら無視 */
    }
    currentSource.disconnect();
    currentSource = null;
  }
}

/**
 * AudioBuffer を再生する。再生完了 or 中断で解決する Promise を返す。
 * 新しい再生を始めると前の再生は止める（同時再生しない）。
 */
export async function play(buffer: AudioBuffer): Promise<void> {
  const context = getCtx();
  // iOS 対策: 再生前に running を保証してから start する（ユーザー操作内で呼ばれる）。
  if (context.state === "suspended") {
    try {
      await context.resume();
    } catch {
      /* resume 不可でも続行 */
    }
  }
  stopPlayback();

  return new Promise<void>((resolve) => {
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.onended = () => {
      source.disconnect();
      if (currentSource === source) currentSource = null;
      resolve();
    };
    currentSource = source;
    source.start();
  });
}
