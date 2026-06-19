import { el } from "../dom";
import { goTo, setState } from "../../game/state";

/**
 * 出題モードの選択。「ゲームを始める」直後に表示。
 * ランダム or 一覧から選ぶ。
 */
export function ModeSelectScreen(): HTMLElement {
  return el(
    "div",
    { class: "screen" },
    el(
      "div",
      { class: "topbar" },
      el("button", { class: "btn ghost", onclick: () => goTo("home") }, "← ホーム"),
    ),
    el("h2", {}, "出題モードを選ぶ"),
    el("p", { class: "muted" }, "どうやってお題を出しますか？"),
    el(
      "div",
      { class: "stack" },
      el(
        "button",
        {
          class: "btn primary big",
          onclick: () => {
            setState({ playMode: "random", selectedId: undefined });
            goTo("playSetup");
          },
        },
        "🎲 ランダムモード",
      ),
      el(
        "button",
        {
          class: "btn accent big",
          onclick: () => {
            setState({ playMode: "select", selectedId: undefined });
            goTo("pick");
          },
        },
        "📋 選んで出題",
      ),
    ),
  );
}
