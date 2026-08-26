import express from "express";
import cors from "cors";
import { config, publicDir } from "./config.js";
import { initDb, db } from "./db/database.js";
import { createIntent, getIntent, setIntentPreview, updateIntentStatus } from "./db/intentsRepo.js";
import { createJob, getJob } from "./db/jobsRepo.js";
import { translateStyle } from "./services/styleTranslator.js";
import { createMusicProvider } from "./providers/musicProvider.js";
import { generateCodes, listCodes, validateAndUseCode } from "./services/redeemCodeService.js";
import { startGenerationJob } from "./jobs/jobRunner.js";
import { requireAdmin } from "./middleware/adminAuth.js";

initDb();

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.static(publicDir));

function publicIntent(intent) {
  return {
    intentId: intent.id,
    originalInputSummary: intent.originalInput,
    status: intent.status,
    hasPreview: Boolean(intent.previewAudioUrl)
  };
}

function publicJob(job) {
  return {
    jobId: job.id,
    status: job.status,
    steps: job.steps,
    result: {
      songUrl: job.songUrl || null,
      coverUrl: job.coverUrl || null,
      videoUrl: job.videoUrl || null
    },
    errorMessage: job.errorMessage || null
  };
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/api/intents", async (req, res, next) => {
  try {
    const userInput = String(req.body?.userInput || "").trim();
    if (userInput.length < 3) {
      return res.status(400).json({ message: "请先描述你想要的出道曲风格" });
    }

    const translated = await translateStyle(userInput);
    const intent = createIntent({
      originalInput: userInput,
      originalInputSummary: translated.originalInputSummary,
      safeMusicPrompt: translated.safeMusicPrompt,
      removedReferences: translated.removedReferences
    });

    res.status(201).json({
      intentId: intent.id,
      originalInputSummary: intent.originalInput,
      status: "created"
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/intents/:intentId", (req, res) => {
  const intent = getIntent(req.params.intentId);
  if (!intent) return res.status(404).json({ message: "Intent not found" });
  res.json(publicIntent(intent));
});

app.post("/api/intents/:intentId/preview", async (req, res, next) => {
  try {
    const intent = getIntent(req.params.intentId);
    if (!intent) return res.status(404).json({ message: "Intent not found" });

    if (intent.previewAudioUrl) {
      return res.json({
        previewId: `${intent.id}-preview`,
        audioUrl: intent.previewAudioUrl,
        duration: 18,
        status: "success"
      });
    }

    const provider = createMusicProvider();
    const preview = await provider.generatePreview({ prompt: intent.safeMusicPrompt });
    setIntentPreview(intent.id, preview.audioUrl);
    res.json({ ...preview, status: "success" });
  } catch (error) {
    next(error);
  }
});

app.post("/api/redeem", (req, res, next) => {
  try {
    const intentId = String(req.body?.intentId || "").trim();
    const code = String(req.body?.code || "").trim();
    const intent = getIntent(intentId);
    if (!intent) return res.status(404).json({ success: false, message: "企划不存在" });

    let job;
    const tx = db.transaction(() => {
      const result = validateAndUseCode({ code, intentId });
      if (!result.ok) {
        return result;
      }

      updateIntentStatus(intentId, "unlocked");
      job = createJob({ intentId });
      return { ok: true };
    });

    const result = tx();
    if (!result.ok) {
      return res.status(400).json({ success: false, message: result.message });
    }

    startGenerationJob(job.id);
    res.json({ success: true, jobId: job.id });
  } catch (error) {
    next(error);
  }
});

app.get("/api/jobs/:jobId", (req, res) => {
  const job = getJob(req.params.jobId);
  if (!job) return res.status(404).json({ message: "Job not found" });
  res.json(publicJob(job));
});

app.get("/api/results/:jobId", (req, res) => {
  const job = getJob(req.params.jobId);
  if (!job) return res.status(404).json({ message: "Result not found" });
  if (job.status !== "success" || !job.songUrl || !job.coverUrl || !job.videoUrl) {
    return res.status(409).json({ message: "Result is not ready" });
  }
  res.json({
    jobId: job.id,
    songUrl: job.songUrl,
    coverUrl: job.coverUrl,
    videoUrl: job.videoUrl
  });
});

app.post("/api/admin/codes", requireAdmin, (req, res) => {
  const codes = generateCodes({
    count: req.body?.count,
    prefix: req.body?.prefix,
    expiresAt: req.body?.expiresAt || null
  });
  res.status(201).json({ codes });
});

app.get("/api/admin/codes", requireAdmin, (req, res) => {
  res.json({ codes: listCodes() });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "服务器开小差了，请稍后再试" });
});

app.listen(config.port, () => {
  console.log(`Debut Song Simulator API listening on http://localhost:${config.port}`);
});
