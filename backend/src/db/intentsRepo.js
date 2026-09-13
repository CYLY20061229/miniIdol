import { nanoid } from "nanoid";
import { db } from "./database.js";

const rowToIntent = (row) =>
  row && {
    id: row.id,
    originalInput: row.original_input,
    originalInputSummary: row.original_input_summary,
    profile: JSON.parse(row.profile_json || "{}"),
    safeMusicPrompt: row.safe_music_prompt,
    removedReferences: JSON.parse(row.removed_references || "[]"),
    status: row.status,
    previewAudioUrl: row.preview_audio_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };

export function createIntent({ originalInput, originalInputSummary, profile = {}, safeMusicPrompt, removedReferences }) {
  const now = new Date().toISOString();
  const intent = {
    id: nanoid(16),
    originalInput,
    originalInputSummary,
    profile,
    safeMusicPrompt,
    removedReferences,
    status: "created",
    createdAt: now,
    updatedAt: now
  };

  db.prepare(`
    INSERT INTO intents (
      id, original_input, original_input_summary, profile_json, safe_music_prompt,
      removed_references, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    intent.id,
    intent.originalInput,
    intent.originalInputSummary,
    JSON.stringify(intent.profile),
    intent.safeMusicPrompt,
    JSON.stringify(intent.removedReferences),
    intent.status,
    intent.createdAt,
    intent.updatedAt
  );

  return intent;
}

export function getIntent(id) {
  return rowToIntent(db.prepare("SELECT * FROM intents WHERE id = ?").get(id));
}

export function updateIntentStatus(id, status) {
  db.prepare("UPDATE intents SET status = ?, updated_at = ? WHERE id = ?").run(status, new Date().toISOString(), id);
}

export function setIntentPreview(id, previewAudioUrl) {
  db.prepare("UPDATE intents SET preview_audio_url = ?, updated_at = ? WHERE id = ?").run(
    previewAudioUrl,
    new Date().toISOString(),
    id
  );
}
