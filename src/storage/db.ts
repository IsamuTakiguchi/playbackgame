import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Quiz } from "../game/types";

interface ReverseGameDB extends DBSchema {
  quizzes: {
    key: string;
    value: Quiz;
    indexes: {
      "by-createdAt": number;
      "by-playCount": number;
    };
  };
}

const DB_NAME = "reverse-game";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<ReverseGameDB>> | null = null;

export function getDb(): Promise<IDBPDatabase<ReverseGameDB>> {
  if (!dbPromise) {
    dbPromise = openDB<ReverseGameDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore("quizzes", { keyPath: "id" });
        store.createIndex("by-createdAt", "createdAt");
        store.createIndex("by-playCount", "playCount");
      },
    });
  }
  return dbPromise;
}
