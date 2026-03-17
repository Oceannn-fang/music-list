import { useMemo } from 'react'

/**
 * 专辑数据统计 Hook
 * @param {Array} albums - 专辑列表
 * @returns {Object} 各类统计数据
 */
export const useAlbumStats = (albums = []) => {
  return useMemo(() => {
    if (!albums.length) {
      return {
        totalCount: 0,
        averageRating: 0,
        ratedCount: 0,
        statusDistribution: {},
        yearDistribution: {},
        artistDistribution: {},
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        monthlyTrend: [],
        topArtists: [],
        topRated: [],
        recentAdditions: [],
      }
    }

    // 基础统计
    const totalCount = albums.length
    const ratedAlbums = albums.filter(a => a.rating != null)
    const ratedCount = ratedAlbums.length
    const averageRating = ratedCount > 0
      ? (ratedAlbums.reduce((sum, a) => sum + Number(a.rating), 0) / ratedCount).toFixed(1)
      : 0

    // 状态分布
    const statusDistribution = albums.reduce((acc, album) => {
      const status = album.status || 'listened'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})

    // 年代分布（按发行年份）
    const yearDistribution = albums.reduce((acc, album) => {
      if (album.release_date) {
        const year = album.release_date.substring(0, 4)
        if (year && !isNaN(year)) {
          acc[year] = (acc[year] || 0) + 1
        }
      }
      return acc
    }, {})

    // 艺术家分布
    const artistDistribution = albums.reduce((acc, album) => {
      const artist = album.artist
      if (artist) {
        acc[artist] = (acc[artist] || 0) + 1
      }
      return acc
    }, {})

    // 评分分布
    const ratingDistribution = albums.reduce((acc, album) => {
      if (album.rating) {
        const rating = Math.round(Number(album.rating))
        acc[rating] = (acc[rating] || 0) + 1
      }
      return acc
    }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })

    // 月度添加趋势（最近12个月）
    const now = new Date()
    const monthlyTrend = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const monthName = d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short' })
      
      const count = albums.filter(a => {
        if (!a.added_at) return false
        const added = new Date(a.added_at)
        return added.getFullYear() === d.getFullYear() && 
               added.getMonth() === d.getMonth()
      }).length
      
      monthlyTrend.push({ month: monthName, monthKey, count })
    }

    // 最爱艺人（专辑数量最多的）
    const topArtists = Object.entries(artistDistribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }))

    // 高评分专辑（评分 4.5 以上）
    const topRated = albums
      .filter(a => a.rating && a.rating >= 4.5)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10)

    // 最近添加
    const recentAdditions = [...albums]
      .sort((a, b) => new Date(b.added_at) - new Date(a.added_at))
      .slice(0, 10)

    return {
      totalCount,
      averageRating,
      ratedCount,
      statusDistribution,
      yearDistribution,
      artistDistribution,
      ratingDistribution,
      monthlyTrend,
      topArtists,
      topRated,
      recentAdditions,
    }
  }, [albums])
}

export default useAlbumStats
