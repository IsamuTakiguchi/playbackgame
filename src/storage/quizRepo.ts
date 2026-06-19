import { getDb } from "./db";
import type { Quiz, QuizMeta } from "../game/types";
import { encodeWav } from "../audio/encode-wav";
import { uuid } from "../utils/id";

export interface NewQuizInput {
  answer: string;
  hint?: string;
  source: Quiz["source"];
  tags?: string[];
}

/** トリム済み AudioBuffer を WAV にして保存する。 */
export async function addQuiz(
  input: NewQuizInput,
  buffer: AudioBuffer,
): Promise<Quiz> {
  const blob = encodeWav(buffer);
  const quiz: Quiz = {
    id: uuid(),
    answer: input.answer.trim(),
    hint: input.hint?.trim() || undefined,
    source: input.source,
    mimeType: "audio/wav",
    audio: blob,
    durationSec: buffer.duration,
    createdAt: Date.now(),
    playCount: 0,
    tags: input.tags,
  };
  const db = await getDb();
  await db.put("quizzes", quiz);
  return quiz;
}

/** 音声 Blob を除いた一覧（新しい順）。 */
export async function listQuizzes(): Promise<QuizMeta[]> {
  const db = await getDb();
  const all = await db.getAllFromIndex("quizzes", "by-createdAt");
  return all
    .map(stripAudio)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function countQuizzes(): Promise<number> {
  const db = await getDb();
  return db.count("quizzes");
}

export async function getQuiz(id: string): Promise<Quiz | undefined> {
  const db = await getDb();
  return db.get("quizzes", id);
}

/**
 * ランダムに 1 問選ぶ。playCount が小さいものを優先（軽い重み付け）して
 * 同じ問題が連続しにくいようにする。excludeIds はセッション内の既出。
 */
export async function getRandomQuiz(
  excludeIds: string[] = [],
): Promise<Quiz | undefined> {
  const db = await getDb();
  const all = await db.getAll("quizzes");
  if (all.length === 0) return undefined;

  const exclude = new Set(excludeIds);
  let pool = all.filter((q) => !exclude.has(q.id));
  if (pool.length === 0) pool = all; // 全部出題済みなら全体から

  // playCount の最小集合からランダムに選ぶ
  const minPlay = Math.min(...pool.map((q) => q.playCount));
  const leastPlayed = pool.filter((q) => q.playCount === minPlay);
  return leastPlayed[Math.floor(Math.random() * leastPlayed.length)];
}

export async function incrementPlayCount(id: string): Promise<void> {
  const db = await getDb();
  const quiz = await db.get("quizzes", id);
  if (!quiz) return;
  quiz.playCount += 1;
  await db.put("quizzes", quiz);
}

export async function updateQuizMeta(
  id: string,
  patch: Partial<Pick<Quiz, "answer" | "hint" | "tags">>,
): Promise<void> {
  const db = await getDb();
  const quiz = await db.get("quizzes", id);
  if (!quiz) return;
  if (patch.answer !== undefined) quiz.answer = patch.answer.trim();
  if (patch.hint !== undefined) quiz.hint = patch.hint.trim() || undefined;
  if (patch.tags !== undefined) quiz.tags = patch.tags;
  await db.put("quizzes", quiz);
}

export async function deleteQuiz(id: string): Promise<void> {
  const db = await getDb();
  await db.delete("quizzes", id);
}

export async function clearAll(): Promise<void> {
  const db = await getDb();
  await db.clear("quizzes");
}

function stripAudio(quiz: Quiz): QuizMeta {
  const { audio: _audio, ...meta } = quiz;
  void _audio;
  return meta;
}
