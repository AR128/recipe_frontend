import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../context/useAuth';
import AvatarDropdown from './AvatarDropdown';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(
    () => typeof window !== 'undefined' && window.scrollY > 20,
  );

  useEffect(() => {
    const handleScroll = () => {
      const nextIsScrolled = window.scrollY > 20;
      setIsScrolled((current) => (
        current === nextIsScrolled ? current : nextIsScrolled
      ));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      <nav
        className={`site-navbar text-[#F5F0E8] ${isScrolled ? 'is-scrolled' : ''}`}
      >
        <div className={`max-w-7xl mx-auto flex items-center justify-between transition-[height,padding] duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isScrolled ? 'h-20 px-5 lg:px-6' : 'h-24 px-6 lg:px-12'
        }`}>
          <Link to="/" className="flex items-center">
            <span className="font-serif text-3xl font-bold tracking-tighter leading-none text-[#F5F0E8] hover:opacity-70 transition-opacity">
              Poodiest.
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            <Link
              to="/"
              className="text-xs font-semibold uppercase tracking-[0.15em] text-[#F5F0E8] hover:text-[#C9A96E] transition-colors"
            >
              Feed
            </Link>
            <Link
              to="#category"
              className="text-xs font-semibold uppercase tracking-[0.15em] text-[#F5F0E8] hover:text-[#C9A96E] transition-colors"
            >
              Categories
            </Link>
            <Link
              to="#about"
              className="text-xs font-semibold uppercase tracking-[0.15em] text-[#F5F0E8] hover:text-[#C9A96E] transition-colors"
            >
              About
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <AvatarDropdown />
            ) : (
              <div className="flex items-center gap-6">
                <Link
                  to="/login"
                  className="text-sm font-medium text-[#F5F0E8] hover:text-[#C9A96E] transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-medium px-6 py-2.5 rounded-full bg-[#C9A96E] text-[#0A0A0A] hover:bg-[#DAB97E] transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden text-[#F5F0E8] focus:outline-none focus:ring-2 focus:ring-[#C9A96E] rounded"
            aria-label="Open mobile menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <line x1="3" y1="8" x2="21" y2="8" />
              <line x1="3" y1="16" x2="21" y2="16" />
            </svg>
          </button>
        </div>
      </nav>
      {location.pathname !== '/' && (
        <div className="h-24" aria-hidden="true" />
      )}

      {menuOpen && (
        <div
          id="mobile-navigation"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          className="fixed inset-0 z-50 flex flex-col bg-[#141512] text-[#F5F0E8]"
        >
          <div className="flex items-center justify-between px-6 h-20 border-b border-white/10">
            <span className="font-serif text-2xl font-bold tracking-tighter text-[#F5F0E8]">
              Poodiest.
            </span>
            <button
              onClick={() => setMenuOpen(false)}
              className="text-[#F5F0E8] focus:outline-none focus:ring-2 focus:ring-[#C9A96E] rounded p-1"
              aria-label="Close mobile menu"
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="flex-1 px-6 py-12 flex flex-col gap-8 text-2xl font-serif">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="text-[#F5F0E8] hover:text-[#C9A96E]"
            >
              Home Feed
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/create-post"
                  onClick={() => setMenuOpen(false)}
                  className="text-[#F5F0E8] hover:text-[#C9A96E]"
                >
                  Create Recipe
                </Link>
                <Link
                  to="/account"
                  onClick={() => setMenuOpen(false)}
                  className="text-[#F5F0E8] hover:text-[#C9A96E]"
                >
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-left text-[#F5F0E8] hover:text-[#C9A96E] mt-auto focus:outline-none"
                >
                  Log Out
                </button>
              </>
            ) : (
              <div className="mt-auto flex flex-col gap-4">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="text-lg font-sans font-medium text-[#F5F0E8] hover:text-[#C9A96E]"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="text-lg font-sans font-medium bg-[#C9A96E] text-[#0A0A0A] hover:bg-[#DAB97E] px-6 py-4 text-center rounded-full transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}