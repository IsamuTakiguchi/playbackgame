import "./style.css";
import { startRouter } from "./ui/router";

const root = document.getElementById("app");
if (root) {
  startRouter(root);
}
