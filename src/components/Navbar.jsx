import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { useAuth } from '../context/useAuth';
import AvatarDropdown from './AvatarDropdown';
import useWindowWidth from '../hooks/useWindowWidth';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const { isMobile } = useWindowWidth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="bg-white/90 backdrop-blur-md border-b border-orange-100/60 sticky top-0 z-50 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br. from-orange-400 to-orange-600 text-white flex items-center justify-center text-xl shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              🍽️
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold text-gray-900 tracking-tight leading-none group-hover:text-orange-500 transition-colors">
                Poodiest
              </span>
              <span className="text-[10px] md:text-xs font-semibold tracking-widest text-orange-500 uppercase mt-0.5">
                COMMUNITY KITCHEN
              </span>
            </div>
          </Link>

          {/* Desktop Center Navigation Links */}
          {!isMobile && (
            <div className="flex items-center gap-8 text-sm font-medium text-gray-700">
              <Link to="/" className="transition-colors hover:text-orange-600">
                Home
              </Link>
              <Link to="#category" className="transition-colors hover:text-orange-600">
                Category
              </Link>
              <Link to="#about" className="transition-colors hover:text-orange-600">
                About Us
              </Link>
            </div>
          )}

          {/* Desktop Right Side (Auth / Profile) */}
          {!isMobile && (
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <AvatarDropdown />
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:text-orange-500 hover:bg-orange-50 transition-all"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-md shadow-orange-500/25 transition-all transform hover:-translate-y-0.5"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Mobile Hamburger Button */}
          {isMobile && (
            <button
              onClick={() => setMenuOpen(true)}
              className="p-2.5 rounded-2xl bg-orange-50/80 border border-orange-100 text-orange-600 hover:bg-orange-100 transition-colors"
              aria-label="Open menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Drawer Overlay & Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setMenuOpen(false)} />
          
          <div className="relative ml-auto w-80 max-w-full bg-white h-full shadow-2xl flex flex-col z-10">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <span className="font-serif font-bold text-gray-900 text-lg flex items-center gap-2">
                <span>🍽️</span> Navigation Menu
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>

            {isAuthenticated && user && (
              <div className="p-5 bg-orange-50/60 border-b border-gray-100 flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white font-bold text-lg flex items-center justify-center shadow-md">
                  {(user.name || user.username || 'U')[0].toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <div className="font-bold text-gray-900 text-base truncate">{user.name || user.username}</div>
                  <div className="text-xs text-orange-600 font-medium truncate">Active Creator</div>
                </div>
              </div>
            )}

            <div className="flex-1 p-5 flex flex-col gap-2.5 overflow-y-auto">
              <Link 
                to="/" 
                onClick={() => setMenuOpen(false)} 
                className={`px-4 py-3.5 rounded-2xl font-semibold flex items-center gap-3 transition-colors ${
                  isActive('/') ? 'bg-orange-500 text-white shadow-md' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">🏠</span> Home Feed
              </Link>

              {isAuthenticated ? (
                <>
                  <Link 
                    to="/create-post" 
                    onClick={() => setMenuOpen(false)} 
                    className={`px-4 py-3.5 rounded-2xl font-semibold flex items-center gap-3 transition-colors ${
                      isActive('/create-post') ? 'bg-orange-500 text-white shadow-md' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-lg">➕</span> Create New Recipe
                  </Link>
                  <Link 
                    to="/account" 
                    onClick={() => setMenuOpen(false)} 
                    className={`px-4 py-3.5 rounded-2xl font-semibold flex items-center gap-3 transition-colors ${
                      isActive('/account') ? 'bg-orange-500 text-white shadow-md' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-lg">👤</span> My Profile & Recipes
                  </Link>
                  <Link 
                    to="/settings" 
                    onClick={() => setMenuOpen(false)} 
                    className={`px-4 py-3.5 rounded-2xl font-semibold flex items-center gap-3 transition-colors ${
                      isActive('/settings') ? 'bg-orange-500 text-white shadow-md' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-lg">⚙️</span> Account Settings
                  </Link>
                </>
              ) : (
                <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-gray-100">
                  <Link 
                    to="/login" 
                    onClick={() => setMenuOpen(false)} 
                    className="w-full py-3.5 rounded-2xl font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 text-center transition-colors"
                  >
                    Log In
                  </Link>
                  <Link 
                    to="/signup" 
                    onClick={() => setMenuOpen(false)} 
                    className="w-full py-3.5 rounded-2xl font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-md text-center transition-colors"
                  >
                    Sign Up Free
                  </Link>
                </div>
              )}
            </div>

            {isAuthenticated && (
              <div className="p-5 border-t border-gray-100 bg-gray-50/50">
                <button
                  onClick={handleLogout}
                  className="w-full py-3.5 rounded-2xl text-red-600 font-semibold bg-white border border-red-100 hover:bg-red-50 shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  <span>🚪</span> Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}