import { useState, useEffect, useCallback } from 'react'
import {
  initiateSpotifyLogin,
  handleSpotifyCallback,
  getAccessToken,
  clearSpotifyAuth,
  isLoggedIn,
  getCurrentUser,
} from '../lib/spotifyAuth'

/**
 * 认证 Hook（纯 Spotify OAuth 版）
 * 不依赖 Supabase Auth Providers
 */
export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [accessToken, setAccessToken] = useState(null)
  const [loading, setLoading] = useState(true)

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
      
      // 清除 URL 中的参数，跳转回首页
      window.history.replaceState({}, document.title, '/')
    } catch (error) {
      console.error('Callback error:', error)
      clearSpotifyAuth()
      setUser(null)
      setAccessToken(null)
    } finally {
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
   * 登出
   */
  const signOutUser = useCallback(async () => {
    clearSpotifyAuth()
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
    signOut: signOutUser,
    getSpotifyToken,
    isLoggedIn: !!user,
  }
}

export default useAuth
