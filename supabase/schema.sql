-- 简化版：只创建表结构

-- 播放列表表
CREATE TABLE IF NOT EXISTS playlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 专辑表
CREATE TABLE IF NOT EXISTS albums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  spotify_id TEXT NOT NULL,
  name TEXT NOT NULL,
  artist TEXT NOT NULL,
  cover_url TEXT,
  release_date TEXT,
  -- 回顾相关字段
  rating DECIMAL(2,1), -- 评分 0.0-5.0，支持半星
  review TEXT, -- 短评/备注
  status TEXT DEFAULT 'listened' CHECK (status IN ('want_to_listen', 'listening', 'listened')), -- 收听状态
  tags TEXT[], -- 标签数组
  listened_at TIMESTAMP WITH TIME ZONE, -- 实际听完日期
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  added_by TEXT
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_albums_playlist_id ON albums(playlist_id);
CREATE INDEX IF NOT EXISTS idx_albums_spotify_id ON albums(spotify_id);

-- 启用实时
alter publication supabase_realtime add table playlists;
alter publication supabase_realtime add table albums;
