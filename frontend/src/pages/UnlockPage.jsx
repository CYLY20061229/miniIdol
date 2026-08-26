import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Download, Headphones, KeyRound, Music4, Video } from "lucide-react";
import { api } from "../lib/api.js";

export function UnlockPage() {
  const { intentId } = useParams();
  const navigate = useNavigate();
  const [intent, setIntent] = useState(null);
  const [code, setCode] = useState("");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getIntent(intentId).then(setIntent).catch((err) => setError(err.message));
  }, [intentId]);

  async function handlePreview() {
    setError("");
    setPreviewLoading(true);
    try {
      setPreview(await api.createPreview(intentId));
    } catch (err) {
      setError(err.message);
    } finally {
      setPreviewLoading(false);
    }
  }

  async function handleRedeem(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await api.redeem(intentId, code);
      navigate(`/generating/${result.jobId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="screen">
      <header className="page-header">
        <span className="eyebrow"><KeyRound size={15} /> Code Unlock</span>
        <h1>解锁完整出道曲</h1>
      </header>

      <section className="panel">
        <h2>原始需求摘要</h2>
        <p className="summary">{intent?.originalInputSummary || "正在读取企划..."}</p>
      </section>

      <section className="benefit-card">
        <h2>完整出道曲生成包</h2>
        <ul>
          <li><Music4 size={18} /> 一首完整原创出道曲</li>
          <li><Headphones size={18} /> AI 生成封面</li>
          <li><Video size={18} /> 封面播放视频</li>
          <li><Download size={18} /> 音频 / 封面 / 视频下载</li>
        </ul>
      </section>

      <form className="panel redeem-panel" onSubmit={handleRedeem}>
        <label htmlFor="code">兑换码</label>
        <input
          id="code"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="输入你的兑换码"
          autoCapitalize="characters"
        />
        {error ? <p className="error">{error}</p> : null}
        <button className="primary-button" disabled={loading || !intent}>
          <KeyRound size={18} />
          {loading ? "正在兑换" : "兑换并开始生成"}
        </button>
        <button className="secondary-button" type="button" onClick={handlePreview} disabled={previewLoading || !intent}>
          <Headphones size={18} />
          {previewLoading ? "正在准备试听" : "试听同风格样例"}
        </button>
      </form>

      {preview ? (
        <section className="panel">
          <h2>同风格样例试听</h2>
          <audio controls src={preview.audioUrl} />
        </section>
      ) : null}
    </main>
  );
}
