import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAlbums } from '../hooks/useAlbums'
import { usePlaylists } from '../hooks/usePlaylists'
import { usePlaylistRealtime } from '../hooks/useRealtime'
import { getCurrentUserId } from '../lib/spotifyAuth'
import AlbumCard from '../components/AlbumCard'
import SearchModal from '../components/SearchModal'
import AlbumDetailModal from '../components/AlbumDetailModal'
import RecentlyPlayedModal from '../components/RecentlyPlayedModal'

const PlaylistDetail = ({ user, getSpotifyToken }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const userId = getCurrentUserId()
  
  const { playlists } = usePlaylists(userId)
  const playlist = playlists.find(p => p.id === id)
  
  const { 
    albums, 
    loading, 
    error, 
    addAlbum, 
    removeAlbum, 
    updateAlbum,
    refreshAlbums 
  } = useAlbums(id, userId)

  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isSyncOpen, setIsSyncOpen] = useState(false)
  const [selectedAlbum, setSelectedAlbum] = useState(null)
  const [accessToken, setAccessToken] = useState(null)

  // 实时订阅
  usePlaylistRealtime(id, refreshAlbums)

  // 获取 access token
  useEffect(() => {
    const getToken = async () => {
      const token = await getSpotifyToken()
      setAccessToken(token)
    }
    getToken()
  }, [getSpotifyToken])

  const handleAddAlbum = async (album) => {
    try {
      await addAlbum(album)
    } catch (err) {
      alert(err.message)
      throw err
    }
  }

  const handleRemoveAlbum = async (albumId) => {
    if (!confirm('确定要移除这张专辑吗？')) return
    
    try {
      await removeAlbum(albumId)
    } catch (err) {
      alert('移除失败: ' + err.message)
    }
  }

  const handleUpdateAlbum = async (albumId, updates) => {
    await updateAlbum(albumId, updates)
  }

  if (!playlist && !loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 mb-4">清单不存在</p>
        <button
          onClick={() => navigate('/')}
          className="text-green-400 hover:text-green-300"
        >
          返回首页
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* 返回按钮 */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回
      </button>

      {/* 清单信息 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{playlist?.name}</h1>
        <p className="text-gray-400">{playlist?.description || '暂无描述'}</p>
        <p className="text-sm text-gray-500 mt-1">
          {albums.length} 张专辑
        </p>
      </div>

      {/* 操作栏 */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setIsSearchOpen(true)}
          className="px-4 py-2 bg-green-500 hover:bg-green-400 text-black font-medium rounded-full transition-all hover:scale-105 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          搜索添加专辑
        </button>
        
        <button
          onClick={() => setIsSyncOpen(true)}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-full transition-all hover:scale-105 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          同步最近播放
        </button>
      </div>

      {/* 专辑墙 */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : error ? (
        <div className="text-red-400 text-center py-12">{error}</div>
      ) : albums.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="mb-4">还没有专辑</p>
          <button
            onClick={() => setIsSearchOpen(true)}
            className="text-green-400 hover:text-green-300"
          >
            添加一张
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {albums.map(album => (
            <AlbumCard
              key={album.id}
              album={album}
              onRemove={handleRemoveAlbum}
              onClick={setSelectedAlbum}
            />
          ))}
        </div>
      )}

      {/* 搜索弹窗 */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        accessToken={accessToken}
        onAddAlbum={handleAddAlbum}
        existingAlbums={albums}
      />

      {/* 专辑详情弹窗 */}
      <AlbumDetailModal
        album={selectedAlbum}
        isOpen={!!selectedAlbum}
        onClose={() => setSelectedAlbum(null)}
        onUpdate={handleUpdateAlbum}
      />

      {/* 同步最近播放弹窗 */}
      <RecentlyPlayedModal
        isOpen={isSyncOpen}
        onClose={() => setIsSyncOpen(false)}
        accessToken={accessToken}
        onAddAlbums={handleAddAlbum}
        existingAlbums={albums}
      />
    </div>
  )
}

export default PlaylistDetail
