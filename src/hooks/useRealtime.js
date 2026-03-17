import { useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Supabase 实时订阅 Hook
 * 用于监听播放列表和专辑的变化，实现多设备同步
 * 
 * @param {string} playlistId - 要监听的播放列表 ID（可选）
 * @param {Object} callbacks - 回调函数
 * @param {Function} callbacks.onPlaylistChange - 播放列表变化回调
 * @param {Function} callbacks.onAlbumChange - 专辑变化回调
 */
export const useRealtime = (playlistId, callbacks = {}) => {
  const { onPlaylistChange, onAlbumChange } = callbacks

  /**
   * 处理播放列表更新
   */
  const handlePlaylistChange = useCallback((payload) => {
    console.log('Playlist change received:', payload)
    if (onPlaylistChange) {
      onPlaylistChange(payload)
    }
  }, [onPlaylistChange])

  /**
   * 处理专辑更新
   */
  const handleAlbumChange = useCallback((payload) => {
    console.log('Album change received:', payload)
    if (onAlbumChange) {
      onAlbumChange(payload)
    }
  }, [onAlbumChange])

  useEffect(() => {
    // 订阅播放列表表的变化
    const playlistSubscription = supabase
      .channel('playlists-channel')
      .on(
        'postgres_changes',
        {
          event: '*', // 监听所有事件: INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'playlists',
        },
        handlePlaylistChange
      )
      .subscribe()

    // 订阅专辑表的变化
    const albumChannel = supabase.channel('albums-channel')
    
    // 如果有指定播放列表 ID，只监听该列表的专辑
    if (playlistId) {
      albumChannel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'albums',
          filter: `playlist_id=eq.${playlistId}`,
        },
        handleAlbumChange
      )
    } else {
      // 否则监听所有专辑变化
      albumChannel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'albums',
        },
        handleAlbumChange
      )
    }

    albumChannel.subscribe()

    // 清理订阅
    return () => {
      playlistSubscription.unsubscribe()
      albumChannel.unsubscribe()
    }
  }, [playlistId, handlePlaylistChange, handleAlbumChange])

  return {
    isConnected: true, // Supabase 会自动处理连接状态
  }
}

/**
 * 特定播放列表的实时订阅 Hook
 * 简化版，自动刷新专辑列表
 * 
 * @param {string} playlistId - 播放列表 ID
 * @param {Function} refreshCallback - 收到变化时的刷新回调
 */
export const usePlaylistRealtime = (playlistId, refreshCallback) => {
  useRealtime(playlistId, {
    onAlbumChange: useCallback((payload) => {
      // 当专辑变化时，触发刷新
      if (payload.eventType === 'INSERT' || payload.eventType === 'DELETE') {
        console.log('Album changed, refreshing...')
        refreshCallback?.()
      }
    }, [refreshCallback]),
  })
}

export default useRealtime
