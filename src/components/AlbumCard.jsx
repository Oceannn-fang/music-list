import React from 'react'

const statusEmoji = {
  want_to_listen: '🔖',
  listening: '🎧',
  listened: '✅',
}

const AlbumCard = ({ album, onRemove, showRemove = true, onClick, showRating = true }) => {
  const handleClick = (e) => {
    // 如果点击的是移除按钮，不触发 onClick
    if (e.target.closest('.remove-btn')) return
    if (onClick) onClick(album)
  }

  return (
    <div 
      onClick={handleClick}
      className={`group relative bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl overflow-hidden transition-all hover:scale-[1.02] hover:shadow-xl ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* 封面 */}
      <div className="aspect-square bg-gradient-to-br from-gray-700 to-gray-800 relative overflow-hidden">
        {album.cover_url || album.coverUrl ? (
          <img 
            src={album.cover_url || album.coverUrl} 
            alt={album.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>
        )}

        {/* 移除按钮 */}
        {showRemove && onRemove && (
          <button
            onClick={() => onRemove(album.id)}
            className="remove-btn absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* 状态标记 */}
        {album.status && statusEmoji[album.status] && (
          <div className="absolute top-2 left-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-xs">
            {statusEmoji[album.status]}
          </div>
        )}

        {/* 评分标记 */}
        {showRating && album.rating && (
          <div className="absolute bottom-2 right-2 bg-yellow-500/90 text-black text-xs font-bold px-2 py-0.5 rounded-full">
            {album.rating}★
          </div>
        )}

        {/* 点击提示 */}
        {onClick && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="text-white text-xs font-medium bg-black/50 px-3 py-1 rounded-full">
              点击查看详情
            </span>
          </div>
        )}
      </div>

      {/* 信息 */}
      <div className="p-3">
        <h3 className="font-semibold text-white truncate text-sm mb-1">{album.name}</h3>
        <p className="text-xs text-gray-400 truncate">{album.artist}</p>
        
        {/* 底部信息行 */}
        <div className="flex items-center justify-between mt-2">
          {album.release_date || album.releaseDate ? (
            <p className="text-xs text-gray-500">
              {(album.release_date || album.releaseDate).substring(0, 4)}
            </p>
          ) : (
            <div />
          )}
          
          {/* 有评论时显示标记 */}
          {album.review && (
            <span className="text-xs text-gray-400" title={album.review}>💬</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default AlbumCard
