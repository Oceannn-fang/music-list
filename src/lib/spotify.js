/**
 * Spotify Web API 封装
 * 
 * 注意：需要在 Supabase Auth 中配置 Spotify OAuth 提供商
 * 用户登录后会获得 Spotify access_token，用于调用 Spotify API
 */

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1'

/**
 * 获取 Spotify 访问令牌（从 Supabase 会话中获取）
 * @param {import('@supabase/supabase-js').Session} session 
 * @returns {string | null}
 */
export const getSpotifyAccessToken = (session) => {
  return session?.provider_token || null
}

/**
 * 搜索专辑
 * @param {string} query - 搜索关键词
 * @param {string} accessToken - Spotify access token
 * @param {number} limit - 返回结果数量 (默认 20, 最大 50)
 * @param {number} offset - 偏移量（用于分页）
 * @returns {Promise<{albums: Array, error: string | null}>}
 */
export const searchAlbums = async (query, accessToken, limit = 20, offset = 0) => {
  if (!query.trim()) {
    return { albums: [], error: null }
  }

  if (!accessToken) {
    return { albums: [], error: '未登录 Spotify' }
  }

  try {
    const encodedQuery = encodeURIComponent(query)
    const url = `${SPOTIFY_API_BASE}/search?q=${encodedQuery}&type=album&limit=${Math.min(Math.max(parseInt(limit) || 20, 1), 50)}`

    console.log('Final URL:', url)
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Spotify API Error:', response.status, errorText)
      if (response.status === 401) {
        return { albums: [], error: 'Spotify 会话已过期，请重新登录' }
      }
      throw new Error(`Spotify API error ${response.status}`)
    }

    const data = await response.json()
    
    // 格式化返回的专辑数据
    const albums = data.albums?.items?.map(formatAlbumData) || []
    
    return { albums, error: null }
  } catch (error) {
    console.error('Search albums error:', error)
    return { albums: [], error: error.message }
  }
}

/**
 * 获取专辑详情
 * @param {string} albumId - Spotify 专辑 ID
 * @param {string} accessToken - Spotify access token
 * @returns {Promise<{album: Object | null, error: string | null}>}
 */
export const getAlbumDetails = async (albumId, accessToken) => {
  if (!accessToken) {
    return { album: null, error: '未登录 Spotify' }
  }

  try {
    const response = await fetch(`${SPOTIFY_API_BASE}/albums/${albumId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status}`)
    }

    const album = await response.json()
    return { album: formatAlbumData(album), error: null }
  } catch (error) {
    console.error('Get album details error:', error)
    return { album: null, error: error.message }
  }
}

/**
 * 获取多个专辑详情（批量）
 * @param {string[]} albumIds - Spotify 专辑 ID 数组
 * @param {string} accessToken - Spotify access token
 * @returns {Promise<{albums: Array, error: string | null}>}
 */
export const getMultipleAlbums = async (albumIds, accessToken) => {
  if (!accessToken || !albumIds.length) {
    return { albums: [], error: null }
  }

  try {
    const ids = albumIds.slice(0, 20).join(',') // Spotify 限制每次最多 20 个
    const response = await fetch(`${SPOTIFY_API_BASE}/albums?ids=${ids}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status}`)
    }

    const data = await response.json()
    const albums = data.albums?.map(formatAlbumData) || []
    
    return { albums, error: null }
  } catch (error) {
    console.error('Get multiple albums error:', error)
    return { albums: [], error: error.message }
  }
}

/**
 * 格式化专辑数据，统一返回结构
 * @param {Object} rawAlbum - Spotify API 返回的原始专辑数据
 * @returns {Object}
 */
const formatAlbumData = (rawAlbum) => {
  return {
    id: rawAlbum.id,
    name: rawAlbum.name,
    artist: rawAlbum.artists?.map(a => a.name).join(', ') || 'Unknown Artist',
    coverUrl: rawAlbum.images?.[0]?.url || rawAlbum.images?.[1]?.url || '',
    smallCoverUrl: rawAlbum.images?.[2]?.url || rawAlbum.images?.[1]?.url || rawAlbum.images?.[0]?.url || '',
    releaseDate: rawAlbum.release_date,
    totalTracks: rawAlbum.total_tracks,
    externalUrl: rawAlbum.external_urls?.spotify,
    uri: rawAlbum.uri,
  }
}

/**
 * 获取新发行专辑
 * @param {string} accessToken - Spotify access token
 * @param {number} limit - 返回结果数量
 * @returns {Promise<{albums: Array, error: string | null}>}
 */
export const getNewReleases = async (accessToken, limit = 20) => {
  if (!accessToken) {
    return { albums: [], error: '未登录 Spotify' }
  }

  try {
    const response = await fetch(
      `${SPOTIFY_API_BASE}/browse/new-releases?limit=${limit}&country=US`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status}`)
    }

    const data = await response.json()
    const albums = data.albums?.items?.map(formatAlbumData) || []
    
    return { albums, error: null }
  } catch (error) {
    console.error('Get new releases error:', error)
    return { albums: [], error: error.message }
  }
}

/**
 * 获取最近播放历史
 * @param {string} accessToken - Spotify access token
 * @param {number} limit - 返回结果数量 (最大 50)
 * @param {string} after - 从此时间戳之后开始 (毫秒)
 * @returns {Promise<{tracks: Array, error: string | null}>}
 */
export const getRecentlyPlayed = async (accessToken, limit = 50, after = null) => {
  if (!accessToken) {
    return { tracks: [], error: '未登录 Spotify' }
  }

  try {
    let url = `${SPOTIFY_API_BASE}/me/player/recently-played?limit=${Math.min(limit, 50)}`
    if (after) {
      url += `&after=${after}`
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      if (response.status === 403) {
        return { tracks: [], error: '没有权限访问播放历史，请重新登录授权' }
      }
      throw new Error(`Spotify API error: ${response.status}`)
    }

    const data = await response.json()
    
    // 从播放记录中提取专辑信息（去重）
    const albumMap = new Map()
    data.items?.forEach(item => {
      const track = item.track
      if (track?.album) {
        const album = track.album
        // 只保存专辑类型的记录（不是单曲）
        if (album.album_type === 'album' && !albumMap.has(album.id)) {
          albumMap.set(album.id, {
            ...formatAlbumData(album),
            playedAt: item.played_at,
          })
        }
      }
    })

    const albums = Array.from(albumMap.values())
    
    return { 
      albums, 
      tracks: data.items || [],
      next: data.next,
      cursors: data.cursors,
      error: null 
    }
  } catch (error) {
    console.error('Get recently played error:', error)
    return { albums: [], tracks: [], error: error.message }
  }
}

export default {
  searchAlbums,
  getAlbumDetails,
  getMultipleAlbums,
  getNewReleases,
  getSpotifyAccessToken,
}
