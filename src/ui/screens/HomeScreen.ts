import { el } from "../dom";
import { goTo } from "../../game/state";
import { countQuizzes } from "../../storage/quizRepo";
import { micIllustration } from "../illustrations";

export async function HomeScreen(): Promise<HTMLElement> {
  const count = await countQuizzes();

  const playBtn = el(
    "button",
    {
      class: "btn primary big",
      disabled: count === 0,
      onclick: () => goTo("playSetup"),
    },
    "▶ ゲームを始める",
  );

  return el(
    "div",
    { class: "screen home" },
    el("div", { class: "hero" }, micIllustration()),
    el("h1", {}, "逆再生ゲーム"),
    el(
      "p",
      { class: "lead" },
      "逆再生された音をマネして発声 → もう一度逆再生すると元の言葉に！",
    ),
    el(
      "div",
      { class: "stack" },
      el(
        "button",
        { class: "btn accent big", onclick: () => goTo("bank") },
        "🎙 お題を作る / 管理",
      ),
      playBtn,
    ),
    el(
      "p",
      { class: "muted" },
      count === 0
        ? "まずはお題を作りましょう（0 問）"
        : `ストック: ${count} 問`,
    ),
  );
}
