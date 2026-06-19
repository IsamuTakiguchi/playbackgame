import "./style.css";
import { startRouter } from "./ui/router";
import { confettiLayer } from "./ui/illustrations";
import { unlockAudio } from "./audio/AudioEngine";

// 画面をまたいで残る背景の紙吹雪レイヤー
document.body.prepend(confettiLayer());

// 最初のタップで AudioContext をアンロック（iOS Safari 対策）
document.addEventListener("pointerdown", () => unlockAudio(), { once: true });

const root = document.getElementById("app");
if (root) {
  startRouter(root);
}
