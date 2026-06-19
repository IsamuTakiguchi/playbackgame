import { el } from "../dom";
import { goTo, setState } from "../../game/state";
import { listQuizzes } from "../../storage/quizRepo";
import type { QuizMeta } from "../../game/types";
import { emptyMic } from "../illustrations";

/**
 * 選んで出題モードのクイズ一覧。答えを表示してタップで選択する。
 */
export async function PickQuizScreen(): Promise<HTMLElement> {
  const quizzes = await listQuizzes();

  const list = el("div", { class: "quiz-list" });
  if (quizzes.length === 0) {
    list.append(
      el(
        "div",
        { class: "empty-state" },
        emptyMic(),
        el("p", {}, "まだお題がありません。"),
        el(
          "button",
          { class: "btn primary", onclick: () => setState({ screen: "create" }) },
          "＋ お題を作る",
        ),
      ),
    );
  } else {
    for (const q of quizzes) {
      list.append(pickRow(q));
    }
  }

  return el(
    "div",
    { class: "screen" },
    el(
      "div",
      { class: "topbar" },
      el(
        "button",
        { class: "btn ghost", onclick: () => goTo("modeSelect") },
        "← 戻る",
      ),
    ),
    el("h2", {}, "お題を選ぶ"),
    el("p", { class: "muted" }, "出題するお題をタップしてください。"),
    list,
  );
}

function pickRow(q: QuizMeta): HTMLElement {
  return el(
    "button",
    {
      class: "quiz-row pickable",
      onclick: () => {
        setState({ selectedId: q.id });
        goTo("playSetup");
      },
    },
    el(
      "div",
      { class: "quiz-main" },
      el("div", { class: "answer" }, q.answer),
      el(
        "div",
        { class: "muted small" },
        `${q.durationSec.toFixed(1)}秒${q.hint ? ` ・ ヒント: ${q.hint}` : ""}`,
      ),
    ),
    el("div", { class: "pick-arrow" }, "▶"),
  );
}
