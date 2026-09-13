import fs from "node:fs";
import path from "node:path";
import { publicDir, publicUrl } from "../config.js";

function escapeXml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shortText(value, fallback, maxLength = 28) {
  const text = String(value || "").trim();
  return escapeXml((text || fallback).slice(0, maxLength));
}

function paletteFor(profile = {}) {
  const source = `${profile.mood || ""}${profile.genre || ""}${profile.lyricTheme || ""}`.toLowerCase();
  if (/r&b|rnb|夜|慵懒|丝滑/.test(source)) {
    return ["#6f5cff", "#15162f", "#ffcf7a"];
  }
  if (/摇滚|rock|热血|燃/.test(source)) {
    return ["#ff4d6d", "#1b1b1f", "#ffd166"];
  }
  if (/梦幻|清爽|青春|心动|暧昧/.test(source)) {
    return ["#ff6fae", "#7d5cff", "#14d8c8"];
  }
  return ["#7d5cff", "#111225", "#14d8c8"];
}

function createCoverSvg({ profile = {} }) {
  const [primary, secondary, accent] = paletteFor(profile);
  const stageName = shortText(profile.stageName, "DEBUT");
  const genre = shortText(profile.genre, "ORIGINAL POP", 24).toUpperCase();
  const mood = shortText(profile.mood, "SPOTLIGHT", 26);
  const lyricTheme = shortText(profile.lyricTheme, "FIRST STAGE", 32);
  const language = shortText(profile.language, "AI SONG", 18).toUpperCase();

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${primary}"/>
      <stop offset="0.5" stop-color="${secondary}"/>
      <stop offset="1" stop-color="${accent}"/>
    </linearGradient>
    <radialGradient id="disc" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#fff8"/>
      <stop offset="0.18" stop-color="#1b123f"/>
      <stop offset="0.2" stop-color="#ffffff"/>
      <stop offset="0.38" stop-color="#101027"/>
      <stop offset="0.42" stop-color="#ffffff33"/>
      <stop offset="1" stop-color="#05050e"/>
    </radialGradient>
  </defs>
  <rect width="1080" height="1080" fill="url(#bg)"/>
  <rect x="58" y="58" width="964" height="964" rx="36" fill="none" stroke="#fff" stroke-width="8" opacity="0.34"/>
  <text x="540" y="138" text-anchor="middle" font-family="Arial, sans-serif" font-size="46" font-weight="700" fill="#fff" opacity="0.92">${genre}</text>
  <circle cx="540" cy="540" r="330" fill="url(#disc)" opacity="0.9"/>
  <circle cx="540" cy="540" r="86" fill="#fff"/>
  <circle cx="540" cy="540" r="30" fill="#16122f"/>
  <path d="M130 790 C310 650, 430 870, 630 735 S890 650, 970 805" fill="none" stroke="#fff" stroke-width="18" opacity="0.85"/>
  <text x="540" y="875" text-anchor="middle" font-family="Arial, sans-serif" font-size="84" font-weight="800" fill="#fff">${stageName}</text>
  <text x="540" y="935" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" fill="#fff" opacity="0.9">${mood} / ${lyricTheme}</text>
  <text x="540" y="985" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" fill="#fff" opacity="0.78">${language} ORIGINAL AI SONG</text>
</svg>`;
}

export class MockCoverProvider {
  async generateCover({ profile, intentId } = {}) {
    const mediaDir = path.resolve(publicDir, "media");
    fs.mkdirSync(mediaDir, { recursive: true });
    const filename = `cover-${intentId || "mock"}.svg`;
    const filePath = path.resolve(mediaDir, filename);
    fs.writeFileSync(filePath, createCoverSvg({ profile }));
    return { coverUrl: publicUrl(`/media/${filename}`) };
  }
}
