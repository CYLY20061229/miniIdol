import fs from "node:fs";
import path from "node:path";
import { publicDir, publicUrl } from "../config.js";

function createToneWav({ durationSeconds, sampleRate = 44100 }) {
  const sampleCount = Math.floor(durationSeconds * sampleRate);
  const dataSize = sampleCount * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  const notes = [261.63, 329.63, 392, 523.25, 440, 392, 329.63, 293.66];

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < sampleCount; i += 1) {
    const t = i / sampleRate;
    const beat = Math.floor(t * 2) % notes.length;
    const frequency = notes[beat];
    const envelope = Math.min(1, t * 6, (durationSeconds - t) * 6);
    const sample = Math.sin(2 * Math.PI * frequency * t) * 0.22 * envelope;
    buffer.writeInt16LE(Math.max(-1, Math.min(1, sample)) * 32767, 44 + i * 2);
  }

  return buffer;
}

function ensureMockAudio(filename, durationSeconds) {
  const mediaDir = path.resolve(publicDir, "media");
  fs.mkdirSync(mediaDir, { recursive: true });
  const filePath = path.resolve(mediaDir, filename);
  const shouldWrite = !fs.existsSync(filePath) || fs.statSync(filePath).size < 1000;
  if (shouldWrite) {
    fs.writeFileSync(filePath, createToneWav({ durationSeconds }));
  }
  return publicUrl(`/media/${filename}`);
}

export class MockMusicProvider {
  async generatePreview() {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      previewId: "mock-preview",
      audioUrl: ensureMockAudio("mock-preview.wav", 8),
      duration: 18
    };
  }

  async generateFullSong() {
    await new Promise((resolve) => setTimeout(resolve, 900));
    return {
      songUrl: ensureMockAudio("mock-song.wav", 24),
      duration: 24
    };
  }
}
