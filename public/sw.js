// Service Worker for PWA
const CACHE_NAME = 'music-lists-v1'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
]

// 安装时缓存静态资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// 激活时清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// 拦截请求，优先从缓存读取
self.addEventListener('fetch', (event) => {
  // 跳过非 GET 请求、API 请求、chrome-extension 请求
  const url = new URL(event.request.url)
  if (event.request.method !== 'GET' || 
      event.request.url.includes('api.spotify.com') ||
      event.request.url.includes('supabase.co') ||
      url.protocol === 'chrome-extension:') {
    return
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // 命中缓存直接返回
      if (response) {
        return response
      }

      // 否则请求网络并缓存
      return fetch(event.request).then((fetchResponse) => {
        // 只缓存静态资源
        if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
          return fetchResponse
        }

        const responseToCache = fetchResponse.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })

        return fetchResponse
      })
    })
  )
})
