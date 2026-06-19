import { el } from "../dom";
import { goTo, getState, resetRound } from "../../game/state";
import { reverseAudioBuffer } from "../../audio/reverse";
import { getCtx, play } from "../../audio/AudioEngine";
import { audioPlayButton } from "../components/AudioPlayer";

/**
 * 仕上げ画面。マネ音声を逆再生して再生する（うまくいけば元の言葉に聞こえる）。
 * 回答者が口頭で当てたあと、正解を表示できる。
 */
export function RevealScreen(): HTMLElement {
  const state = getState();
  const quiz = state.currentQuiz;
  const mimic = state.mimicBuffer;

  if (!quiz || !mimic) {
    return el(
      "div",
      { class: "screen" },
      el("p", {}, "データがありません。"),
      el("button", { class: "btn", onclick: () => goTo("home") }, "← ホーム"),
    );
  }

  // マネの逆再生（＝出題者の発声を元に戻したもの）
  const reversedMimic = reverseAudioBuffer(mimic, getCtx());

  const answerBox = el("div", { class: "answer-box", hidden: true });
  const revealAnswerBtn = el(
    "button",
    {
      class: "btn",
      onclick: () => {
        answerBox.hidden = false;
        const children: Node[] = [
          el("p", { class: "answer-label" }, "正解"),
          el("p", { class: "answer-text" }, quiz.answer),
        ];
        if (quiz.hint) {
          children.push(el("p", { class: "muted" }, `ヒント: ${quiz.hint}`));
        }
        answerBox.replaceChildren(...children);
      },
    },
    "✅ 正解を表示",
  );

  const playMimicReversed = audioPlayButton(
    "▶ 出題者の逆再生（答え合わせ）",
    () => reversedMimic,
    { class: "primary big" },
  );

  const playOriginalReversed = el(
    "button",
    {
      class: "btn",
      onclick: async () => {
        if (state.reversedOriginal) await play(state.reversedOriginal);
      },
    },
    "🔁 元の逆再生（お手本）",
  );

  return el(
    "div",
    { class: "screen reveal" },
    el("h2", {}, "答え合わせ"),
    el(
      "p",
      { class: "muted" },
      "出題者のマネを逆再生します。元の言葉に聞こえるか、回答者が当ててみましょう。",
    ),
    el(
      "div",
      { class: "card" },
      playMimicReversed,
      el("div", { class: "row" }, playOriginalReversed),
    ),
    el("div", { class: "stack" }, revealAnswerBtn, answerBox),
    el(
      "div",
      { class: "bottom-actions" },
      el(
        "button",
        { class: "btn primary big", onclick: () => goTo("playSetup") },
        "➡ 次のお題",
      ),
      el(
        "button",
        {
          class: "btn ghost",
          onclick: () => {
            resetRound();
            goTo("home");
          },
        },
        "ホームへ",
      ),
    ),
  );
}
