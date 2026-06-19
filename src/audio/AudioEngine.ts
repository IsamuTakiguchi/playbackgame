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
export function play(buffer: AudioBuffer): Promise<void> {
  const context = getCtx();
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
