import { nanoid } from "nanoid";
import { db } from "./database.js";

const rowToCode = (row) =>
  row && {
    id: row.id,
    code: row.code,
    enabled: Boolean(row.enabled),
    used: Boolean(row.used),
    usedByIntentId: row.used_by_intent_id,
    usedAt: row.used_at,
    expiresAt: row.expires_at,
    createdAt: row.created_at
  };

export function insertCode({ code, expiresAt }) {
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO redeem_codes (id, code, enabled, used, expires_at, created_at)
    VALUES (?, ?, 1, 0, ?, ?)
  `).run(nanoid(16), code.toUpperCase(), expiresAt || null, now);
}

export function getCode(code) {
  return rowToCode(db.prepare("SELECT * FROM redeem_codes WHERE code = ?").get(code.trim().toUpperCase()));
}

export function markCodeUsed({ code, intentId }) {
  db.prepare(`
    UPDATE redeem_codes
    SET used = 1, used_by_intent_id = ?, used_at = ?
    WHERE code = ?
  `).run(intentId, new Date().toISOString(), code.trim().toUpperCase());
}

export function listCodes() {
  return db.prepare("SELECT * FROM redeem_codes ORDER BY created_at DESC").all().map(rowToCode);
}
