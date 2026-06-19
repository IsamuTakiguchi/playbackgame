import "./style.css";
import { startRouter } from "./ui/router";
import { confettiLayer } from "./ui/illustrations";

// 画面をまたいで残る背景の紙吹雪レイヤー
document.body.prepend(confettiLayer());

const root = document.getElementById("app");
if (root) {
  startRouter(root);
}
