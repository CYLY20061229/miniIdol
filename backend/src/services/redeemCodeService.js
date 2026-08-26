import { customAlphabet } from "nanoid";
import { db } from "../db/database.js";
import { getCode, insertCode, listCodes, markCodeUsed } from "../db/codesRepo.js";

const makeToken = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 8);

export function generateCodes({ count, prefix = "DEBUT", expiresAt = null }) {
  const safeCount = Math.max(1, Math.min(Number(count) || 1, 200));
  const safePrefix = String(prefix || "DEBUT").trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
  const codes = [];

  const tx = db.transaction(() => {
    while (codes.length < safeCount) {
      const code = `${safePrefix}-${makeToken()}`;
      try {
        insertCode({ code, expiresAt });
        codes.push(code);
      } catch {
        // Collision is unlikely; retry quietly.
      }
    }
  });

  tx();
  return codes;
}

export function validateAndUseCode({ code, intentId }) {
  const normalized = String(code || "").trim().toUpperCase();
  if (!normalized) {
    return { ok: false, message: "兑换码无效" };
  }

  const redeemCode = getCode(normalized);
  if (!redeemCode) return { ok: false, message: "兑换码无效" };
  if (!redeemCode.enabled) return { ok: false, message: "兑换码无效" };
  if (redeemCode.used) return { ok: false, message: "兑换码已使用" };
  if (redeemCode.expiresAt && new Date(redeemCode.expiresAt).getTime() < Date.now()) {
    return { ok: false, message: "兑换码已过期" };
  }

  markCodeUsed({ code: normalized, intentId });
  return { ok: true };
}

export { listCodes };
