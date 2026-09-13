import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Disc3, Mic2, Sparkles } from "lucide-react";
import { api } from "../lib/api.js";

export function HomePage() {
  const [form, setForm] = useState({
    stageName: "",
    musicStyle: "",
    artistPositioning: "",
    publicImage: "",
    selfDescription: "",
    songPrompt: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await api.createIntent(form);
      navigate(`/unlock/${result.intentId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="screen home-screen">
      <section className="hero">
        <div className="vinyl-wrap" aria-hidden="true">
          <div className="vinyl">
            <Disc3 size={160} strokeWidth={1.2} />
          </div>
          <div className="tone-arm" />
        </div>
        <div className="eyebrow"><Sparkles size={16} /> 出道曲企划案生成器</div>
        <h1>生成你的出道曲</h1>
        <p>想象你出道的样子，你出道时唱的歌，我会把它变成一首原创出道曲</p>
      </section>

      <form className="panel input-panel" onSubmit={handleSubmit}>
        <label htmlFor="stageName">艺名</label>
        <input
          id="stageName"
          value={form.stageName}
          onChange={(event) => updateField("stageName", event.target.value)}
          placeholder="例如：Luna"
        />

        <label htmlFor="musicStyle">音乐风格</label>
        <input
          id="musicStyle"
          value={form.musicStyle}
          onChange={(event) => updateField("musicStyle", event.target.value)}
          placeholder="例如：清爽女团流行、轻电子、暧昧心动"
        />

        <label htmlFor="artistPositioning">艺人定位</label>
        <input
          id="artistPositioning"
          value={form.artistPositioning}
          onChange={(event) => updateField("artistPositioning", event.target.value)}
          placeholder="例如：新生代甜酷主唱 / 校园感门面"
        />

        <label htmlFor="publicImage">性格 / 公众形象</label>
        <input
          id="publicImage"
          value={form.publicImage}
          onChange={(event) => updateField("publicImage", event.target.value)}
          placeholder="例如：外冷内热、舞台上自信、私下可爱"
        />

        <label htmlFor="selfDescription">一句话描述自己</label>
        <input
          id="selfDescription"
          value={form.selfDescription}
          onChange={(event) => updateField("selfDescription", event.target.value)}
          placeholder="例如：想在第一束追光里变成自己的主角"
        />

        <label htmlFor="songPrompt">歌曲 prompt</label>
        <textarea
          id="songPrompt"
          value={form.songPrompt}
          onChange={(event) => updateField("songPrompt", event.target.value)}
          placeholder="例如：我想要一首适合女团出道的原创歌曲，清爽、暧昧，有很强的副歌记忆点"
          rows={6}
        />
        <p className="hint">可以写你想要的氛围、曲风、舞台感、歌词主题，系统会在后端静默转成安全原创音乐元素。</p>
        {error ? <p className="error">{error}</p> : null}
        <button className="primary-button" disabled={loading}>
          <Mic2 size={19} />
          {loading ? "正在创建企划" : "生成我的出道曲"}
        </button>
      </form>
    </main>
  );
}
