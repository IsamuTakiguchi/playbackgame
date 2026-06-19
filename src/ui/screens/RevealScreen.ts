import { el } from "../dom";
import { goTo, getState, resetRound } from "../../game/state";
import { reverseAudioBuffer } from "../../audio/reverse";
import { getCtx } from "../../audio/AudioEngine";
import { audioPlayButton } from "../components/AudioPlayer";
import { sparkles } from "../illustrations";

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

  // 元の順再生（オリジナルそのまま）= 逆再生した元音声をもう一度反転すると順方向に戻る
  let forwardOriginal: AudioBuffer | undefined;
  const getForwardOriginal = (): AudioBuffer | undefined => {
    if (!forwardOriginal && state.reversedOriginal) {
      forwardOriginal = reverseAudioBuffer(state.reversedOriginal, getCtx());
    }
    return forwardOriginal;
  };

  // ヒント（ボタンで開く）
  const hintText = el("p", { class: "muted", hidden: true });
  const hintBtn =
    quiz.hint != null && quiz.hint !== ""
      ? el(
          "button",
          {
            class: "btn",
            onclick: () => {
              hintText.hidden = false;
              hintText.textContent = `ヒント: ${quiz.hint}`;
            },
          },
          "💡 ヒント",
        )
      : null;

  // 元の順再生（正解表示後に出す）
  const playOriginalForward = audioPlayButton(
    "▶ 元の順再生",
    getForwardOriginal,
  );
  const forwardWrap = el(
    "div",
    { hidden: true },
    ...(state.reversedOriginal ? [playOriginalForward] : []),
  );

  const answerBox = el("div", { class: "answer-box", hidden: true });
  const revealAnswerBtn = el(
    "button",
    {
      class: "btn",
      onclick: () => {
        answerBox.hidden = false;
        answerBox.replaceChildren(
          el("p", { class: "answer-label" }, "正解"),
          el("p", { class: "answer-text" }, quiz.answer),
        );
        // 正解と一緒に「元の順再生」を出す（順再生＝答えが聞こえるため）
        forwardWrap.hidden = false;
      },
    },
    "✅ 正解を表示",
  );

  const playMimicReversed = audioPlayButton(
    "▶ 出題者の逆再生（答え合わせ）",
    () => reversedMimic,
    { class: "primary big" },
  );

  return el(
    "div",
    { class: "screen reveal" },
    el("div", { class: "hero" }, sparkles()),
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
      ...(hintBtn ? [el("div", { class: "row" }, hintBtn)] : []),
      hintText,
    ),
    el("div", { class: "stack" }, revealAnswerBtn, answerBox, forwardWrap),
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
