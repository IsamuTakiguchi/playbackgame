import { el } from "../dom";
import { goTo, setState } from "../../game/state";
import {
  listQuizzes,
  getQuiz,
  deleteQuiz,
} from "../../storage/quizRepo";
import type { QuizMeta } from "../../game/types";
import { decodeBlob } from "../../audio/decode";
import { reverseAudioBuffer } from "../../audio/reverse";
import { getCtx, play, stopPlayback } from "../../audio/AudioEngine";

export async function BankScreen(): Promise<HTMLElement> {
  const quizzes = await listQuizzes();

  const list = el("div", { class: "quiz-list" });
  if (quizzes.length === 0) {
    list.append(el("p", { class: "muted" }, "まだお題がありません。"));
  } else {
    for (const q of quizzes) {
      list.append(quizRow(q));
    }
  }

  return el(
    "div",
    { class: "screen bank" },
    topBar(),
    el(
      "div",
      { class: "row spread" },
      el("h2", {}, `お題の管理 (${quizzes.length})`),
      el(
        "button",
        { class: "btn primary", onclick: () => setState({ screen: "create" }) },
        "＋ 新規作成",
      ),
    ),
    list,
  );
}

function topBar(): HTMLElement {
  return el(
    "div",
    { class: "topbar" },
    el("button", { class: "btn ghost", onclick: () => goTo("home") }, "← ホーム"),
  );
}

function quizRow(q: QuizMeta): HTMLElement {
  let revealed = false;
  const answerEl = el("span", { class: "answer hidden" }, "（タップで表示）");

  const toggle = el(
    "button",
    {
      class: "btn ghost small",
      onclick: () => {
        revealed = !revealed;
        answerEl.textContent = revealed ? q.answer : "（タップで表示）";
        answerEl.classList.toggle("hidden", !revealed);
      },
    },
    "👁",
  );

  const playOriginal = el(
    "button",
    {
      class: "btn small",
      onclick: async () => {
        const full = await getQuiz(q.id);
        if (!full) return;
        const buf = await decodeBlob(full.audio);
        await play(buf);
      },
    },
    "▶ 元",
  );

  const playReversed = el(
    "button",
    {
      class: "btn small",
      onclick: async () => {
        const full = await getQuiz(q.id);
        if (!full) return;
        const buf = await decodeBlob(full.audio);
        const rev = reverseAudioBuffer(buf, getCtx());
        await play(rev);
      },
    },
    "🔁 逆",
  );

  const del = el(
    "button",
    {
      class: "btn danger small",
      onclick: async () => {
        if (!confirm(`「${q.answer}」を削除しますか？`)) return;
        stopPlayback();
        await deleteQuiz(q.id);
        // 再描画のため Bank へ遷移しなおす
        setState({ screen: "bank" });
      },
    },
    "🗑",
  );

  return el(
    "div",
    { class: "quiz-row" },
    el(
      "div",
      { class: "quiz-main" },
      el(
        "div",
        { class: "row" },
        toggle,
        answerEl,
      ),
      el(
        "div",
        { class: "muted small" },
        `${q.durationSec.toFixed(1)}秒 ・ ${sourceLabel(q.source)} ・ 出題${q.playCount}回`,
      ),
    ),
    el("div", { class: "quiz-actions" }, playOriginal, playReversed, del),
  );
}

function sourceLabel(s: QuizMeta["source"]): string {
  return s === "recording" ? "録音" : "ファイル";
}
