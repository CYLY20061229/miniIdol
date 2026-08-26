import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LoaderCircle, CheckCircle2, Circle, XCircle } from "lucide-react";
import { api } from "../lib/api.js";

const statusIcon = {
  pending: Circle,
  running: LoaderCircle,
  success: CheckCircle2,
  failed: XCircle
};

export function GeneratingPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    async function poll() {
      try {
        const data = await api.getJob(jobId);
        if (!alive) return;
        setJob(data);
        if (data.status === "success") {
          navigate(`/result/${jobId}`, { replace: true });
        }
      } catch (err) {
        if (alive) setError(err.message);
      }
    }

    poll();
    const timer = setInterval(poll, 2000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [jobId, navigate]);

  return (
    <main className="screen">
      <header className="page-header">
        <span className="eyebrow">Generation Room</span>
        <h1>你的出道曲正在制作</h1>
      </header>
      <section className="progress-disc" aria-hidden="true">
        <div />
      </section>
      <section className="panel steps-panel">
        {(job?.steps || []).map((step) => {
          const Icon = statusIcon[step.status] || Circle;
          return (
            <div className={`step ${step.status}`} key={step.name}>
              <Icon size={22} />
              <span>{step.label}</span>
            </div>
          );
        })}
        {!job ? <p className="summary">正在连接生成任务...</p> : null}
        {job?.status === "failed" ? <p className="error">{job.errorMessage || "生成失败"}</p> : null}
        {error ? <p className="error">{error}</p> : null}
      </section>
    </main>
  );
}
