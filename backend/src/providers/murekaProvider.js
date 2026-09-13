import { config } from "../config.js";
import { MockMusicProvider } from "./mockMusicProvider.js";

const terminalSuccess = new Set(["succeeded"]);
const terminalFailure = new Set(["failed", "timeouted", "cancelled"]);
const processingStatuses = new Set(["preparing", "queued", "running", "streaming", "reviewing"]);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function truncate(text, maxLength) {
  return String(text || "").slice(0, maxLength);
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sanitizeProfileText(value, removedReferences = [], fallback = "") {
  let text = String(value || fallback).trim();
  for (const reference of removedReferences || []) {
    if (!reference) continue;
    text = text.replace(new RegExp(escapeRegExp(reference), "gi"), "original inspiration");
  }
  return text.replace(/像|模仿|复刻|同款声音|voice clone/gi, "inspired by").slice(0, 80);
}

function cleanLyricText(value, fallback, removedReferences = []) {
  return sanitizeProfileText(value, removedReferences, fallback);
}

function wantsEnglish(language = "") {
  return /英|english/i.test(language) && !/中英|双语|混合/i.test(language);
}

function createOriginalLyrics(profile = {}, removedReferences = []) {
  const title = cleanLyricText(profile.songTitle, "Debut Light", removedReferences);
  const theme = cleanLyricText(profile.lyricTheme, "第一次站上舞台，心动与自我闪耀", removedReferences);
  const stageName = cleanLyricText(profile.stageName, "我", removedReferences);

  if (wantsEnglish(profile.language)) {
    return `[Title]
${title}

[Verse]
I step into the light with a brand new name
Every heartbeat learns the rhythm of the stage
Soft sparks rising when the room gets loud
I find my own shine in the moving crowd

[Pre-Chorus]
This little dream is turning bright
I hold the moment, I own the night

[Chorus]
Call me ${stageName}, this is my debut
Fresh like the morning, shining through
${theme}
I sing it out and make it true`;
  }

  return `[歌名]
${title}

[主歌]
灯光落下来的时候我听见心跳
第一次站上这里也想保持微笑
风吹过裙摆 像某个秘密讯号
我把紧张都变成闪耀

[预副歌]
靠近一点 梦就亮一点
这一刻由我自己主演

[副歌]
我是${stageName} 这是我的出道宣言
${theme}
清新的风吹向舞台中间
把第一首歌唱给全世界听见`;
}

function getTaskId(responseJson) {
  return responseJson?.id || responseJson?.task_id || responseJson?.taskId;
}

function extractSongUrl(taskJson) {
  const choices = Array.isArray(taskJson?.choices) ? taskJson.choices : [];
  const firstChoice = choices[0] || {};
  const candidates = [
    firstChoice.url,
    firstChoice.audio_url,
    firstChoice.mp3_url,
    firstChoice.song_url,
    firstChoice.stream_url,
    firstChoice?.song?.url,
    firstChoice?.song?.audio_url,
    firstChoice?.song?.mp3_url
  ];

  return candidates.find((url) => typeof url === "string" && url.startsWith("http"));
}

function buildErrorMessage(prefix, body) {
  const apiMessage = body?.error?.message || body?.message || body?.failed_reason;
  const traceId = body?.trace_id ? ` trace_id=${body.trace_id}` : "";
  return `${prefix}${apiMessage ? `: ${apiMessage}` : ""}${traceId}`;
}

export class MurekaProvider {
  constructor() {
    this.mock = new MockMusicProvider();
    this.baseUrl = config.mureka.baseUrl.replace(/\/+$/, "");
    this.apiKey = config.mureka.apiKey;
    this.model = config.mureka.model;
    this.songCount = Math.max(1, Math.min(config.mureka.songCount || 1, 3));
    this.pollIntervalMs = config.mureka.pollIntervalMs;
    this.pollTimeoutMs = config.mureka.pollTimeoutMs;
  }

  async requestJson(pathname, options = {}) {
    if (!this.apiKey) {
      throw new Error("MUREKA_API_KEY is not configured");
    }

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
      throw new Error(buildErrorMessage(`Mureka API ${response.status}`, body));
    }

    return body;
  }

  async createSongTask({ prompt, profile = {}, removedReferences = [] }) {
    const title = cleanLyricText(profile.songTitle, "Original Debut Song", removedReferences);
    const lyricTheme = sanitizeProfileText(profile.lyricTheme, removedReferences);
    const language = sanitizeProfileText(profile.language, removedReferences);
    const promptWithProfile = [
      prompt,
      `Song title: "${title}".`,
      lyricTheme ? `Lyrics must center on: ${lyricTheme}.` : "",
      language ? `Lyrics language must be: ${language}.` : ""
    ].filter(Boolean).join(" ");

    const body = {
      lyrics: createOriginalLyrics(profile, removedReferences),
      model: this.model || "auto",
      n: this.songCount,
      prompt: truncate(promptWithProfile, 1200),
      title,
      stream: false
    };

    const task = await this.requestJson("/v1/song/generate", {
      method: "POST",
      body: JSON.stringify(body)
    });

    const taskId = getTaskId(task);
    if (!taskId) {
      throw new Error("Mureka did not return a task id");
    }

    return { taskId, task };
  }

  async pollSongTask(taskId) {
    const startedAt = Date.now();

    while (Date.now() - startedAt < this.pollTimeoutMs) {
      const task = await this.requestJson(`/v1/song/query/${encodeURIComponent(taskId)}`, {
        method: "GET"
      });
      const status = task?.status;

      if (terminalSuccess.has(status)) {
        const songUrl = extractSongUrl(task);
        if (!songUrl) {
          throw new Error("Mureka task succeeded but no song URL was found in choices");
        }
        return { task, songUrl };
      }

      if (terminalFailure.has(status)) {
        throw new Error(buildErrorMessage(`Mureka task ${status}`, task));
      }

      if (!processingStatuses.has(status)) {
        throw new Error(`Unknown Mureka task status: ${status || "empty"}`);
      }

      await sleep(this.pollIntervalMs);
    }

    throw new Error(`Mureka polling timed out after ${this.pollTimeoutMs}ms`);
  }

  async generatePreview({ prompt, profile, removedReferences }) {
    if (!this.apiKey) {
      return this.mock.generatePreview({ prompt });
    }

    const { taskId } = await this.createSongTask({
      prompt: `${prompt} Short preview-oriented arrangement, concise intro and chorus.`,
      profile,
      removedReferences
    });
    const { songUrl } = await this.pollSongTask(taskId);
    return {
      previewId: taskId,
      audioUrl: songUrl,
      duration: null
    };
  }

  async generateFullSong({ prompt, profile, removedReferences }) {
    if (!this.apiKey) {
      return this.mock.generateFullSong({ prompt });
    }

    const { taskId } = await this.createSongTask({ prompt, profile, removedReferences });
    const { songUrl, task } = await this.pollSongTask(taskId);
    return {
      songUrl,
      duration: task?.choices?.[0]?.duration_milliseconds
        ? Math.round(task.choices[0].duration_milliseconds / 1000)
        : null
    };
  }
}
