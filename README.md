# Music Lists - 音乐清单应用

类似 stat.fm 的音乐清单网站，支持 Spotify OAuth 登录、专辑搜索、清单管理和唱片墙展示。

## 技术栈

- **前端**: React 18 + Vite + Tailwind CSS
- **后端**: Supabase (PostgreSQL + 实时订阅)
- **API**: Spotify Web API (PKCE OAuth)

## 功能特性

- 🔐 Spotify OAuth 登录（PKCE 流程，无需 Client Secret）
- 📋 创建/删除/管理音乐清单
- 🔍 通过 Spotify API 搜索专辑
- 🖼️ 唱片墙网格展示
- ⚡ 多设备实时同步

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 Spotify App

1. 访问 [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. 创建应用，获取 **Client ID**
3. 在 **Redirect URIs** 中添加：
   ```
   http://127.0.0.1:5173/callback
   ```
   ⚠️ **注意**：必须用 `127.0.0.1`，`localhost` 会被 Spotify 拒绝

### 3. 配置 Supabase

1. 在 [Supabase](https://supabase.com) 创建项目
2. 获取 Project URL 和 Anon Key
3. 去 **SQL Editor** → **New query**，执行 `supabase/schema.sql` 的内容创建表

### 4. 配置环境变量

复制 `.env.example` 为 `.env`，填入你的配置：

```env
VITE_SUPABASE_URL=https://你的项目.supabase.co
VITE_SUPABASE_ANON_KEY=你的_anon_key
VITE_SPOTIFY_CLIENT_ID=你的_spotify_client_id
VITE_SPOTIFY_REDIRECT_URI=http://127.0.0.1:5173/callback
```

### 5. 启动开发服务器

```bash
npm run dev
```

然后用浏览器打开：**http://127.0.0.1:5173** ⚠️ 不要用 localhost

## 项目结构

```
src/
├── components/      # UI 组件
│   ├── Header.jsx
│   ├── PlaylistCard.jsx
│   ├── AlbumCard.jsx
│   └── SearchModal.jsx
├── pages/          # 页面组件
│   ├── Home.jsx
│   ├── Callback.jsx
│   └── PlaylistDetail.jsx
├── hooks/          # 自定义 React Hooks
│   ├── useAuth.js
│   ├── usePlaylists.js
│   ├── useAlbums.js
│   └── useRealtime.js
├── lib/            # 工具函数和 API 封装
│   ├── spotify.js      # Spotify API 封装
│   ├── spotifyAuth.js  # Spotify OAuth (PKCE)
│   └── supabase.js     # Supabase 客户端
└── App.jsx
```

## 部署

### Vercel 部署

1. 推送代码到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 添加环境变量
4. 在 Spotify App 中添加生产环境回调 URL：
   ```
   https://你的域名/callback
   ```

## 注意事项

- Spotify OAuth 使用 PKCE 流程，无需 Client Secret，更安全
- 所有数据存储在 Supabase，按 Spotify user_id 隔离
- 实时同步通过 Supabase Realtime 实现
- 令牌自动刷新，登录状态持久化
