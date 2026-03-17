import React from 'react'

const PlaylistCard = ({ playlist, onClick, onDelete }) => {
  return (
    <div 
      onClick={() => onClick(playlist)}
      className="group relative bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-green-500/10"
    >
      {/* 封面 */}
      <div className="aspect-square rounded-lg bg-gradient-to-br from-gray-700 to-gray-800 mb-3 overflow-hidden">
        {playlist.cover_url ? (
          <img 
            src={playlist.cover_url} 
            alt={playlist.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>
        )}
      </div>

      {/* 信息 */}
      <h3 className="font-semibold text-white truncate mb-1">{playlist.name}</h3>
      <p className="text-sm text-gray-400 truncate">
        {playlist.description || '暂无描述'}
      </p>
      <p className="text-xs text-gray-500 mt-2">
        {new Date(playlist.created_at).toLocaleDateString('zh-CN')}
      </p>

      {/* 删除按钮 */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(playlist.id)
          }}
          className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}

export default PlaylistCard
