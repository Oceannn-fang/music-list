import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

/**
 * 播放列表管理 Hook
 * @param {string} userId - 当前用户 ID
 * @returns {{
 *   playlists: Array,
 *   loading: boolean,
 *   error: string | null,
 *   createPlaylist: (name: string, description?: string) => Promise<Object>,
 *   deletePlaylist: (id: string) => Promise<void>,
 *   updatePlaylist: (id: string, updates: Object) => Promise<void>,
 *   refreshPlaylists: () => Promise<void>
 * }}
 */
export const usePlaylists = (userId) => {
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * 获取用户的所有播放列表
   */
  const fetchPlaylists = useCallback(async () => {
    if (!userId) {
      setPlaylists([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      setPlaylists(data || [])
    } catch (err) {
      console.error('Error fetching playlists:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [userId])

  /**
   * 创建新播放列表
   * @param {string} name - 播放列表名称
   * @param {string} description - 播放列表描述（可选）
   */
  const createPlaylist = useCallback(async (name, description = '') => {
    if (!userId) throw new Error('用户未登录')
    if (!name.trim()) throw new Error('播放列表名称不能为空')

    try {
      const { data, error } = await supabase
        .from('playlists')
        .insert([
          {
            user_id: userId,
            name: name.trim(),
            description: description.trim(),
          },
        ])
        .select()
        .single()

      if (error) throw error

      // 更新本地状态
      setPlaylists(prev => [data, ...prev])
      return data
    } catch (err) {
      console.error('Error creating playlist:', err)
      throw err
    }
  }, [userId])

  /**
   * 删除播放列表
   * @param {string} id - 播放列表 ID
   */
  const deletePlaylist = useCallback(async (id) => {
    if (!userId) throw new Error('用户未登录')

    try {
      const { error } = await supabase
        .from('playlists')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (error) throw error

      // 更新本地状态
      setPlaylists(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      console.error('Error deleting playlist:', err)
      throw err
    }
  }, [userId])

  /**
   * 更新播放列表
   * @param {string} id - 播放列表 ID
   * @param {Object} updates - 要更新的字段
   */
  const updatePlaylist = useCallback(async (id, updates) => {
    if (!userId) throw new Error('用户未登录')

    try {
      const { data, error } = await supabase
        .from('playlists')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error

      // 更新本地状态
      setPlaylists(prev =>
        prev.map(p => (p.id === id ? { ...p, ...data } : p))
      )
      return data
    } catch (err) {
      console.error('Error updating playlist:', err)
      throw err
    }
  }, [userId])

  // 初始加载和 userId 变化时重新获取
  useEffect(() => {
    fetchPlaylists()
  }, [fetchPlaylists])

  return {
    playlists,
    loading,
    error,
    createPlaylist,
    deletePlaylist,
    updatePlaylist,
    refreshPlaylists: fetchPlaylists,
  }
}

export default usePlaylists
