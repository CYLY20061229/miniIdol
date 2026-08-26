import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { config, rootDir } from "../config.js";

const dbPath = path.isAbsolute(config.databaseUrl)
  ? config.databaseUrl
  : path.resolve(rootDir, config.databaseUrl);

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS intents (
      id TEXT PRIMARY KEY,
      original_input TEXT NOT NULL,
      original_input_summary TEXT NOT NULL,
      safe_music_prompt TEXT NOT NULL,
      removed_references TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'created',
      preview_audio_url TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS redeem_codes (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      enabled INTEGER NOT NULL DEFAULT 1,
      used INTEGER NOT NULL DEFAULT 0,
      used_by_intent_id TEXT,
      used_at TEXT,
      expires_at TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (used_by_intent_id) REFERENCES intents(id)
    );

    CREATE TABLE IF NOT EXISTS generation_jobs (
      id TEXT PRIMARY KEY,
      intent_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      steps TEXT NOT NULL,
      song_url TEXT,
      cover_url TEXT,
      video_url TEXT,
      error_message TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (intent_id) REFERENCES intents(id)
    );
  `);
}
