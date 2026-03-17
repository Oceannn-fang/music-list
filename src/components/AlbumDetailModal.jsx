import React, { useState } from 'react'

const statusOptions = [
  { value: 'want_to_listen', label: '想听', emoji: '🔖' },
  { value: 'listening', label: '在听', emoji: '🎧' },
  { value: 'listened', label: '听过', emoji: '✅' },
]

const AlbumDetailModal = ({ album, isOpen, onClose, onUpdate }) => {
  const [rating, setRating] = useState(album?.rating || 0)
  const [review, setReview] = useState(album?.review || '')
  const [status, setStatus] = useState(album?.status || 'listened')
  const [tags, setTags] = useState(album?.tags?.join(', ') || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen || !album) return null

  const handleSave = async () => {
    setIsSubmitting(true)
    try {
      await onUpdate(album.id, {
        rating: rating > 0 ? rating : null,
        review: review.trim() || null,
        status,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      })
      onClose()
    } catch (err) {
      alert('保存失败: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // 渲染星星
  const renderStars = () => {
    return (
      <div className="flex gap-1">
        {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            className="relative w-5 h-5 focus:outline-none group"
          >
            <span className={`text-xl transition-colors ${
              rating >= star ? 'text-yellow-400' : 'text-gray-600'
            }`}>
              {rating >= star ? '★' : '☆'}
            </span>
            {/* 半星悬停提示 */}
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 text-xs text-gray-400 -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
              {star}★
            </span>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="p-4 border-b border-white/10 flex items-start gap-4">
          <img 
            src={album.cover_url || album.coverUrl} 
            alt={album.name}
            className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold truncate">{album.name}</h2>
            <p className="text-gray-400 text-sm">{album.artist}</p>
            {album.release_date && (
              <p className="text-gray-500 text-xs mt-1">{album.release_date}</p>
            )}
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

        {/* 内容 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          
          {/* 评分 */}
          <div>
            <label className="text-sm text-gray-400 block mb-2">评分</label>
            {renderStars()}
            {rating > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                当前评分: <span className="text-yellow-400 font-medium">{rating}★</span>
              </p>
            )}
          </div>

          {/* 状态 */}
          <div>
            <label className="text-sm text-gray-400 block mb-2">收听状态</label>
            <div className="flex gap-2">
              {statusOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setStatus(option.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    status === option.value
                      ? 'bg-green-500 text-black'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <span className="mr-1">{option.emoji}</span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 短评 */}
          <div>
            <label className="text-sm text-gray-400 block mb-2">
              短评
              <span className="text-gray-600 ml-2">({review.length}/140)</span>
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value.slice(0, 140))}
              placeholder="写下你的感受..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 resize-none"
              rows={3}
            />
          </div>

          {/* 标签 */}
          <div>
            <label className="text-sm text-gray-400 block mb-2">
              标签
              <span className="text-gray-600 ml-2">用逗号分隔</span>
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="黑胶, 睡前听, 神专..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
            />
          </div>
        </div>

        {/* 底部 */}
        <div className="p-4 border-t border-white/10 flex gap-3">
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-semibold rounded-xl transition-colors"
          >
            {isSubmitting ? '保存中...' : '保存'}
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

export default AlbumDetailModal
