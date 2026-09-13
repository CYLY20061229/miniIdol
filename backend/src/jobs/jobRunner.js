import { getIntent, updateIntentStatus } from "../db/intentsRepo.js";
import { getJob, updateJob } from "../db/jobsRepo.js";
import { createMusicProvider } from "../providers/musicProvider.js";
import { createCoverProvider } from "../providers/coverProvider.js";
import { renderCoverVideo } from "../services/videoRenderer.js";

const runningJobs = new Set();

function setStep(job, name, status) {
  job.steps = job.steps.map((step) => (step.name === name ? { ...step, status } : step));
}

async function runStep(job, name, fn) {
  setStep(job, name, "running");
  updateJob(job);
  const result = await fn();
  setStep(job, name, "success");
  updateJob(job);
  return result;
}

export function startGenerationJob(jobId) {
  if (runningJobs.has(jobId)) return;
  runningJobs.add(jobId);

  setTimeout(async () => {
    const job = getJob(jobId);
    if (!job) {
      runningJobs.delete(jobId);
      return;
    }

    try {
      const intent = getIntent(job.intentId);
      if (!intent) throw new Error("Intent not found");

      job.status = "running";
      updateJob(job);
      updateIntentStatus(intent.id, "generating");

      const musicProvider = createMusicProvider();
      const coverProvider = createCoverProvider();

      const song = await runStep(job, "generate_song", () =>
        musicProvider.generateFullSong({ prompt: intent.safeMusicPrompt })
      );
      job.songUrl = song.songUrl;
      updateJob(job);

      const cover = await runStep(job, "generate_cover", () =>
        coverProvider.generateCover({
          originalInputSummary: intent.originalInputSummary,
          profile: intent.profile,
          intentId: intent.id
        })
      );
      job.coverUrl = cover.coverUrl;
      updateJob(job);

      const video = await runStep(job, "render_video", () =>
        renderCoverVideo({ coverUrl: job.coverUrl, songUrl: job.songUrl, jobId: job.id })
      );
      job.videoUrl = video.videoUrl;
      updateJob(job);

      await runStep(job, "prepare_downloads", async () => true);

      job.status = "success";
      updateJob(job);
      updateIntentStatus(intent.id, "completed");
    } catch (error) {
      const latest = getJob(jobId) || job;
      latest.status = "failed";
      latest.errorMessage = error instanceof Error ? error.message : "生成失败";
      latest.steps = latest.steps.map((step) =>
        step.status === "running" ? { ...step, status: "failed" } : step
      );
      updateJob(latest);
      if (latest.intentId) updateIntentStatus(latest.intentId, "failed");
    } finally {
      runningJobs.delete(jobId);
    }
  }, 0);
}
