import React from 'react'
import { useAllAlbums } from '../hooks/useAllAlbums'
import { useAlbumStats } from '../hooks/useAlbumStats'
import { getCurrentUserId } from '../lib/spotifyAuth'
import AlbumCard from '../components/AlbumCard'

// 简单的进度条组件
const ProgressBar = ({ value, max, color = 'green' }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0
  const colorClasses = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
  }
  
  return (
    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
      <div 
        className={`h-full ${colorClasses[color]} transition-all duration-500`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

// 统计卡片
const StatCard = ({ title, value, subtitle, icon }) => (
  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-400 text-sm mb-1">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
      </div>
      <div className="text-2xl">{icon}</div>
    </div>
  </div>
)

// 迷你趋势图（文本版）
const MiniTrend = ({ data }) => {
  const max = Math.max(...data.map(d => d.count), 1)
  
  return (
    <div className="flex items-end gap-1 h-16 mt-2">
      {data.map((item, idx) => (
        <div key={idx} className="flex-1 flex flex-col items-center gap-1">
          <div 
            className="w-full bg-green-500/60 rounded-t"
            style={{ height: `${(item.count / max) * 100}%`, minHeight: '4px' }}
          />
          {idx % 3 === 0 && (
            <span className="text-[10px] text-gray-500 rotate-45 origin-left translate-y-2">
              {item.month.split('年')[1] || item.month}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

const Stats = () => {
  const userId = getCurrentUserId()
  // 获取所有专辑（跨所有清单）
  const { albums, loading } = useAllAlbums(userId)
  const stats = useAlbumStats(albums)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (!albums.length) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">📊</div>
        <h2 className="text-xl font-bold mb-2">还没有数据</h2>
        <p className="text-gray-400">先添加一些专辑，回顾功能会自动生成统计</p>
      </div>
    )
  }

  const statusLabels = {
    want_to_listen: '想听',
    listening: '在听',
    listened: '听过',
  }

  const statusColors = {
    want_to_listen: 'orange',
    listening: 'blue',
    listened: 'green',
  }

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* 标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">音乐回顾</h1>
        <p className="text-gray-400">看看你的音乐品味和收藏趋势</p>
      </div>

      {/* 核心数据卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="收录专辑" 
          value={stats.totalCount} 
          subtitle="张"
          icon="💿"
        />
        <StatCard 
          title="平均评分" 
          value={stats.averageRating} 
          subtitle={`${stats.ratedCount} 张已评分`}
          icon="⭐"
        />
        <StatCard 
          title="最爱艺人" 
          value={stats.topArtists[0]?.name || '-'} 
          subtitle={`${stats.topArtists[0]?.count || 0} 张专辑`}
          icon="🎤"
        />
        <StatCard 
          title="收藏年份" 
          value={stats.monthlyTrend.filter(m => m.count > 0).length} 
          subtitle="个月有新增"
          icon="📅"
        />
      </div>

      {/* 两栏布局 */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* 左栏 */}
        <div className="space-y-6">
          
          {/* 添加趋势 */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              📈 收藏趋势
              <span className="text-xs text-gray-500 font-normal">最近12个月</span>
            </h3>
            <MiniTrend data={stats.monthlyTrend} />
          </div>

          {/* 状态分布 */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="font-semibold mb-4">📋 收听状态</h3>
            <div className="space-y-3">
              {Object.entries(stats.statusDistribution).map(([status, count]) => (
                <div key={status} className="flex items-center gap-3">
                  <span className="text-sm text-gray-400 w-16">
                    {statusLabels[status] || status}
                  </span>
                  <div className="flex-1">
                    <ProgressBar 
                      value={count} 
                      max={stats.totalCount} 
                      color={statusColors[status] || 'gray'}
                    />
                  </div>
                  <span className="text-sm font-medium w-10 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 评分分布 */}
          {stats.ratedCount > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h3 className="font-semibold mb-4">⭐ 评分分布</h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map(star => (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-sm text-gray-400 w-8">{star}★</span>
                    <div className="flex-1">
                      <ProgressBar 
                        value={stats.ratingDistribution[star] || 0} 
                        max={stats.ratedCount} 
                        color={star >= 4 ? 'green' : star === 3 ? 'orange' : 'red'}
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-8 text-right">
                      {stats.ratingDistribution[star] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 右栏 */}
        <div className="space-y-6">
          
          {/* 最爱艺人 */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="font-semibold mb-4">🎤 最爱艺人 Top 10</h3>
            <div className="space-y-2">
              {stats.topArtists.map((artist, idx) => (
                <div 
                  key={artist.name} 
                  className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold w-6 ${
                      idx < 3 ? 'text-green-400' : 'text-gray-500'
                    }`}>
                      #{idx + 1}
                    </span>
                    <span className="text-sm truncate max-w-[150px]">{artist.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">{artist.count} 张</span>
                </div>
              ))}
            </div>
          </div>

          {/* 年代分布 */}
          {Object.keys(stats.yearDistribution).length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h3 className="font-semibold mb-4">🎵 专辑年代</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.yearDistribution)
                  .sort((a, b) => b[0] - a[0])
                  .slice(0, 15)
                  .map(([year, count]) => (
                    <div 
                      key={year} 
                      className="bg-white/10 px-3 py-1.5 rounded-lg text-sm"
                    >
                      <span className="text-gray-400">{year}</span>
                      <span className="ml-1 text-green-400 font-medium">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* 最近添加 */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="font-semibold mb-4">🆕 最近添加</h3>
            <div className="grid grid-cols-2 gap-3">
              {stats.recentAdditions.slice(0, 4).map(album => (
                <div key={album.id} className="relative group">
                  <img 
                    src={album.cover_url} 
                    alt={album.name}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col justify-end p-2">
                    <p className="text-xs font-medium truncate">{album.name}</p>
                    <p className="text-[10px] text-gray-400 truncate">{album.artist}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 高评分专辑 */}
      {stats.topRated.length > 0 && (
        <div className="mt-8">
          <h3 className="font-semibold mb-4 text-lg">💎 你的珍藏 (4.5★+)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {stats.topRated.map(album => (
              <div key={album.id} className="relative">
                <AlbumCard album={album} showRemove={false} />
                <div className="absolute top-2 right-2 bg-green-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                  {album.rating}★
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Stats
