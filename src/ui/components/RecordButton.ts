import { el } from "../dom";
import { startRecording, type RecordingHandle } from "../../audio/recorder";

/**
 * 録音ボタン + レベルメーター。
 * 録音が終わると onDone(buffer) を呼ぶ。エラー時は onError。
 */
export function recordButton(
  onDone: (buffer: AudioBuffer) => void,
  onError: (message: string) => void,
): HTMLElement {
  let handle: RecordingHandle | null = null;
  let raf = 0;

  const meterFill = el("div", { class: "meter-fill" });
  const meter = el("div", { class: "meter" }, meterFill);

  const btn = el("button", { class: "btn record" }, "● 録音開始");

  const tick = () => {
    if (!handle) return;
    const level = handle.getLevel();
    meterFill.style.width = Math.min(100, level * 140).toFixed(0) + "%";
    raf = requestAnimationFrame(tick);
  };

  const stopMeter = () => {
    cancelAnimationFrame(raf);
    meterFill.style.width = "0%";
  };

  btn.addEventListener("click", async () => {
    if (!handle) {
      // 開始
      btn.disabled = true;
      try {
        handle = await startRecording();
        btn.textContent = "■ 録音停止";
        btn.classList.add("recording");
        tick();
      } catch (err) {
        onError(err instanceof Error ? err.message : String(err));
      } finally {
        btn.disabled = false;
      }
    } else {
      // 停止
      btn.disabled = true;
      const h = handle;
      handle = null;
      stopMeter();
      btn.classList.remove("recording");
      btn.textContent = "● 録音開始";
      try {
        const buffer = await h.stop();
        onDone(buffer);
      } catch (err) {
        onError(err instanceof Error ? err.message : String(err));
      } finally {
        btn.disabled = false;
      }
    }
  });

  return el("div", { class: "recorder" }, btn, meter);
}
