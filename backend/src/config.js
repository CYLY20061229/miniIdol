import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const rootDir = path.resolve(__dirname, "..");
export const publicDir = path.resolve(rootDir, "public");

export const config = {
  port: Number(process.env.PORT || 3001),
  adminToken: process.env.ADMIN_TOKEN || "change_me",
  musicProvider: process.env.MUSIC_PROVIDER || "mock",
  mureka: {
    apiKey: process.env.MUREKA_API_KEY || "",
    baseUrl: process.env.MUREKA_BASE_URL || "https://api.mureka.ai",
    model: process.env.MUREKA_MODEL || "auto",
    songCount: Number(process.env.MUREKA_SONG_COUNT || 1),
    pollIntervalMs: Number(process.env.MUREKA_POLL_INTERVAL_MS || 5000),
    pollTimeoutMs: Number(process.env.MUREKA_POLL_TIMEOUT_MS || 600000)
  },
  databaseUrl: process.env.DATABASE_URL || "./data/app.sqlite",
  publicBaseUrl: process.env.PUBLIC_BASE_URL || "http://localhost:3001"
};

export function publicUrl(pathname) {
  return `${config.publicBaseUrl}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}
