import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

/**
 * 专辑管理 Hook
 * @param {string} playlistId - 播放列表 ID
 * @param {string} userId - 当前用户 ID
 * @returns {{
 *   albums: Array,
 *   loading: boolean,
 *   error: string | null,
 *   addAlbum: (album: Object) => Promise<Object>,
 *   removeAlbum: (albumId: string) => Promise<void>,
 *   refreshAlbums: () => Promise<void>
 * }}
 */
export const useAlbums = (playlistId, userId) => {
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * 获取播放列表中的所有专辑
   */
  const fetchAlbums = useCallback(async () => {
    if (!playlistId) {
      setAlbums([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('albums')
        .select('*')
        .eq('playlist_id', playlistId)
        .order('added_at', { ascending: false })

      if (error) throw error

      setAlbums(data || [])
    } catch (err) {
      console.error('Error fetching albums:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [playlistId])

  /**
   * 添加专辑到播放列表
   * @param {Object} album - 专辑数据
   * @param {string} album.spotify_id - Spotify 专辑 ID
   * @param {string} album.name - 专辑名称
   * @param {string} album.artist - 艺术家
   * @param {string} album.cover_url - 封面 URL
   * @param {string} album.release_date - 发行日期
   */
  const addAlbum = useCallback(async (album) => {
    if (!playlistId || !userId) throw new Error('播放列表或用户未指定')

    // 检查是否已存在
    const existing = albums.find(a => a.spotify_id === album.spotify_id)
    if (existing) {
      throw new Error('该专辑已在清单中')
    }

    try {
      const { data, error } = await supabase
        .from('albums')
        .insert([
          {
            playlist_id: playlistId,
            spotify_id: album.spotify_id || album.id,
            name: album.name,
            artist: album.artist,
            cover_url: album.cover_url || album.coverUrl,
            release_date: album.release_date || album.releaseDate,
            added_by: userId,
          },
        ])
        .select()
        .single()

      if (error) throw error

      // 更新本地状态
      setAlbums(prev => [data, ...prev])
      return data
    } catch (err) {
      console.error('Error adding album:', err)
      throw err
    }
  }, [playlistId, userId, albums])

  /**
   * 从播放列表中移除专辑
   * @param {string} albumId - 专辑记录 ID（不是 spotify_id）
   */
  const removeAlbum = useCallback(async (albumId) => {
    if (!playlistId) throw new Error('播放列表未指定')

    try {
      const { error } = await supabase
        .from('albums')
        .delete()
        .eq('id', albumId)
        .eq('playlist_id', playlistId)

      if (error) throw error

      // 更新本地状态
      setAlbums(prev => prev.filter(a => a.id !== albumId))
    } catch (err) {
      console.error('Error removing album:', err)
      throw err
    }
  }, [playlistId])

  /**
   * 更新专辑信息
   * @param {string} albumId - 专辑记录 ID
   * @param {Object} updates - 要更新的字段
   */
  const updateAlbum = useCallback(async (albumId, updates) => {
    if (!playlistId) throw new Error('播放列表未指定')

    try {
      const { data, error } = await supabase
        .from('albums')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', albumId)
        .eq('playlist_id', playlistId)
        .select()
        .single()

      if (error) throw error

      // 更新本地状态
      setAlbums(prev =>
        prev.map(a => (a.id === albumId ? { ...a, ...data } : a))
      )
      return data
    } catch (err) {
      console.error('Error updating album:', err)
      throw err
    }
  }, [playlistId])

  // 初始加载
  useEffect(() => {
    fetchAlbums()
  }, [fetchAlbums])

  return {
    albums,
    loading,
    error,
    addAlbum,
    removeAlbum,
    updateAlbum,
    refreshAlbums: fetchAlbums,
  }
}

export default useAlbums
