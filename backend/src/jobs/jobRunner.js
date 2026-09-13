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

async function runConcurrentStep(job, name, assignResult, fn) {
  setStep(job, name, "running");
  updateJob(job);
  const result = await fn();
  assignResult(result);
  setStep(job, name, "success");
  updateJob(job);
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

      const parallelResults = await Promise.allSettled([
        runConcurrentStep(
          job,
          "generate_song",
          (song) => {
            job.songUrl = song.songUrl;
          },
          () =>
            musicProvider.generateFullSong({
              prompt: intent.safeMusicPrompt,
              profile: intent.profile,
              removedReferences: intent.removedReferences
            })
        ),
        runConcurrentStep(
          job,
          "generate_cover",
          (cover) => {
            job.coverUrl = cover.coverUrl;
          },
          () =>
            coverProvider.generateCover({
              originalInputSummary: intent.originalInputSummary,
              profile: intent.profile,
              removedReferences: intent.removedReferences,
              intentId: intent.id
            })
        )
      ]);
      const rejected = parallelResults.find((result) => result.status === "rejected");
      if (rejected) {
        throw rejected.reason;
      }

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
