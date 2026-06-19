import "./style.css";
import { startRouter } from "./ui/router";
import { confettiLayer } from "./ui/illustrations";
import { unlockAudio } from "./audio/AudioEngine";

// 画面外で起きたエラーも必ず画面に表示する（スマホはコンソールが見えないため）
function showFatal(msg: string): void {
  let banner = document.getElementById("fatal-banner");
  if (!banner) {
    banner = document.createElement("div");
    banner.id = "fatal-banner";
    banner.style.cssText =
      "position:fixed;left:0;right:0;bottom:0;z-index:9999;background:#ff5d8f;color:#fff;" +
      "padding:12px 14px;font:14px/1.5 system-ui,sans-serif;white-space:pre-wrap;" +
      "max-height:50vh;overflow:auto;";
    document.body.appendChild(banner);
  }
  banner.textContent = "⚠ エラー: " + msg + "\n(この文面を伝えてください)";
}

window.addEventListener("error", (e) => {
  showFatal(e.message || String((e as ErrorEvent).error) || "unknown error");
});
window.addEventListener("unhandledrejection", (e) => {
  const reason = (e as PromiseRejectionEvent).reason;
  showFatal("Promise: " + (reason?.message || String(reason)));
});

// 画面をまたいで残る背景の紙吹雪レイヤー
document.body.prepend(confettiLayer());

// 最初のユーザー操作で AudioContext をアンロック（iOS Safari 対策）。
// touchend/pointerdown/mousedown/click のどれか最初の1回で実行し、全リスナ解除。
const UNLOCK_EVENTS = ["touchend", "pointerdown", "mousedown", "click", "keydown"];
function onFirstGesture(): void {
  unlockAudio();
  for (const ev of UNLOCK_EVENTS) {
    document.removeEventListener(ev, onFirstGesture);
  }
}
for (const ev of UNLOCK_EVENTS) {
  document.addEventListener(ev, onFirstGesture, { passive: true });
}

const root = document.getElementById("app");
if (root) {
  startRouter(root);
}
