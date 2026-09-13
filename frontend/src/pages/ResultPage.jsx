import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Download, RotateCcw } from "lucide-react";
import { api } from "../lib/api.js";

const profileLabels = [
  ["stageName", "艺名"],
  ["songTitle", "歌名"],
  ["mood", "氛围"],
  ["genre", "曲风"],
  ["stageFeeling", "舞台感"],
  ["lyricTheme", "歌词主题"],
  ["language", "语言"],
  ["artistStyle", "艺人风格"],
  ["musicStyle", "音乐风格"],
  ["artistPositioning", "艺人定位"],
  ["publicImage", "性格 / 公众形象"],
  ["selfDescription", "一句话描述自己"],
  ["songPrompt", "歌曲描述"]
];

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
          {result.profile ? (
            <section className="panel profile-panel">
              <h2>你的出道企划</h2>
              <dl>
                {profileLabels
                  .filter(([key]) => result.profile?.[key])
                  .map(([key, label]) => (
                    <div className="profile-row" key={key}>
                      <dt>{label}</dt>
                      <dd>{result.profile[key]}</dd>
                    </div>
                  ))}
              </dl>
            </section>
          ) : null}
          <section className="panel">
            <h2>封面播放视频</h2>
            {result.videoUrl.endsWith(".mp4") ? (
              <video controls playsInline src={result.videoUrl} poster={result.coverUrl} />
            ) : (
              <div className="video-fallback">
                <img src={result.coverUrl} alt="根据企划生成的封面视频画面" />
                <p className="summary">封面画面已根据你的出道企划生成。服务器启用 ffmpeg 后会自动导出完整封面播放视频。</p>
              </div>
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
