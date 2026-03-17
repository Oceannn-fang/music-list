import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Home from './pages/Home'
import Callback from './pages/Callback'
import PlaylistDetail from './pages/PlaylistDetail'
import Stats from './pages/Stats'
import Header from './components/Header'
import './index.css'

function App() {
  const { user, loading, signInWithSpotify, signOut, getSpotifyToken, isLoggedIn } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p>加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <Header 
        user={user} 
        isLoggedIn={isLoggedIn} 
        onSignIn={signInWithSpotify} 
        onSignOut={signOut} 
      />
      
      <main className="container mx-auto px-4 py-6">
        <Routes>
          <Route 
            path="/" 
            element={
              <Home 
                user={user} 
                isLoggedIn={isLoggedIn} 
                onSignIn={signInWithSpotify}
                getSpotifyToken={getSpotifyToken}
              />
            } 
          />
          <Route path="/callback" element={<Callback />} />
          <Route 
            path="/playlist/:id" 
            element={
              <PlaylistDetail 
                user={user}
                getSpotifyToken={getSpotifyToken}
              />
            } 
          />
          <Route 
            path="/stats" 
            element={
              <Stats />
            } 
          />
        </Routes>
      </main>
    </div>
  )
}

export default App
