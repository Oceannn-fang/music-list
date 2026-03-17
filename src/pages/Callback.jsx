import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { handleSpotifyCallback } from '../lib/spotifyAuth'

const Callback = () => {
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  useEffect(() => {
    const processCallback = async () => {
      try {
        await handleSpotifyCallback()
        // 成功后跳转首页
        navigate('/', { replace: true })
      } catch (err) {
        console.error('Callback error:', err)
        setError(err.message)
      }
    }

    processCallback()
  }, [navigate])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-red-400 text-center">
          <p className="text-lg mb-2">登录失败</p>
          <p className="text-sm text-gray-400">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-green-500 text-black rounded-full"
          >
            返回首页
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
      <p className="text-gray-400">登录中...</p>
    </div>
  )
}

export default Callback
