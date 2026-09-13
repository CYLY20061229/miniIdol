import fs from "node:fs";
import path from "node:path";
import { config, publicDir, publicUrl } from "../config.js";
import { MockCoverProvider } from "./mockCoverProvider.js";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function safeText(value, removedReferences = []) {
  let text = String(value || "").trim();
  for (const reference of removedReferences || []) {
    if (!reference) continue;
    text = text.replace(new RegExp(escapeRegExp(reference), "gi"), "original inspiration");
  }
  return text.replace(/像|模仿|复刻|同款肖像|同款logo/gi, "inspired by").slice(0, 120);
}

function coverPrompt(profile = {}, removedReferences = []) {
  const stageName = safeText(profile.stageName, removedReferences);
  const songTitle = safeText(profile.songTitle, removedReferences);
  const mood = safeText(profile.mood, removedReferences);
  const genre = safeText(profile.genre, removedReferences);
  const lyricTheme = safeText(profile.lyricTheme, removedReferences);

  return [
    "Square 1:1 debut single album cover, fresh bright K-pop inspired visual design, no real person portrait, no real group logo, no copyrighted character, no readable real artist references.",
    stageName ? `Stage name typography concept: ${stageName}.` : "",
    songTitle ? `Song title typography: ${songTitle}.` : "",
    mood ? `Mood: ${mood}.` : "",
    genre ? `Music genre visual cues: ${genre}.` : "",
    lyricTheme ? `Lyric theme visual metaphor: ${lyricTheme}.` : "",
    "Use pastel pink, sky blue, clean white light, vinyl or stage spotlight elements, youthful polished idol debut proposal style."
  ].filter(Boolean).join(" ");
}

function getTaskId(body) {
  return body?.output?.task_id || body?.task_id || body?.id;
}

function getImageUrl(body) {
  const results = body?.output?.results || body?.results || [];
  const first = Array.isArray(results) ? results[0] : null;
  return first?.url || first?.image_url || body?.output?.url || body?.url;
}

function taskStatus(body) {
  return body?.output?.task_status || body?.task_status || body?.status;
}

function extFromContentType(contentType) {
  if (contentType?.includes("png")) return "png";
  if (contentType?.includes("webp")) return "webp";
  return "jpg";
}

export class QwenCoverProvider {
  constructor() {
    this.mock = new MockCoverProvider();
    this.apiKey = config.qwenImage.apiKey;
    this.baseUrl = config.qwenImage.baseUrl.replace(/\/+$/, "");
    this.model = config.qwenImage.model;
    this.size = config.qwenImage.size;
    this.pollIntervalMs = config.qwenImage.pollIntervalMs;
    this.pollTimeoutMs = config.qwenImage.pollTimeoutMs;
  }

  async requestJson(pathname, options = {}) {
    const response = await fetch(`${this.baseUrl}${pathname}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(body?.message || body?.error?.message || `Qwen image API ${response.status}`);
    }
    return body;
  }

  async createTask(profile, removedReferences) {
    const body = await this.requestJson("/api/v1/services/aigc/text2image/image-synthesis", {
      method: "POST",
      headers: {
        "X-DashScope-Async": "enable"
      },
      body: JSON.stringify({
        model: this.model,
        input: {
          prompt: coverPrompt(profile, removedReferences),
          negative_prompt: "real celebrity, real idol face, real group logo, copyrighted character, ugly text, watermark, low resolution"
        },
        parameters: {
          size: this.size,
          n: 1
        }
      })
    });

    const taskId = getTaskId(body);
    if (!taskId) {
      throw new Error("Qwen image API did not return task_id");
    }
    return taskId;
  }

  async pollTask(taskId) {
    const startedAt = Date.now();
    while (Date.now() - startedAt < this.pollTimeoutMs) {
      const body = await this.requestJson(`/api/v1/tasks/${encodeURIComponent(taskId)}`, { method: "GET" });
      const status = taskStatus(body);
      if (status === "SUCCEEDED") {
        const imageUrl = getImageUrl(body);
        if (!imageUrl) throw new Error("Qwen image task succeeded but no image URL was found");
        return imageUrl;
      }
      if (status === "FAILED" || status === "CANCELED" || status === "UNKNOWN") {
        throw new Error(body?.output?.message || `Qwen image task ${status}`);
      }
      await sleep(this.pollIntervalMs);
    }
    throw new Error(`Qwen image polling timed out after ${this.pollTimeoutMs}ms`);
  }

  async downloadImage(imageUrl, intentId) {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Failed to download Qwen cover image: ${response.status}`);

    const contentType = response.headers.get("content-type") || "";
    const ext = extFromContentType(contentType);
    const outputDir = path.resolve(publicDir, "generated");
    fs.mkdirSync(outputDir, { recursive: true });
    const filename = `cover-${intentId || Date.now()}.${ext}`;
    const filePath = path.resolve(outputDir, filename);
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(filePath, buffer);
    return publicUrl(`/generated/${filename}`);
  }

  async generateCover({ originalInputSummary, profile, removedReferences, intentId }) {
    if (!this.apiKey) {
      return this.mock.generateCover({ originalInputSummary, profile, intentId });
    }

    const taskId = await this.createTask(profile, removedReferences);
    const imageUrl = await this.pollTask(taskId);
    const coverUrl = await this.downloadImage(imageUrl, intentId);
    return { coverUrl };
  }
}
