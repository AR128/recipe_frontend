import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../context/useAuth';
import AvatarDropdown from './AvatarDropdown';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const [prevPathname, setPrevPathname] = useState(location.pathname);
  if (location.pathname !== prevPathname) {
    setPrevPathname(location.pathname);
    setMenuOpen(false);
  }

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <>
      <nav className="fixed top-0 z-50 w-full bg-[#FAFAFA] border-b border-[#E5E5E5]">
        <div className="max-w-350 mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          
          {/* Pure Typographic Logo */}
          <Link to="/" className="flex items-center">
            <span className="font-serif text-3xl font-bold text-[#1A1A1A] tracking-tighter leading-none hover:opacity-70 transition-opacity">
              Poodiest.
            </span>
          </Link>

          {/* Minimalist Center Links */}
          <div className="hidden md:flex items-center gap-10">
            <Link to="/" className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1A1A1A] hover:text-[#666666] transition-colors">Feed</Link>
            <Link to="#category" className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1A1A1A] hover:text-[#666666] transition-colors">Categories</Link>
            <Link to="#about" className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1A1A1A] hover:text-[#666666] transition-colors">About</Link>
          </div>

          {/* Clean Auth Actions */}
          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <AvatarDropdown />
            ) : (
              <div className="flex items-center gap-6">
                <Link to="/login" className="text-sm font-medium text-[#666666] hover:text-[#1A1A1A] transition-colors">
                  Log in
                </Link>
                <Link to="/signup" className="text-sm font-medium text-[#FAFAFA] bg-[#1A1A1A] px-6 py-2.5 hover:bg-[#333333] transition-colors">
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle (Thin line icon) */}
          <button
            onClick={() => { setMenuOpen(true); document.body.style.overflow = 'hidden'; }}
            className="md:hidden text-[#1A1A1A]"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="3" y1="8" x2="21" y2="8" />
              <line x1="3" y1="16" x2="21" y2="16" />
            </svg>
          </button>
        </div>
      </nav>
      <div className="h-20" aria-hidden="true" />

      {/* Full-Screen Minimal Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#FAFAFA]">
          <div className="flex items-center justify-between px-6 h-20 border-b border-[#E5E5E5]">
             <span className="font-serif text-2xl font-bold tracking-tighter text-[#1A1A1A]">Poodiest.</span>
             <button onClick={() => { setMenuOpen(false); document.body.style.overflow = ''; }} className="text-[#1A1A1A]">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
             </button>
          </div>
          
          <div className="flex-1 px-6 py-12 flex flex-col gap-8 text-2xl font-serif">
            <Link to="/" onClick={() => { setMenuOpen(false); document.body.style.overflow = ''; }} className="text-[#1A1A1A] hover:opacity-60">Home Feed</Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/create-post" onClick={() => { setMenuOpen(false); document.body.style.overflow = ''; }} className="text-[#1A1A1A] hover:opacity-60">Create Recipe</Link>
                <Link to="/account" onClick={() => { setMenuOpen(false); document.body.style.overflow = ''; }} className="text-[#1A1A1A] hover:opacity-60">My Profile</Link>
                <button onClick={handleLogout} className="text-left text-[#1A1A1A] hover:opacity-60 mt-auto">Log Out</button>
              </>
            ) : (
              <div className="mt-auto flex flex-col gap-4">
                <Link to="/login" onClick={() => { setMenuOpen(false); document.body.style.overflow = ''; }} className="text-lg font-sans font-medium text-[#1A1A1A]">Log in</Link>
                <Link to="/signup" onClick={() => { setMenuOpen(false); document.body.style.overflow = ''; }} className="text-lg font-sans font-medium text-[#FAFAFA] bg-[#1A1A1A] px-6 py-4 text-center">Sign up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}