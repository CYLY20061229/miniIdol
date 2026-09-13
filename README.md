# 出道曲模拟器

移动端优先的「出道曲企划案生成器」。用户输入出道曲灵感后，后端静默做安全风格转译；兑换码解锁后再生成完整歌曲、封面和封面播放视频。

## 目录结构

```txt
frontend/   React + Vite + PWA
backend/    Node.js + Express + SQLite
```

## 安装依赖

```bash
npm install
```

## 环境变量

复制示例文件：

```bash
cp .env.example .env
```

`.env.example`：

```env
PORT=3001
ADMIN_TOKEN=change_me
MUSIC_PROVIDER=mock
MUREKA_API_KEY=
MUREKA_BASE_URL=https://api.mureka.ai
MUREKA_MODEL=
MUREKA_SONG_COUNT=1
MUREKA_POLL_INTERVAL_MS=5000
MUREKA_POLL_TIMEOUT_MS=600000
DATABASE_URL=./data/app.sqlite
PUBLIC_BASE_URL=http://localhost:3001
COVER_PROVIDER=mock
QWEN_IMAGE_API_KEY=
QWEN_IMAGE_BASE_URL=https://dashscope.aliyuncs.com
QWEN_IMAGE_MODEL=wanx2.1-t2i-turbo
QWEN_IMAGE_SIZE=1024*1024
QWEN_IMAGE_POLL_INTERVAL_MS=3000
QWEN_IMAGE_POLL_TIMEOUT_MS=180000
```

所有密钥只在后端读取，不会进入前端代码。

## 运行

同时运行前后端：

```bash
npm run dev
```

单独运行后端：

```bash
npm run dev:backend
```

单独运行前端：

```bash
npm run dev:frontend
```

默认地址：

- 前端：http://localhost:5173
- 后端：http://localhost:3001

## 创建兑换码

```bash
curl -X POST http://localhost:3001/api/admin/codes \
  -H "Authorization: Bearer change_me" \
  -H "Content-Type: application/json" \
  -d '{"count":5,"prefix":"DEBUT","expiresAt":null}'
```

## 查看兑换码

```bash
curl http://localhost:3001/api/admin/codes \
  -H "Authorization: Bearer change_me"
```

兑换码大小写不敏感，会自动 trim；已使用、过期、禁用的兑换码不能再次兑换。

## Mock 与 Mureka 切换

默认使用 mock：

```env
MUSIC_PROVIDER=mock
```

切换到 Mureka：

```env
MUSIC_PROVIDER=mureka
MUREKA_API_KEY=your_key
MUREKA_BASE_URL=https://api.mureka.ai
MUREKA_MODEL=your_model
```

Mureka 的 endpoint、payload、轮询和结果解析集中在 `backend/src/providers/murekaProvider.js`。已实现正式调用流程：`POST /v1/song/generate` 创建任务，`GET /v1/song/query/:taskId` 轮询任务，成功后从 `choices` 中读取音频 URL。歌名、歌词主题、语言会一起进入 Mureka 的生成 prompt，并用于生成原创歌词。未配置 `MUREKA_API_KEY` 时会 fallback 到 `MockMusicProvider`，方便完整流程本地跑通。

## 配置千问封面生成

默认封面 provider 为 mock：

```env
COVER_PROVIDER=mock
```

切换到千问图片生成：

```env
COVER_PROVIDER=qwen
QWEN_IMAGE_API_KEY=your_key
QWEN_IMAGE_BASE_URL=https://dashscope.aliyuncs.com
QWEN_IMAGE_MODEL=wanx2.1-t2i-turbo
QWEN_IMAGE_SIZE=1024*1024
```

千问 API 的实际请求集中在 `backend/src/providers/qwenCoverProvider.js`，使用 DashScope 异步图片生成接口，生成后会下载到后端 `public/generated` 并返回可访问 URL。封面约束是方形，不出现真实艺人肖像、真实团体 logo 或版权角色。未配置 `QWEN_IMAGE_API_KEY` 时会 fallback 到 mock 封面。

## ffmpeg 视频合成

`backend/src/services/videoRenderer.js` 会优先检测本机 `ffmpeg`。如果可用，会把静态封面图作为画面、生成歌曲作为音频，合成一个方形 MP4；如果不可用或合成失败，会返回 mock video URL。

macOS 可安装：

```bash
brew install ffmpeg
```

Ubuntu 服务器可安装：

```bash
sudo apt update
sudo apt install -y ffmpeg
ffmpeg -version
```

## 完整流程

1. 首页输入出道曲灵感。
2. `POST /api/intents` 创建 intent，后端静默执行 `styleTranslator`。
3. 前端跳转到兑换码页，不展示安全 prompt。
4. 可试听同风格 mock 样例。
5. 输入兑换码，`POST /api/redeem` 创建 generation job。
6. 生成页每 2 秒轮询 `GET /api/jobs/:jobId`。
7. job 顺序执行歌曲、封面、视频、下载整理。
8. 完成后跳转结果页，展示音频、封面、视频和下载按钮。

## 合规说明

- 前端不展示“模仿某某艺人”“复刻某某歌曲”“同款声音”等文案。
- `safeMusicPrompt` 只存在后端数据库和 provider 调用链里，不通过 API 返回给前端。
- `styleTranslator` 会把常见真实名称改写为通用音乐元素。
- 不做声音克隆，不上传真实艺人音频，不复制已有歌词、旋律或编曲。

## H5 / PWA 部署注意事项

- 前端构建：`npm run build`，产物在 `frontend/dist`。
- 生产环境设置 `VITE_API_BASE_URL` 指向后端 API 域名。
- 后端静态媒体依赖 `PUBLIC_BASE_URL` 生成可访问下载链接。
- PWA 需要 HTTPS 才能在手机浏览器稳定安装到桌面。
- 生产环境建议把 SQLite 换成 PostgreSQL 或 MongoDB，并把 repo 层替换为对应实现。
