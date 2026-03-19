import { useState, useEffect, useCallback } from 'react'
import {
  initiateSpotifyLogin,
  handleSpotifyCallback,
  getAccessToken,
  clearSpotifyAuth,
  isLoggedIn,
  getCurrentUser,
} from '../lib/spotifyAuth'

// 访客模式用户
const GUEST_USER = {
  id: 'guest',
  email: 'guest@local',
  displayName: '访客',
  isGuest: true
}

/**
 * 认证 Hook（支持访客模式）
 */
export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [accessToken, setAccessToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isGuestMode, setIsGuestMode] = useState(false)

  useEffect(() => {
    // 检查是否在 callback 页面
    if (window.location.pathname === '/callback') {
      handleCallback()
    } else {
      // 检查现有登录状态
      checkAuthStatus()
    }
  }, [])

  const checkAuthStatus = async () => {
    try {
      // 先检查是否是访客模式
      const guestMode = localStorage.getItem('guest_mode') === 'true'
      setIsGuestMode(guestMode)
      
      if (guestMode) {
        setUser(GUEST_USER)
        setAccessToken('guest')
        setLoading(false)
        return
      }
      
      const token = await getAccessToken()
      const loggedIn = isLoggedIn()
      
      if (loggedIn && token) {
        setAccessToken(token)
        setUser(getCurrentUser())
      } else {
        setUser(null)
        setAccessToken(null)
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setUser(null)
      setAccessToken(null)
    } finally {
      setLoading(false)
    }
  }

  const handleCallback = async () => {
    try {
      setLoading(true)
      const result = await handleSpotifyCallback()
      setAccessToken(result.accessToken)
      setUser(result.user)
      
      // 清除访客模式
      localStorage.removeItem('guest_mode')
      setIsGuestMode(false)
      
      // 强制刷新页面
      window.location.href = '/'
    } catch (error) {
      console.error('Callback error:', error)
      clearSpotifyAuth()
      setUser(null)
      setAccessToken(null)
      setLoading(false)
    }
  }

  /**
   * 启动 Spotify 登录
   */
  const signInWithSpotify = useCallback(async () => {
    try {
      await initiateSpotifyLogin()
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }, [])

  /**
   * 进入访客模式
   */
  const enterGuestMode = useCallback(() => {
    localStorage.setItem('guest_mode', 'true')
    setIsGuestMode(true)
    setUser(GUEST_USER)
    setAccessToken('guest')
  }, [])

  /**
   * 登出
   */
  const signOutUser = useCallback(async () => {
    clearSpotifyAuth()
    localStorage.removeItem('guest_mode')
    setIsGuestMode(false)
    setUser(null)
    setAccessToken(null)
  }, [])

  /**
   * 获取 Spotify 访问令牌
   */
  const getSpotifyToken = useCallback(() => {
    return accessToken
  }, [accessToken])

  return {
    user,
    session: accessToken ? { access_token: accessToken } : null,
    loading,
    signInWithSpotify,
    enterGuestMode,
    signOut: signOutUser,
    getSpotifyToken,
    isLoggedIn: !!user,
    isGuestMode,
  }
}

export default useAuth
