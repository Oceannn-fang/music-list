import React, { useState, useEffect } from 'react'
import { getRecentlyPlayed } from '../lib/spotify'
import AlbumCard from './AlbumCard'

const RecentlyPlayedModal = ({ isOpen, onClose, accessToken, onAddAlbums, existingAlbums = [] }) => {
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [adding, setAdding] = useState(false)

  const existingIds = new Set(existingAlbums.map(a => a.spotify_id || a.id))

  useEffect(() => {
    if (isOpen && accessToken) {
      fetchRecentlyPlayed()
    }
  }, [isOpen, accessToken])

  const fetchRecentlyPlayed = async () => {
    setLoading(true)
    setError(null)
    
    // 获取最近7天的播放记录
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    
    const result = await getRecentlyPlayed(accessToken, 50, oneWeekAgo)
    
    if (result.error) {
      setError(result.error)
    } else {
      // 过滤掉已添加的
      const newAlbums = result.albums.filter(a => !existingIds.has(a.id))
      setAlbums(newAlbums)
    }
    
    setLoading(false)
  }

  const toggleSelection = (albumId) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(albumId)) {
        newSet.delete(albumId)
      } else {
        newSet.add(albumId)
      }
      return newSet
    })
  }

  const selectAll = () => {
    setSelectedIds(new Set(albums.map(a => a.id)))
  }

  const deselectAll = () => {
    setSelectedIds(new Set())
  }

  const handleAdd = async () => {
    if (selectedIds.size === 0) return
    
    setAdding(true)
    const selectedAlbums = albums.filter(a => selectedIds.has(a.id))
    
    try {
      for (const album of selectedAlbums) {
        await onAddAlbums(album)
      }
      onClose()
    } catch (err) {
      setError('添加失败: ' + err.message)
    } finally {
      setAdding(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col">
        {/* 头部 */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">同步最近播放</h2>
            <p className="text-sm text-gray-400">
              最近7天听过 {albums.length} 张新专辑
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 工具栏 */}
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={selectAll}
              className="px-3 py-1.5 text-sm bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              全选
            </button>
            <button
              onClick={deselectAll}
              className="px-3 py-1.5 text-sm bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              取消全选
            </button>
          </div>
          <span className="text-sm text-gray-400">
            已选择 {selectedIds.size} 张
          </span>
        </div>

        {/* 内容 */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-400 text-center py-8">
              {error}
              {error.includes('权限') && (
                <p className="text-sm text-gray-400 mt-2">
                  请点击"重新登录"授权访问播放历史
                </p>
              )}
            </div>
          ) : albums.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">🎵</div>
              <p>最近7天没有新的专辑播放记录</p>
              <p className="text-sm mt-2">或者这些专辑已经在清单中了</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {albums.map(album => (
                <div 
                  key={album.id}
                  onClick={() => toggleSelection(album.id)}
                  className={`relative cursor-pointer rounded-xl overflow-hidden transition-all ${
                    selectedIds.has(album.id) 
                      ? 'ring-2 ring-green-500 ring-offset-2 ring-offset-gray-900' 
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <AlbumCard album={album} showRemove={false} />
                  
                  {/* 选择标记 */}
                  <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center ${
                    selectedIds.has(album.id) 
                      ? 'bg-green-500 text-black' 
                      : 'bg-black/50 text-gray-400'
                  }`}>
                    {selectedIds.has(album.id) ? '✓' : '+'}
                  </div>
                  
                  {/* 播放时间 */}
                  {album.playedAt && (
                    <div className="absolute bottom-2 left-2 text-[10px] text-white bg-black/50 px-1.5 py-0.5 rounded">
                      {new Date(album.playedAt).toLocaleDateString('zh-CN', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部 */}
        <div className="p-4 border-t border-white/10 flex gap-3">
          <button
            onClick={handleAdd}
            disabled={selectedIds.size === 0 || adding}
            className="flex-1 px-4 py-3 bg-green-500 hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-xl transition-colors"
          >
            {adding 
              ? '添加中...' 
              : `添加 ${selectedIds.size} 张到清单`
            }
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 text-gray-400 hover:text-white transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  )
}

export default RecentlyPlayedModal
