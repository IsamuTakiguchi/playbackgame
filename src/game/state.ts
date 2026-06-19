import type { GameState, Screen } from "./types";
import { stopPlayback } from "../audio/AudioEngine";

/**
 * アプリ全体の状態を 1 つ持つ最小ストア。
 * 状態が変わるたびに購読者（router）へ通知して再描画する。
 */

const state: GameState = {
  screen: "home",
  playedIds: [],
};

type Listener = (s: GameState) => void;
const listeners = new Set<Listener>();

export function getState(): GameState {
  return state;
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify(): void {
  for (const fn of listeners) fn(state);
}

/** 画面遷移。遷移時に再生中の音は止める。 */
export function goTo(screen: Screen): void {
  stopPlayback();
  state.screen = screen;
  notify();
}

/** 任意フィールドを更新（再描画はしない）。 */
export function patch(p: Partial<GameState>): void {
  Object.assign(state, p);
}

/** 更新 + 再描画。 */
export function setState(p: Partial<GameState>): void {
  patch(p);
  notify();
}

export function markPlayed(id: string): void {
  if (!state.playedIds.includes(id)) state.playedIds.push(id);
}

/** プレイ用の一時データをクリアして HOME へ。 */
export function resetRound(): void {
  state.currentQuiz = undefined;
  state.reversedOriginal = undefined;
  state.mimicBuffer = undefined;
  state.reversedMimic = undefined;
}
