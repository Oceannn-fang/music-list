# Music Lists

一个基于 Spotify API 的音乐专辑清单管理应用。创建你的音乐收藏，记录听过的专辑，生成属于你的唱片墙。

## 功能

- 🔐 **Spotify 登录** - OAuth 2.0 + PKCE 安全认证
- 📁 **多清单管理** - 创建多个专辑清单（如：2026年专辑、黑胶收藏等）
- 🔍 **Spotify 搜索** - 直接从 Spotify 搜索并添加专辑
- ⭐ **评分系统** - 1-5 星评分（支持半星）
- 📝 **短评记录** - 写下你的听后感
- 📋 **状态标记** - 想听 / 在听 / 听过
- 🏷️ **标签系统** - 自定义标签分类
- 📊 **数据回顾** - 统计面板，查看收藏趋势、最爱艺人、评分分布
- 📱 **PWA 支持** - 可添加到手机主屏幕，像原生 App 一样使用
- 🔄 **实时同步** - 多设备实时同步数据

## 技术栈

- **前端**: React 18 + Vite + Tailwind CSS
- **后端**: Supabase (PostgreSQL + Realtime)
- **认证**: Spotify OAuth 2.0 with PKCE
- **API**: Spotify Web API
- **部署**: Vercel

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 环境变量

创建 `.env` 文件：

```env
# Supabase
VITE_SUPABASE_URL=你的Supabase项目URL
VITE_SUPABASE_ANON_KEY=你的Supabase匿名密钥

# Spotify
VITE_SPOTIFY_CLIENT_ID=你的Spotify Client ID
VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback
```

## 部署到 Vercel

### 1. 推送到 GitHub

```bash
# 创建 GitHub 仓库后
git remote add origin https://github.com/你的用户名/music-lists.git
git branch -M main
git push -u origin main
```

### 2. Vercel 部署

1. 登录 [Vercel](https://vercel.com)
2. 点击 "New Project"
3. 导入你的 GitHub 仓库
4. 配置环境变量（上面列出的那些）
5. 点击 Deploy

### 3. 配置 Spotify 回调地址

部署后，更新 Spotify Developer Dashboard 中的 Redirect URI：
- 添加: `https://你的vercel域名/callback`

### 4. 更新环境变量

将 `VITE_SPOTIFY_REDIRECT_URI` 改为生产环境地址：
```env
VITE_SPOTIFY_REDIRECT_URI=https://你的vercel域名/callback
```

## 数据库结构

见 `supabase/schema.sql`

## License

MIT
