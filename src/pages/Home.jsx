import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlaylists } from '../hooks/usePlaylists'
import { useAuth } from '../hooks/useAuth'
import { getCurrentUserId } from '../lib/spotifyAuth'
import PlaylistCard from '../components/PlaylistCard'

const Home = ({ user, isLoggedIn, onSignIn, getSpotifyToken }) => {
  const navigate = useNavigate()
  const userId = getCurrentUserId()
  const { playlists, loading, error, createPlaylist, deletePlaylist, refreshPlaylists } = usePlaylists(userId)
  
  const [isCreating, setIsCreating] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('')

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newPlaylistName.trim()) return

    try {
      const playlist = await createPlaylist(newPlaylistName, newPlaylistDesc)
      setNewPlaylistName('')
      setNewPlaylistDesc('')
      setIsCreating(false)
      navigate(`/playlist/${playlist.id}`)
    } catch (err) {
      alert('创建失败: ' + err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('确定要删除这个清单吗？')) return
    
    try {
      await deletePlaylist(id)
    } catch (err) {
      alert('删除失败: ' + err.message)
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-black" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-4">Music Lists</h1>
        <p className="text-gray-400 mb-8 max-w-md">
          创建你的音乐清单，记录听过的专辑，生成属于你的唱片墙
        </p>
        <button
          onClick={onSignIn}
          className="px-8 py-3 bg-green-500 hover:bg-green-400 text-black font-semibold rounded-full transition-all hover:scale-105"
        >
          用 Spotify 登录开始
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">我的清单</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-green-500 hover:bg-green-400 text-black font-medium rounded-full transition-all hover:scale-105 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新建清单
        </button>
      </div>

      {/* 创建表单 */}
      {isCreating && (
        <form onSubmit={handleCreate} className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
          <input
            type="text"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            placeholder="清单名称（如：2026年专辑）"
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 mb-3"
            autoFocus
          />
          <input
            type="text"
            value={newPlaylistDesc}
            onChange={(e) => setNewPlaylistDesc(e.target.value)}
            placeholder="描述（可选）"
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 mb-3"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 hover:bg-green-400 text-black font-medium rounded-lg transition-colors"
            >
              创建
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              取消
            </button>
          </div>
        </form>
      )}

      {/* 清单列表 */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : error ? (
        <div className="text-red-400 text-center py-12">{error}</div>
      ) : playlists.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="mb-4">还没有清单</p>
          <button
            onClick={() => setIsCreating(true)}
            className="text-green-400 hover:text-green-300"
          >
            创建一个
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {playlists.map(playlist => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              onClick={(p) => navigate(`/playlist/${p.id}`)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Home
