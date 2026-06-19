import { getState, subscribe } from "../game/state";
import { clear } from "./dom";
import { HomeScreen } from "./screens/HomeScreen";
import { BankScreen } from "./screens/BankScreen";
import { CreateQuizScreen } from "./screens/CreateQuizScreen";
import { PlaySetupScreen } from "./screens/PlaySetupScreen";
import { MimicScreen } from "./screens/MimicScreen";
import { RevealScreen } from "./screens/RevealScreen";

/**
 * 現在の screen に応じて 1 画面を描画する。
 * 画面ビルダは同期 / 非同期どちらも許容する（DB アクセスがあるため）。
 */
export function startRouter(root: HTMLElement): void {
  let renderToken = 0;

  const render = async () => {
    const token = ++renderToken;
    const { screen } = getState();

    let node: HTMLElement;
    switch (screen) {
      case "home":
        node = await HomeScreen();
        break;
      case "bank":
        node = await BankScreen();
        break;
      case "create":
        node = CreateQuizScreen();
        break;
      case "playSetup":
        node = await PlaySetupScreen();
        break;
      case "mimic":
        node = MimicScreen();
        break;
      case "reveal":
        node = RevealScreen();
        break;
      default:
        node = HomeScreenFallback();
    }

    // 非同期描画中に状態が変わっていたら破棄
    if (token !== renderToken) return;
    clear(root);
    root.append(node);
  };

  subscribe(() => void render());
  void render();
}

function HomeScreenFallback(): HTMLElement {
  const div = document.createElement("div");
  div.textContent = "...";
  return div;
}
