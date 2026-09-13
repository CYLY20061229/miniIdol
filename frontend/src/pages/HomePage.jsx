import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Disc3, Mic2, Sparkles } from "lucide-react";
import { api } from "../lib/api.js";

export function HomePage() {
  const [form, setForm] = useState({
    stageName: "",
    mood: "",
    genre: "",
    stageFeeling: "",
    lyricTheme: "",
    artistStyle: "",
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

        <label htmlFor="mood">氛围</label>
        <input
          id="mood"
          value={form.mood}
          onChange={(event) => updateField("mood", event.target.value)}
          placeholder="例如：清爽、暧昧、青春、梦幻"
        />

        <label htmlFor="genre">曲风</label>
        <input
          id="genre"
          value={form.genre}
          onChange={(event) => updateField("genre", event.target.value)}
          placeholder="例如：K-pop、轻电子、R&B、流行摇滚"
        />

        <label htmlFor="stageFeeling">舞台感</label>
        <input
          id="stageFeeling"
          value={form.stageFeeling}
          onChange={(event) => updateField("stageFeeling", event.target.value)}
          placeholder="例如：适合女团出道舞台、副歌有记忆点"
        />

        <label htmlFor="lyricTheme">歌词主题</label>
        <input
          id="lyricTheme"
          value={form.lyricTheme}
          onChange={(event) => updateField("lyricTheme", event.target.value)}
          placeholder="例如：初次站上舞台、心动暗恋、自我闪耀"
        />

        <label htmlFor="artistStyle">艺人风格</label>
        <input
          id="artistStyle"
          value={form.artistStyle}
          onChange={(event) => updateField("artistStyle", event.target.value)}
          placeholder="例如：清甜但有力量、未来感、甜酷"
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
        <p className="hint">可以填写真实灵感名称，后端会静默转成安全原创音乐元素，不会把内部 prompt 展示给用户。</p>
        {error ? <p className="error">{error}</p> : null}
        <button className="primary-button" disabled={loading}>
          <Mic2 size={19} />
          {loading ? "正在创建企划" : "生成我的出道曲"}
        </button>
      </form>
    </main>
  );
}
