import { nanoid } from "nanoid";
import { db } from "./database.js";

export const defaultSteps = [
  { name: "generate_song", label: "正在生成你的出道曲", status: "pending" },
  { name: "generate_cover", label: "正在生成专属封面", status: "pending" },
  { name: "render_video", label: "正在合成封面播放视频", status: "pending" },
  { name: "prepare_downloads", label: "正在整理下载文件", status: "pending" }
];

const rowToJob = (row) =>
  row && {
    id: row.id,
    intentId: row.intent_id,
    status: row.status,
    steps: JSON.parse(row.steps),
    songUrl: row.song_url,
    coverUrl: row.cover_url,
    videoUrl: row.video_url,
    errorMessage: row.error_message,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };

export function createJob({ intentId }) {
  const now = new Date().toISOString();
  const job = {
    id: nanoid(16),
    intentId,
    status: "pending",
    steps: defaultSteps,
    createdAt: now,
    updatedAt: now
  };

  db.prepare(`
    INSERT INTO generation_jobs (
      id, intent_id, status, steps, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?)
  `).run(job.id, job.intentId, job.status, JSON.stringify(job.steps), job.createdAt, job.updatedAt);

  return job;
}

export function getJob(id) {
  return rowToJob(db.prepare("SELECT * FROM generation_jobs WHERE id = ?").get(id));
}

export function updateJob(job) {
  db.prepare(`
    UPDATE generation_jobs
    SET status = ?, steps = ?, song_url = ?, cover_url = ?, video_url = ?, error_message = ?, updated_at = ?
    WHERE id = ?
  `).run(
    job.status,
    JSON.stringify(job.steps),
    job.songUrl || null,
    job.coverUrl || null,
    job.videoUrl || null,
    job.errorMessage || null,
    new Date().toISOString(),
    job.id
  );
}
