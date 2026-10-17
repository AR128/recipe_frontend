import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "../context/useAuth";
import { useTheme } from "../context/useTheme";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(
    () => typeof window !== "undefined" && window.scrollY > 20
  );

  const toggleTheme = () => {
    const isCurrentlyDark = document.documentElement.classList.contains("dark");
    setTheme(isCurrentlyDark ? "light" : "dark");
  };

  useEffect(() => {
    const handleScroll = () => {
      const nextIsScrolled = window.scrollY > 20;
      setIsScrolled((current) =>
        current === nextIsScrolled ? current : nextIsScrolled
      );
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on route change
  const [prevPathname, setPrevPathname] = useState(location.pathname);
  if (location.pathname !== prevPathname) {
    setPrevPathname(location.pathname);
    setMenuOpen(false);
  }

  // Safely handle body scroll locking and Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };

    if (menuOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate("/");
  };

  return (
    <>
      <nav
        className={`site-navbar text-[#F5F0E8] ${isScrolled ? "is-scrolled" : ""}`}
      >
        <div
          className={`max-w-7xl mx-auto flex items-center justify-between transition-[height,padding] duration-[500ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isScrolled
              ? "h-16 md:h-18 px-4 sm:px-5 lg:px-8"
              : "h-20 md:h-24 px-4 sm:px-6 lg:px-12"
          }`}
        >
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <span className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#C9A96E] to-[#E7CA8D] text-[#121210] flex items-center justify-center font-serif font-black text-xl shadow-md shadow-[#C9A96E]/20 group-hover:scale-105 transition-transform duration-300">
              P
            </span>
            <div className="flex flex-col">
              <span className="font-serif text-2xl md:text-3xl font-bold tracking-tight leading-none text-[#F5F0E8] group-hover:text-[#C9A96E] transition-colors">
                Poodiest<span className="text-[#C9A96E]">.</span>
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-[#C9A96E]/80 font-medium font-sans">
                Culinary Journal
              </span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/recipes"
              className="text-xs font-semibold uppercase tracking-[0.18em] text-[#F5F0E8]/90 hover:text-[#C9A96E] transition-colors"
            >
              All Recipes
            </Link>
            <a
              href="/#how-it-works"
              className="text-xs font-semibold uppercase tracking-[0.18em] text-[#F5F0E8]/90 hover:text-[#C9A96E] transition-colors"
            >
              How It Works
            </a>
            <a
              href="/#creators"
              className="text-xs font-semibold uppercase tracking-[0.18em] text-[#F5F0E8]/90 hover:text-[#C9A96E] transition-colors"
            >
              Bloggers
            </a>
          </div>

          {/* Right Action Items */}
          <div className="hidden md:flex items-center gap-5">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/create-post"
                  className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-full border border-[#C9A96E]/40 text-[#E7CA8D] hover:bg-[#C9A96E]/10 transition-colors"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Share Recipe
                </Link>
                <Link
                  to="/account"
                  id="navbar-profile-btn"
                  className="flex items-center gap-2.5 p-1 rounded-full border border-white/15 hover:border-[#C9A96E]/60 bg-white/5 hover:bg-white/10 transition-all group"
                  title={`Signed in as ${user?.name || user?.username} • Go to Account Dashboard`}
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#C9A96E] to-[#E7CA8D] text-[#121210] font-serif font-black text-xs flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                    {(user?.name || user?.username || "?")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <span className="hidden lg:inline text-xs font-semibold text-white group-hover:text-[#C9A96E] pr-2 transition-colors">
                    {user?.name || user?.username}
                  </span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-5">
                <Link
                  to="/login"
                  className="text-xs font-semibold uppercase tracking-wider text-[#F5F0E8] hover:text-[#C9A96E] transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="text-xs font-semibold uppercase tracking-wider px-5 py-2.5 rounded-full bg-gradient-to-r from-[#C9A96E] to-[#DAB97E] text-[#0A0A0A] hover:brightness-105 shadow-md shadow-[#C9A96E]/20 transition-all"
                >
                  Join Club
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setMenuOpen(true)}
              className="text-[#F5F0E8] p-2 focus:outline-none focus:ring-2 focus:ring-[#C9A96E] rounded-lg"
              aria-label="Open mobile menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
            >
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="3" y1="7" x2="21" y2="7" />
                <line x1="3" y1="17" x2="21" y2="17" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {location.pathname !== "/" && (
        <div className="h-20 md:h-24" aria-hidden="true" />
      )}

      {/* Mobile Drawer */}
      {menuOpen && (
        <div
          id="mobile-navigation"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          className="fixed inset-0 z-50 flex flex-col bg-[#141512]/98 backdrop-blur-xl text-[#F5F0E8] animate-fade-in overflow-y-auto"
        >
          <div className="flex items-center justify-between px-6 h-20 border-b border-white/10 shrink-0">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5"
            >
              <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#C9A96E] to-[#E7CA8D] text-[#121210] flex items-center justify-center font-serif font-black text-lg">
                P
              </span>
              <span className="font-serif text-2xl font-bold tracking-tight text-[#F5F0E8]">
                Poodiest<span className="text-[#C9A96E]">.</span>
              </span>
            </Link>
            <button
              onClick={() => setMenuOpen(false)}
              className="text-[#F5F0E8] p-2.5 focus:outline-none focus:ring-2 focus:ring-[#C9A96E] rounded-full hover:bg-white/10 transition-colors"
              aria-label="Close mobile menu"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="flex-1 px-6 py-6 flex flex-col justify-between">
            {/* Authenticated user quick pill in drawer */}
            {isAuthenticated && (
              <Link
                to="/account"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-[#C9A96E]/50 transition-colors mb-6"
              >
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#C9A96E] to-[#E7CA8D] text-[#121210] font-serif font-black text-sm flex items-center justify-center shadow-md shrink-0">
                  {(user?.name || user?.username || "?")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-sans text-sm font-bold text-white truncate">
                    {user?.name || user?.username}
                  </div>
                  <div className="font-sans text-xs text-[#C9A96E] truncate">
                    @{user?.username} • Account Hub →
                  </div>
                </div>
              </Link>
            )}

            {/* Navigation links */}
            <div className="flex flex-col gap-5 text-xl font-serif">
              <Link
                to="/recipes"
                onClick={() => setMenuOpen(false)}
                className="text-[#F5F0E8] hover:text-[#C9A96E] transition-colors flex items-center justify-between py-1"
              >
                <span>All Recipes Collection</span>
                <span className="text-sm font-sans text-white/30">→</span>
              </Link>
              <a
                href="/#categories"
                onClick={() => setMenuOpen(false)}
                className="text-[#F5F0E8] hover:text-[#C9A96E] transition-colors flex items-center justify-between py-1"
              >
                <span>Browse Categories</span>
                <span className="text-sm font-sans text-white/30">→</span>
              </a>
              <a
                href="/#how-it-works"
                onClick={() => setMenuOpen(false)}
                className="text-[#F5F0E8] hover:text-[#C9A96E] transition-colors flex items-center justify-between py-1"
              >
                <span>How It Works</span>
                <span className="text-sm font-sans text-white/30">→</span>
              </a>
              <a
                href="/#creators"
                onClick={() => setMenuOpen(false)}
                className="text-[#F5F0E8] hover:text-[#C9A96E] transition-colors flex items-center justify-between py-1"
              >
                <span>Food Bloggers</span>
                <span className="text-sm font-sans text-white/30">→</span>
              </a>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-white/10 mt-8 flex flex-col gap-3 font-sans text-sm">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/create-post"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#DAB97E] text-[#0A0A0A] font-bold text-xs uppercase tracking-wider shadow-md"
                  >
                    <span>+</span> Share a Recipe
                  </Link>
                  <Link
                    to="/account"
                    onClick={() => setMenuOpen(false)}
                    className="py-3 text-center rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors"
                  >
                    My Profile &amp; Cookbook
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-red-400 py-2.5 text-center text-xs uppercase tracking-wider font-bold hover:text-red-300 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="py-3.5 text-center rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMenuOpen(false)}
                    className="py-3.5 text-center rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#DAB97E] text-[#0A0A0A] font-bold text-xs uppercase tracking-wider shadow-md"
                  >
                    Join the Club
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
