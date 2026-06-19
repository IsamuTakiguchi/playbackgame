export type QuizSource = "recording" | "upload";

/** ストックされた 1 問。保存するのは順方向（オリジナル）の音声。 */
export interface Quiz {
  id: string;
  answer: string; // 正解（元の言葉）
  hint?: string;
  source: QuizSource;
  mimeType: string; // 通常 "audio/wav"
  audio: Blob; // 順再生（トリム済み WAV）
  durationSec: number;
  createdAt: number;
  playCount: number;
  tags?: string[];
}

/** Bank 画面の一覧表示に使う、音声 Blob を除いた軽量メタ。 */
export type QuizMeta = Omit<Quiz, "audio">;

export type Screen =
  | "home"
  | "bank"
  | "create"
  | "playSetup"
  | "mimic"
  | "reveal";

export interface GameState {
  screen: Screen;
  currentQuiz?: Quiz;
  reversedOriginal?: AudioBuffer;
  mimicBuffer?: AudioBuffer;
  reversedMimic?: AudioBuffer;
  playedIds: string[]; // セッション内での重複回避
}
