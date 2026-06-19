import { el } from "../dom";
import { goTo, getState, setState } from "../../game/state";
import { recordButton } from "../components/RecordButton";
import { audioPlayButton } from "../components/AudioPlayer";
import { play } from "../../audio/AudioEngine";

/**
 * 出題者が「逆再生のマネ」を録音する画面。
 * 録音後はそのまま聞き返せて、再録もできる。
 */
export function MimicScreen(): HTMLElement {
  const state = getState();
  let mimic: AudioBuffer | undefined = state.mimicBuffer;

  const status = el("p", { class: "status" }, "");
  const setStatus = (msg: string, isError = false) => {
    status.textContent = msg;
    status.classList.toggle("error", isError);
  };

  const playMimic = audioPlayButton("▶ 録音を確認", () => mimic);
  const revealBtn = el(
    "button",
    {
      class: "btn primary big",
      disabled: !mimic,
      onclick: () => {
        setState({ mimicBuffer: mimic });
        goTo("reveal");
      },
    },
    "✨ 結果を見る →",
  );

  const afterRecord = el(
    "div",
    { class: "bottom-actions", hidden: !mimic },
    playMimic,
    revealBtn,
  );

  const recorder = recordButton(
    (buf) => {
      mimic = buf;
      afterRecord.hidden = false;
      revealBtn.disabled = false;
      setStatus(`録音しました（${buf.duration.toFixed(1)}秒）。確認するか、結果を見ましょう。`);
    },
    (msg) => setStatus(msg, true),
  );

  const replayReversed = el(
    "button",
    {
      class: "btn",
      onclick: async () => {
        if (state.reversedOriginal) await play(state.reversedOriginal);
      },
    },
    "🔊 お手本（逆再生）をもう一度",
  );

  return el(
    "div",
    { class: "screen mimic" },
    el(
      "div",
      { class: "topbar" },
      el(
        "button",
        { class: "btn ghost", onclick: () => goTo("playSetup") },
        "← 戻る",
      ),
    ),
    el("h2", {}, "マネを録音"),
    el(
      "p",
      { class: "muted" },
      "聞いた逆再生の音をマネして発声し、録音してください。",
    ),
    el("div", { class: "card" }, replayReversed),
    el("div", { class: "card" }, recorder),
    afterRecord,
    status,
  );
}
