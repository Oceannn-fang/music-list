import React, { useState, useCallback, useEffect } from 'react'
import { searchAlbums } from '../lib/spotify'
import AlbumCard from './AlbumCard'

const SearchModal = ({ isOpen, onClose, accessToken, onAddAlbum, existingAlbums = [] }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [addedIds, setAddedIds] = useState(new Set(existingAlbums.map(a => a.spotify_id || a.id)))

  // 防抖搜索
  useEffect(() => {
    if (!query.trim() || !accessToken) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      setError(null)
      
      const { albums, error } = await searchAlbums(query, accessToken)
      
      if (error) {
        setError(error)
        setResults([])
      } else {
        setResults(albums)
      }
      
      setLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, accessToken])

  const handleAdd = async (album) => {
    try {
      await onAddAlbum(album)
      setAddedIds(prev => new Set([...prev, album.id]))
    } catch (err) {
      // 错误在父组件处理
    }
  }

  if (!isOpen) return null

  const existingIds = new Set(existingAlbums.map(a => a.spotify_id || a.id))

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* 头部 */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-semibold">搜索专辑</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 搜索框 */}
        <div className="p-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="输入专辑名称或艺术家..."
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
            autoFocus
          />
        </div>

        {/* 结果列表 */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-400 text-center py-8">{error}</div>
          ) : results.length === 0 ? (
            query.trim() ? (
              <div className="text-gray-500 text-center py-8">未找到相关专辑</div>
            ) : (
              <div className="text-gray-500 text-center py-8">输入关键词开始搜索</div>
            )
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {results.map(album => (
                <div key={album.id} className="relative">
                  <AlbumCard 
                    album={album} 
                    showRemove={false}
                  />
                  <button
                    onClick={() => handleAdd(album)}
                    disabled={existingIds.has(album.id)}
                    className={`absolute bottom-2 right-2 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      existingIds.has(album.id)
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-green-500 hover:bg-green-400 text-black'
                    }`}
                  >
                    {existingIds.has(album.id) ? '已添加' : '添加'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchModal
