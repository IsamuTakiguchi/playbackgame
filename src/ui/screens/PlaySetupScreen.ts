import { el } from "../dom";
import { goTo, getState, setState, markPlayed } from "../../game/state";
import { getRandomQuiz, incrementPlayCount } from "../../storage/quizRepo";
import { decodeBlob } from "../../audio/decode";
import { reverseAudioBuffer } from "../../audio/reverse";
import { getCtx, play, ensureRunning } from "../../audio/AudioEngine";
import { earListen } from "../illustrations";

/**
 * 出題者向け。ランダムに 1 問選び、逆再生したオリジナルを聞かせる。
 * 答えは表示しない。
 */
export async function PlaySetupScreen(): Promise<HTMLElement> {
  const state = getState();
  const quiz = await getRandomQuiz(state.playedIds);

  if (!quiz) {
    return el(
      "div",
      { class: "screen" },
      el("p", {}, "出題できるお題がありません。"),
      el("button", { class: "btn", onclick: () => goTo("home") }, "← ホーム"),
    );
  }

  // 逆再生バッファを用意して state に保持。
  // iOS では decode 前に context を running にしておく（固まり防止）。
  let reversed: AudioBuffer;
  try {
    await ensureRunning();
    const original = await decodeBlob(quiz.audio);
    reversed = reverseAudioBuffer(original, getCtx());
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return el(
      "div",
      { class: "screen" },
      el("h2", {}, "音声を読み込めませんでした"),
      el("p", { class: "status error" }, message),
      el(
        "div",
        { class: "bottom-actions" },
        el(
          "button",
          { class: "btn primary big", onclick: () => goTo("home") },
          "← ホームに戻る",
        ),
      ),
    );
  }
  setState({ currentQuiz: quiz, reversedOriginal: reversed });

  let playCount = 0;
  const counter = el("p", { class: "muted small" }, "再生回数: 0");

  const listenBtn = el(
    "button",
    {
      class: "btn primary big",
      onclick: async () => {
        playCount++;
        counter.textContent = `再生回数: ${playCount}`;
        await play(reversed);
      },
    },
    "🔊 逆再生を聞く",
  );

  const nextBtn = el(
    "button",
    {
      class: "btn big",
      onclick: async () => {
        markPlayed(quiz.id);
        await incrementPlayCount(quiz.id);
        goTo("mimic");
      },
    },
    "🎤 マネを録音する →",
  );

  return el(
    "div",
    { class: "screen play-setup" },
    el(
      "div",
      { class: "topbar" },
      el("button", { class: "btn ghost", onclick: () => goTo("home") }, "← やめる"),
    ),
    el("div", { class: "warning" }, "⚠ 回答者は画面を見ないでください（出題者のみ操作）"),
    el("div", { class: "hero" }, earListen()),
    el("h2", {}, "出題者: 逆再生を聞いてマネしよう"),
    el(
      "p",
      { class: "muted" },
      "下のボタンで逆再生を聞き、その音を口でマネする練習をします。準備ができたら録音へ。",
    ),
    el("div", { class: "stack" }, listenBtn, counter),
    el("div", { class: "bottom-actions" }, nextBtn),
  );
}
