import { getState, subscribe, goTo } from "../game/state";
import { clear } from "./dom";
import { HomeScreen } from "./screens/HomeScreen";
import { BankScreen } from "./screens/BankScreen";
import { CreateQuizScreen } from "./screens/CreateQuizScreen";
import { ModeSelectScreen } from "./screens/ModeSelectScreen";
import { PickQuizScreen } from "./screens/PickQuizScreen";
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
    try {
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
        case "modeSelect":
          node = ModeSelectScreen();
          break;
        case "pick":
          node = await PickQuizScreen();
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
    } catch (err) {
      // 描画中の例外を無言で失敗させない（無反応の原因になる）
      node = ErrorScreen(err);
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

function ErrorScreen(err: unknown): HTMLElement {
  const message = err instanceof Error ? err.message : String(err);
  const screen = document.createElement("div");
  screen.className = "screen";

  const h = document.createElement("h2");
  h.textContent = "おっと、エラーが発生しました";

  const p = document.createElement("p");
  p.className = "status error";
  p.textContent = message;

  const btn = document.createElement("button");
  btn.className = "btn primary big";
  btn.textContent = "← ホームに戻る";
  btn.addEventListener("click", () => goTo("home"));

  const actions = document.createElement("div");
  actions.className = "bottom-actions";
  actions.append(btn);

  screen.append(h, p, actions);
  return screen;
}
