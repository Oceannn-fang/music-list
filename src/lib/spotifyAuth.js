/**
 * Spotify 纯 OAuth 认证（PKCE 流程）
 * 不依赖 Supabase Auth Providers
 */

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || 'http://127.0.0.1:5173/callback'
const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize'
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'

const SCOPES = [
  'user-read-email',
  'user-read-private',
  'playlist-read-private',
  'user-library-read',
].join(' ')

/**
 * 生成随机字符串（PKCE code_verifier）
 */
function generateRandomString(length = 128) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  let text = ''
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

/**
 * 生成 code_challenge（SHA256 后 base64url 编码）
 */
async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

/**
 * 启动 Spotify 登录流程
 */
export async function initiateSpotifyLogin() {
  const codeVerifier = generateRandomString(128)
  const codeChallenge = await generateCodeChallenge(codeVerifier)
  const state = generateRandomString(32)

  // 存储 code_verifier 用于后续换 token
  localStorage.setItem('spotify_code_verifier', codeVerifier)
  localStorage.setItem('spotify_auth_state', state)

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    state: state,
    scope: SCOPES,
  })

  window.location.href = `${SPOTIFY_AUTH_URL}?${params.toString()}`
}

/**
 * 处理回调，用 code 换 token
 */
export async function handleSpotifyCallback() {
  // 防止重复处理（React StrictMode 双重渲染）
  if (window.__spotifyAuthHandled) {
    return null
  }
  window.__spotifyAuthHandled = true

  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')
  const state = urlParams.get('state')
  const error = urlParams.get('error')

  const storedState = localStorage.getItem('spotify_auth_state')
  const codeVerifier = localStorage.getItem('spotify_code_verifier')

  if (error) {
    localStorage.removeItem('spotify_auth_state')
    localStorage.removeItem('spotify_code_verifier')
    throw new Error(`Spotify auth error: ${error}`)
  }

  if (!code) {
    throw new Error('No authorization code received')
  }

  if (state !== storedState) {
    throw new Error('State mismatch - possible CSRF attack')
  }

  // 校验通过后再清理存储
  localStorage.removeItem('spotify_auth_state')

  if (!codeVerifier) {
    throw new Error('No code verifier found')
  }

  // 用 code 换 token
  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error_description || 'Failed to get token')
  }

  const tokenData = await response.json()
  
  // 存储 token
  const expiresAt = Date.now() + tokenData.expires_in * 1000
  localStorage.setItem('spotify_access_token', tokenData.access_token)
  localStorage.setItem('spotify_refresh_token', tokenData.refresh_token)
  localStorage.setItem('spotify_token_expires_at', String(expiresAt))

  // 获取用户信息
  const userInfo = await fetchSpotifyUserInfo(tokenData.access_token)
  localStorage.setItem('spotify_user_id', userInfo.id)
  localStorage.setItem('spotify_user_email', userInfo.email)
  localStorage.setItem('spotify_user_display_name', userInfo.display_name || userInfo.id)

  return {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresAt,
    user: userInfo,
  }
}

/**
 * 获取 Spotify 用户信息
 */
async function fetchSpotifyUserInfo(accessToken) {
  const response = await fetch('https://api.spotify.com/v1/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch user info')
  }

  return await response.json()
}

/**
 * 刷新 access token
 */
export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('spotify_refresh_token')
  
  if (!refreshToken) {
    throw new Error('No refresh token available')
  }

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  if (!response.ok) {
    // 刷新失败，清除登录状态
    clearSpotifyAuth()
    throw new Error('Failed to refresh token')
  }

  const tokenData = await response.json()
  const expiresAt = Date.now() + tokenData.expires_in * 1000
  
  localStorage.setItem('spotify_access_token', tokenData.access_token)
  localStorage.setItem('spotify_token_expires_at', String(expiresAt))
  
  if (tokenData.refresh_token) {
    localStorage.setItem('spotify_refresh_token', tokenData.refresh_token)
  }

  return {
    accessToken: tokenData.access_token,
    expiresAt,
  }
}

/**
 * 获取当前 access token（自动刷新）
 */
export async function getAccessToken() {
  const accessToken = localStorage.getItem('spotify_access_token')
  const expiresAt = Number(localStorage.getItem('spotify_token_expires_at'))

  if (!accessToken) {
    return null
  }

  // 如果 token 将在 5 分钟内过期，刷新它
  if (expiresAt && Date.now() > expiresAt - 5 * 60 * 1000) {
    try {
      const refreshed = await refreshAccessToken()
      return refreshed.accessToken
    } catch {
      return null
    }
  }

  return accessToken
}

/**
 * 清除 Spotify 认证状态
 */
export function clearSpotifyAuth() {
  localStorage.removeItem('spotify_access_token')
  localStorage.removeItem('spotify_refresh_token')
  localStorage.removeItem('spotify_token_expires_at')
  localStorage.removeItem('spotify_user_id')
  localStorage.removeItem('spotify_user_email')
  localStorage.removeItem('spotify_user_display_name')
}

/**
 * 检查是否已登录
 */
export function isLoggedIn() {
  return !!localStorage.getItem('spotify_access_token')
}

/**
 * 获取当前用户ID（用于 Supabase 关联）
 */
export function getCurrentUserId() {
  return localStorage.getItem('spotify_user_id')
}

/**
 * 获取当前用户信息
 */
export function getCurrentUser() {
  return {
    id: localStorage.getItem('spotify_user_id'),
    email: localStorage.getItem('spotify_user_email'),
    displayName: localStorage.getItem('spotify_user_display_name'),
  }
}

export default {
  initiateSpotifyLogin,
  handleSpotifyCallback,
  refreshAccessToken,
  getAccessToken,
  clearSpotifyAuth,
  isLoggedIn,
  getCurrentUserId,
  getCurrentUser,
}
