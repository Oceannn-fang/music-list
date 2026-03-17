import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Header = ({ user, isLoggedIn, onSignIn, onSignOut }) => {
  const location = useLocation()
  
  const navItems = [
    { path: '/', label: '我的清单' },
    { path: '/stats', label: '回顾' },
  ]

  return (
    <header className="bg-black/50 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo & Nav */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
              Music Lists
            </h1>
          </Link>
          
          {/* Navigation */}
          {isLoggedIn && (
            <nav className="hidden sm:flex items-center gap-1">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
        </div>

        {/* User Section */}
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <div className="flex items-center gap-2">
                {user?.images?.[0]?.url ? (
                  <img 
                    src={user.images[0].url} 
                    alt={user.display_name}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-black font-bold">
                    {user?.display_name?.[0] || user?.id?.[0] || '?'}
                  </div>
                )}
                <span className="text-sm text-gray-300 hidden sm:inline">
                  {user?.display_name || user?.id}
                </span>
              </div>
              <button
                onClick={onSignOut}
                className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
              >
                退出
              </button>
            </>
          ) : (
            <button
              onClick={onSignIn}
              className="px-6 py-2 bg-green-500 hover:bg-green-400 text-black font-semibold rounded-full transition-all hover:scale-105"
            >
              用 Spotify 登录
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
