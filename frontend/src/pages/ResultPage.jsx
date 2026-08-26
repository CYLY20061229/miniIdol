import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Download, RotateCcw } from "lucide-react";
import { api } from "../lib/api.js";

export function ResultPage() {
  const { jobId } = useParams();
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getResult(jobId).then(setResult).catch((err) => setError(err.message));
  }, [jobId]);

  return (
    <main className="screen result-screen">
      <header className="page-header">
        <span className="eyebrow">Debut Complete</span>
        <h1>你的出道曲已完成</h1>
      </header>

      {error ? <p className="error">{error}</p> : null}
      {result ? (
        <>
          <img className="cover-art" src={result.coverUrl} alt="原创出道曲封面" />
          <section className="panel">
            <h2>完整歌曲</h2>
            <audio controls src={result.songUrl} />
          </section>
          <section className="panel">
            <h2>封面播放视频</h2>
            {result.videoUrl.endsWith(".mp4") ? (
              <video controls playsInline src={result.videoUrl} poster={result.coverUrl} />
            ) : (
              <p className="summary">本地未检测到 ffmpeg，已返回 mock video URL。</p>
            )}
          </section>
          <div className="download-grid">
            <a className="secondary-button" href={result.songUrl} download><Download size={17} /> 下载歌曲</a>
            <a className="secondary-button" href={result.coverUrl} download><Download size={17} /> 下载封面</a>
            <a className="secondary-button" href={result.videoUrl} download><Download size={17} /> 下载视频</a>
          </div>
          <p className="compliance-note">
            本作品由 AI 根据你的风格描述生成，为原创方向生成结果，不代表任何真实艺人、团体或作品。
          </p>
          <Link className="primary-button" to="/"><RotateCcw size={18} /> 再生成一首</Link>
        </>
      ) : (
        <section className="panel"><p className="summary">正在读取完成文件...</p></section>
      )}
    </main>
  );
}
