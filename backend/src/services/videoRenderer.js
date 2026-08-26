import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { publicDir, publicUrl } from "../config.js";

const execFileAsync = promisify(execFile);

async function hasFfmpeg() {
  try {
    await execFileAsync("ffmpeg", ["-version"]);
    return true;
  } catch {
    return false;
  }
}

function ensureMockVideo() {
  const mediaDir = path.resolve(publicDir, "media");
  fs.mkdirSync(mediaDir, { recursive: true });
  const filePath = path.resolve(mediaDir, "mock-video.txt");
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "Mock video placeholder. Install ffmpeg to render mp4 files.");
  }
  return publicUrl("/media/mock-video.txt");
}

export async function renderCoverVideo({ coverUrl, songUrl, jobId }) {
  if (!(await hasFfmpeg())) {
    return { videoUrl: ensureMockVideo(), usedMock: true };
  }

  if (!coverUrl.startsWith("http") || !songUrl.startsWith("http")) {
    return { videoUrl: ensureMockVideo(), usedMock: true };
  }

  const outputDir = path.resolve(publicDir, "generated");
  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.resolve(outputDir, `${jobId}.mp4`);

  try {
    await execFileAsync("ffmpeg", [
      "-y",
      "-loop",
      "1",
      "-i",
      coverUrl,
      "-i",
      songUrl,
      "-c:v",
      "libx264",
      "-tune",
      "stillimage",
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      "-pix_fmt",
      "yuv420p",
      "-shortest",
      outputPath
    ]);
    return { videoUrl: publicUrl(`/generated/${jobId}.mp4`), usedMock: false };
  } catch {
    return { videoUrl: ensureMockVideo(), usedMock: true };
  }
}
