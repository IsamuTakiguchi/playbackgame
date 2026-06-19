import { el } from "../dom";
import { play, stopPlayback } from "../../audio/AudioEngine";

/**
 * AudioBuffer を再生する 1 ボタン。再生中は表示が変わり、押すと停止。
 * buffer は遅延取得（プレビューなどで後から差し替える場合に対応）。
 */
export function audioPlayButton(
  label: string,
  getBuffer: () => AudioBuffer | undefined,
  opts: { class?: string } = {},
): HTMLButtonElement {
  let playing = false;

  const btn = el(
    "button",
    {
      class: "btn " + (opts.class ?? ""),
      onclick: async () => {
        const buf = getBuffer();
        if (!buf) return;
        if (playing) {
          stopPlayback();
          return;
        }
        playing = true;
        btn.textContent = "■ 停止";
        try {
          await play(buf);
        } finally {
          playing = false;
          btn.textContent = label;
        }
      },
    },
    label,
  );
  return btn;
}
