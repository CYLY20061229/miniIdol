import fs from "node:fs";
import path from "node:path";
import { publicDir, publicUrl } from "../config.js";

const svgCover = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ff6fae"/>
      <stop offset="0.45" stop-color="#7d5cff"/>
      <stop offset="1" stop-color="#14d8c8"/>
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
  <circle cx="540" cy="540" r="330" fill="url(#disc)" opacity="0.9"/>
  <circle cx="540" cy="540" r="86" fill="#fff"/>
  <circle cx="540" cy="540" r="30" fill="#16122f"/>
  <path d="M130 790 C310 650, 430 870, 630 735 S890 650, 970 805" fill="none" stroke="#fff" stroke-width="18" opacity="0.85"/>
  <text x="540" y="160" text-anchor="middle" font-family="Arial, sans-serif" font-size="64" font-weight="700" fill="#fff">DEBUT PROJECT</text>
  <text x="540" y="958" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" fill="#fff">ORIGINAL AI SONG</text>
</svg>`;

export class MockCoverProvider {
  async generateCover() {
    const mediaDir = path.resolve(publicDir, "media");
    fs.mkdirSync(mediaDir, { recursive: true });
    const filePath = path.resolve(mediaDir, "mock-cover.svg");
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, svgCover);
    }
    return { coverUrl: publicUrl("/media/mock-cover.svg") };
  }
}
