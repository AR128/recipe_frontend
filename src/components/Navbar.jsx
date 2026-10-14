import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../context/useAuth';
import AvatarDropdown from './AvatarDropdown';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change
  const [prevPathname, setPrevPathname] = useState(location.pathname);
  if (location.pathname !== prevPathname) {
    setPrevPathname(location.pathname);
    setMenuOpen(false);
  }

  // TASK 3 FIX: Safely handle body scroll locking and Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };

    if (menuOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    // Cleanup function: ALWAYS unlock the screen when component unmounts
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <>
      <nav className="fixed top-0 z-50 w-full bg-[#FAFAFA] border-b border-[#E5E5E5]">
        <div className="max-w-350 mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          
          <Link to="/" className="flex items-center">
            <span className="font-serif text-3xl font-bold text-neutral-900 dark:text-white tracking-tighter leading-none hover:opacity-70 transition-opacity">
              Poodiest.
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            <Link to="/" className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-900 dark:text-neutral-300 hover:text-neutral-500 dark:hover:text-white transition-colors">Feed</Link>
            <Link to="#category" className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-900 dark:text-neutral-300 hover:text-neutral-500 dark:hover:text-white transition-colors">Categories</Link>
            <Link to="#about" className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-900 dark:text-neutral-300 hover:text-neutral-500 dark:hover:text-white transition-colors">About</Link>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <AvatarDropdown />
            ) : (
              <div className="flex items-center gap-6">
                <Link to="/login" className="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Log in
                </Link>
                <Link to="/signup" className="text-sm font-medium bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-6 py-2.5 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors">
                  Sign up
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-500 rounded"
            aria-label="Open mobile menu"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="3" y1="8" x2="21" y2="8" />
              <line x1="3" y1="16" x2="21" y2="16" />
            </svg>
          </button>
        </div>
      </nav>
      <div className="h-20" aria-hidden="true" />

      {menuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-neutral-50 dark:bg-[#0a0a0a]">
          <div className="flex items-center justify-between px-6 h-20 border-b border-neutral-200 dark:border-neutral-800">
             <span className="font-serif text-2xl font-bold tracking-tighter text-neutral-900 dark:text-white">Poodiest.</span>
             <button 
               onClick={() => setMenuOpen(false)} 
               className="text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-500 rounded p-1"
               aria-label="Close mobile menu"
             >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
             </button>
          </div>
          
          <div className="flex-1 px-6 py-12 flex flex-col gap-8 text-2xl font-serif">
            <Link to="/" onClick={() => setMenuOpen(false)} className="text-neutral-900 dark:text-white hover:opacity-60">Home Feed</Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/create-post" onClick={() => setMenuOpen(false)} className="text-neutral-900 dark:text-white hover:opacity-60">Create Recipe</Link>
                <Link to="/account" onClick={() => setMenuOpen(false)} className="text-neutral-900 dark:text-white hover:opacity-60">My Profile</Link>
                <button onClick={handleLogout} className="text-left text-neutral-900 dark:text-white hover:opacity-60 mt-auto focus:outline-none">Log Out</button>
              </>
            ) : (
              <div className="mt-auto flex flex-col gap-4">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="text-lg font-sans font-medium text-neutral-900 dark:text-white">Log in</Link>
                <Link to="/signup" onClick={() => setMenuOpen(false)} className="text-lg font-sans font-medium bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-6 py-4 text-center">Sign up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}