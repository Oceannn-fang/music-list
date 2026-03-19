import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { INITIAL_ALBUMS, DEFAULT_PLAYLIST } from '../data/initialData'

// 本地存储键名
const STORAGE_KEY = 'music_lists_playlists'
const ALBUMS_KEY = 'music_lists_albums'
const INIT_KEY = 'music_lists_initialized'

/**
 * 播放列表管理 Hook（支持本地存储和 Supabase）
 */
export const usePlaylists = (userId, isGuestMode = false) => {
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // 从本地存储读取
  const loadFromLocal = useCallback(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }, [])

  // 保存到本地存储
  const saveToLocal = useCallback((data) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (err) {
      console.error('Error saving to localStorage:', err)
    }
  }, [])

  /**
   * 自动初始化访客数据
   */
  const autoInitGuestData = useCallback(() => {
    const alreadyInit = localStorage.getItem(INIT_KEY) === 'true'
    if (alreadyInit) return

    // 创建默认清单
    const playlist = {
      id: 'local_' + Date.now(),
      user_id: 'guest',
      name: DEFAULT_PLAYLIST.name,
      description: DEFAULT_PLAYLIST.description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // 保存清单
    saveToLocal([playlist])

    // 导入专辑数据
    const albumsData = {}
    albumsData[playlist.id] = INITIAL_ALBUMS.map((a, i) => ({
      id: 'album_' + Date.now() + '_' + i,
      playlist_id: playlist.id,
      name: a.album,
      artist: a.artist,
      added_at: a.date || new Date().toISOString(),
      spotify_id: null,
      cover_url: null,
    }))
    localStorage.setItem(ALBUMS_KEY, JSON.stringify(albumsData))

    // 标记已初始化
    localStorage.setItem(INIT_KEY, 'true')
    
    return playlist
  }, [])

  /**
   * 获取用户的所有播放列表
   */
  const fetchPlaylists = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      if (isGuestMode) {
        // 访客模式：自动初始化数据（首次）
        autoInitGuestData()
        // 从 localStorage 读取
        const data = loadFromLocal()
        setPlaylists(data)
      } else if (userId) {
        // 登录模式：从 Supabase 读取
        const { data, error } = await supabase
          .from('playlists')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) throw error
        setPlaylists(data || [])
      } else {
        setPlaylists([])
      }
    } catch (err) {
      console.error('Error fetching playlists:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [userId, isGuestMode, loadFromLocal])

  /**
   * 创建新播放列表
   */
  const createPlaylist = useCallback(async (name, description = '') => {
    if (!name.trim()) throw new Error('播放列表名称不能为空')

    const newPlaylist = {
      id: 'local_' + Date.now(),
      user_id: userId || 'guest',
      name: name.trim(),
      description: description.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    try {
      if (isGuestMode) {
        // 访客模式：保存到 localStorage
        const current = loadFromLocal()
        const updated = [newPlaylist, ...current]
        saveToLocal(updated)
        setPlaylists(updated)
      } else if (userId) {
        // 登录模式：保存到 Supabase
        const { data, error } = await supabase
          .from('playlists')
          .insert([{
            user_id: userId,
            name: name.trim(),
            description: description.trim(),
          }])
          .select()
          .single()

        if (error) throw error
        setPlaylists(prev => [data, ...prev])
        return data
      }

      return newPlaylist
    } catch (err) {
      console.error('Error creating playlist:', err)
      throw err
    }
  }, [userId, isGuestMode, loadFromLocal, saveToLocal])

  /**
   * 删除播放列表
   */
  const deletePlaylist = useCallback(async (id) => {
    try {
      if (isGuestMode) {
        const current = loadFromLocal()
        const updated = current.filter(p => p.id !== id)
        saveToLocal(updated)
        setPlaylists(updated)
        
        // 同时删除关联的专辑
        const albumsData = JSON.parse(localStorage.getItem(ALBUMS_KEY) || '{}')
        delete albumsData[id]
        localStorage.setItem(ALBUMS_KEY, JSON.stringify(albumsData))
      } else if (userId) {
        const { error } = await supabase
          .from('playlists')
          .delete()
          .eq('id', id)
          .eq('user_id', userId)

        if (error) throw error
        setPlaylists(prev => prev.filter(p => p.id !== id))
      }
    } catch (err) {
      console.error('Error deleting playlist:', err)
      throw err
    }
  }, [userId, isGuestMode, loadFromLocal, saveToLocal])

  /**
   * 更新播放列表
   */
  const updatePlaylist = useCallback(async (id, updates) => {
    try {
      if (isGuestMode) {
        const current = loadFromLocal()
        const updated = current.map(p => 
          p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
        )
        saveToLocal(updated)
        setPlaylists(updated)
        return updated.find(p => p.id === id)
      } else if (userId) {
        const { data, error } = await supabase
          .from('playlists')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .eq('user_id', userId)
          .select()
          .single()

        if (error) throw error
        setPlaylists(prev => prev.map(p => (p.id === id ? { ...p, ...data } : p)))
        return data
      }
    } catch (err) {
      console.error('Error updating playlist:', err)
      throw err
    }
  }, [userId, isGuestMode, loadFromLocal, saveToLocal])

  /**
   * 导入专辑到播放列表
   */
  const importAlbums = useCallback(async (playlistId, albums) => {
    try {
      if (isGuestMode) {
        const albumsData = JSON.parse(localStorage.getItem(ALBUMS_KEY) || '{}')
        albumsData[playlistId] = albums.map((a, i) => ({
          id: 'album_' + Date.now() + '_' + i,
          playlist_id: playlistId,
          name: a.album,
          artist: a.artist,
          added_at: a.date || new Date().toISOString(),
          spotify_id: null,
          cover_url: null,
        }))
        localStorage.setItem(ALBUMS_KEY, JSON.stringify(albumsData))
      } else {
        // Supabase 模式：批量插入
        const inserts = albums.map((a, i) => ({
          playlist_id: playlistId,
          name: a.album,
          artist: a.artist,
          added_at: a.date || new Date().toISOString(),
        }))
        
        const { error } = await supabase.from('playlist_albums').insert(inserts)
        if (error) throw error
      }
    } catch (err) {
      console.error('Error importing albums:', err)
      throw err
    }
  }, [isGuestMode])

  // 初始加载
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
    importAlbums,
    refreshPlaylists: fetchPlaylists,
  }
}

export default usePlaylists
