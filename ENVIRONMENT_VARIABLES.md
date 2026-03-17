# Music Lists - 环境变量配置

## Vercel 部署需要的环境变量

在 Vercel Dashboard → Project Settings → Environment Variables 中添加以下变量：

### Supabase 配置
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### Spotify 配置
```
VITE_SPOTIFY_CLIENT_ID=
VITE_SPOTIFY_REDIRECT_URI=https://你的vercel域名/callback
```

---

## 获取方式

### 1. Supabase URL 和 Anon Key

去你的 Supabase 项目 → Project Settings → API：
- `VITE_SUPABASE_URL` = Project URL
- `VITE_SUPABASE_ANON_KEY` = Project API keys 里的 `anon` public

### 2. Spotify Client ID

去 [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)：
- 选择你的 App
- Client ID 就在页面上

### 3. Redirect URI

本地开发：
```
http://localhost:5173/callback
```

生产环境（Vercel）：
```
https://你的项目名.vercel.app/callback
```

---

## ⚠️ 重要提醒

**本地开发 vs 生产环境**

`.env` 文件里用本地配置：
```env
VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback
```

Vercel 里用生产配置：
```
VITE_SPOTIFY_REDIRECT_URI=https://xxx.vercel.app/callback
```

**Spotify 回调地址需要同时配置两个！**
在 Spotify Developer Dashboard → Edit Settings → Redirect URIs 里添加：
- `http://localhost:5173/callback`（本地开发）
- `https://你的vercel域名/callback`（生产环境）
