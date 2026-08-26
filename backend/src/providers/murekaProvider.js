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

function createOriginalLyrics() {
  return `[Verse]
Lights are waking under my feet
First breath shaking with the beat
Mirror flashes, I step through
A brand new name in something true

[Pre-Chorus]
Heart like thunder, soft like rain
I turn the doubt into a flame
Every whisper starts to rise
Tonight I meet my own spotlight

[Chorus]
This is my debut, shining in motion
New star, new wave, bright as the ocean
Hands up, hearts loud, we are alive
I sing my first dream into the night

[Verse]
Fresh air dancing in the room
Secret glances, silver bloom
Every step becomes a sign
The stage is yours and it is mine

[Chorus]
This is my debut, shining in motion
New star, new wave, bright as the ocean
Hands up, hearts loud, we are alive
I sing my first dream into the night`;
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

  async createSongTask({ prompt }) {
    const body = {
      lyrics: createOriginalLyrics(),
      model: this.model || "auto",
      n: this.songCount,
      prompt: truncate(prompt, 1024),
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

  async generatePreview({ prompt }) {
    if (!this.apiKey) {
      return this.mock.generatePreview({ prompt });
    }

    const { taskId } = await this.createSongTask({
      prompt: `${prompt} Short preview-oriented arrangement, concise intro and chorus.`
    });
    const { songUrl } = await this.pollSongTask(taskId);
    return {
      previewId: taskId,
      audioUrl: songUrl,
      duration: null
    };
  }

  async generateFullSong({ prompt }) {
    if (!this.apiKey) {
      return this.mock.generateFullSong({ prompt });
    }

    const { taskId } = await this.createSongTask({ prompt });
    const { songUrl, task } = await this.pollSongTask(taskId);
    return {
      songUrl,
      duration: task?.choices?.[0]?.duration_milliseconds
        ? Math.round(task.choices[0].duration_milliseconds / 1000)
        : null
    };
  }
}
