import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

/**
 * 获取用户所有专辑的 Hook（跨所有清单）
 * @param {string} userId - 当前用户 ID
 * @returns {{
 *   albums: Array,
 *   loading: boolean,
 *   error: string | null,
 *   refreshAlbums: () => Promise<void>
 * }}
 */
export const useAllAlbums = (userId) => {
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchAllAlbums = useCallback(async () => {
    if (!userId) {
      setAlbums([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      // 先获取用户的所有 playlist_id
      const { data: playlists, error: playlistError } = await supabase
        .from('playlists')
        .select('id')
        .eq('user_id', userId)

      if (playlistError) throw playlistError

      if (!playlists || playlists.length === 0) {
        setAlbums([])
        return
      }

      const playlistIds = playlists.map(p => p.id)

      // 获取这些清单下的所有专辑
      const { data, error } = await supabase
        .from('albums')
        .select('*')
        .in('playlist_id', playlistIds)
        .order('added_at', { ascending: false })

      if (error) throw error

      setAlbums(data || [])
    } catch (err) {
      console.error('Error fetching all albums:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchAllAlbums()
  }, [fetchAllAlbums])

  return {
    albums,
    loading,
    error,
    refreshAlbums: fetchAllAlbums,
  }
}

export default useAllAlbums
