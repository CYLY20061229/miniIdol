import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Disc3, Mic2, Sparkles } from "lucide-react";
import { api } from "../lib/api.js";

export function HomePage() {
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await api.createIntent(userInput);
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
        <label htmlFor="style">你的灵感方向</label>
        <textarea
          id="style"
          value={userInput}
          onChange={(event) => setUserInput(event.target.value)}
          placeholder="例如：我想要一aespa风格的女团出道曲"
          rows={7}
        />
        <p className="hint">可以描述你喜欢的氛围、曲风、舞台感、歌词主题，或者艺人风格</p>
        {error ? <p className="error">{error}</p> : null}
        <button className="primary-button" disabled={loading}>
          <Mic2 size={19} />
          {loading ? "正在创建企划" : "生成我的出道曲"}
        </button>
      </form>
    </main>
  );
}
