import { el } from "../dom";
import { setState } from "../../game/state";
import { recordButton } from "../components/RecordButton";
import { audioPlayButton } from "../components/AudioPlayer";
import { reverseAudioBuffer } from "../../audio/reverse";
import { getCtx } from "../../audio/AudioEngine";
import { decodeBlob } from "../../audio/decode";
import { trimSilence } from "../../audio/trim";
import { addQuiz } from "../../storage/quizRepo";
import type { QuizSource } from "../../game/types";

export function CreateQuizScreen(): HTMLElement {
  let buffer: AudioBuffer | undefined;
  let source: QuizSource = "recording";

  const status = el("p", { class: "status" }, "");
  const setStatus = (msg: string, isError = false) => {
    status.textContent = msg;
    status.classList.toggle("error", isError);
  };

  // プレビュー（元・逆）
  const previewPlay = audioPlayButton("▶ 元を再生", () => buffer);
  const previewReverse = audioPlayButton("🔁 逆再生を確認", () => {
    if (!buffer) return undefined;
    return reverseAudioBuffer(buffer, getCtx());
  });
  const preview = el(
    "div",
    { class: "preview", hidden: true },
    el("p", { class: "muted small" }, "プレビュー："),
    el("div", { class: "row" }, previewPlay, previewReverse),
  );

  const onBuffer = (buf: AudioBuffer, src: QuizSource) => {
    buffer = buf;
    source = src;
    preview.hidden = false;
    setStatus(`取得しました（${buf.duration.toFixed(1)}秒）。答えを入力して保存してください。`);
    saveBtn.disabled = false;
  };

  // 録音
  const recorder = recordButton(
    (buf) => onBuffer(buf, "recording"),
    (msg) => setStatus(msg, true),
  );

  // ファイルアップロード
  const fileInput = el("input", {
    type: "file",
    accept: "audio/*",
    onchange: async (e) => {
      const input = e.target as HTMLInputElement;
      const file = input.files?.[0];
      if (!file) return;
      setStatus("読み込み中…");
      try {
        const decoded = await decodeBlob(file);
        const trimmed = trimSilence(decoded, getCtx());
        onBuffer(trimmed, "upload");
      } catch {
        setStatus("この音声ファイルを読み込めませんでした。", true);
      }
    },
  });

  // 入力欄
  const answerInput = el("input", {
    type: "text",
    placeholder: "答え（例: りんご）※必須",
    oninput: () => {
      saveBtn.disabled = !buffer || answerInput.value.trim() === "";
    },
  }) as HTMLInputElement;
  const hintInput = el("input", {
    type: "text",
    placeholder: "ヒント（任意）",
  }) as HTMLInputElement;

  const saveBtn = el(
    "button",
    {
      class: "btn primary",
      disabled: true,
      onclick: async () => {
        if (!buffer) return;
        const answer = answerInput.value.trim();
        if (!answer) {
          setStatus("答えを入力してください。", true);
          return;
        }
        saveBtn.disabled = true;
        try {
          await addQuiz(
            { answer, hint: hintInput.value, source },
            buffer,
          );
          setState({ screen: "bank" });
        } catch (err) {
          setStatus(
            "保存に失敗しました: " +
              (err instanceof Error ? err.message : String(err)),
            true,
          );
          saveBtn.disabled = false;
        }
      },
    },
    "💾 保存",
  );

  return el(
    "div",
    { class: "screen create" },
    el(
      "div",
      { class: "topbar" },
      el(
        "button",
        { class: "btn ghost", onclick: () => setState({ screen: "bank" }) },
        "← 戻る",
      ),
    ),
    el("h2", {}, "お題を作る"),
    el("p", { class: "muted" }, "元の言葉を録音するか、音声ファイルを読み込みます。"),

    el(
      "div",
      { class: "card" },
      el("h3", {}, "① 録音する"),
      recorder,
    ),
    el(
      "div",
      { class: "card" },
      el("h3", {}, "② または ファイルを読み込む"),
      fileInput,
    ),

    preview,

    el(
      "div",
      { class: "card" },
      el("h3", {}, "③ 答えを入力して保存"),
      el("div", { class: "field" }, answerInput),
      el("div", { class: "field" }, hintInput),
      saveBtn,
    ),
    status,
  );
}
