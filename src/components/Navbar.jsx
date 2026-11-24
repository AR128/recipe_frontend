import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "../context/useAuth";
import { getRecipes, searchUsers } from "../api/recipeApi";
import { useToast } from "./Toast";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const showToast = useToast();

  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [recipeResults, setRecipeResults] = useState([]);
  const [bloggerResults, setBloggerResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchContainerRef = useRef(null);
  const mobileInputRef = useRef(null);

  const [isScrolled, setIsScrolled] = useState(
    () => typeof window !== "undefined" && window.scrollY > 20
  );

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

  // Close menus & dropdown on route change
  const [prevPathname, setPrevPathname] = useState(location.pathname);
  if (location.pathname !== prevPathname) {
    setPrevPathname(location.pathname);
    setMenuOpen(false);
    setDropdownOpen(false);
    setMobileSearchOpen(false);
  }

  // Close desktop dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle Escape key & body scroll lock
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setDropdownOpen(false);
        setMobileSearchOpen(false);
      }
    };

    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  // Live backend search for both Recipes and Bloggers (debounced + abortable)
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setRecipeResults([]);
      setBloggerResults([]);
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const [recipesRes, usersRes] = await Promise.allSettled([
          getRecipes({ search: trimmed, limit: 5, signal: controller.signal }),
          searchUsers({ query: trimmed, limit: 4, signal: controller.signal }),
        ]);

        if (controller.signal.aborted) return;

        if (recipesRes.status === "fulfilled") {
          const data = recipesRes.value;
          const list = Array.isArray(data)
            ? data
            : data?.recipes || data?.data || [];
          setRecipeResults(list);
        } else {
          setRecipeResults([]);
        }

        if (usersRes.status === "fulfilled") {
          const data = usersRes.value;
          const list = Array.isArray(data)
            ? data
            : data?.users || data?.data || [];
          setBloggerResults(list);
        } else {
          setBloggerResults([]);
        }
      } catch {
        // Ignore aborted or transient errors
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setDropdownOpen(true);
    }
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    showToast("Signed out successfully", "info");
    navigate("/");
  };

  const trimmedQuery = searchQuery.trim();
  const hasResults = recipeResults.length > 0 || bloggerResults.length > 0;

  return (
    <>
      <nav
        className={`site-navbar text-[#F5F0E8] font-sans transition-colors duration-200 ${
          isScrolled
            ? "is-scrolled bg-[#141412]/90 backdrop-blur-md border-b border-white/10"
            : ""
        }`}
      >
        <div
          className={`max-w-7xl mx-auto flex items-center justify-between gap-4 transition-[height,padding] duration-250 ease-out ${
            isScrolled
              ? "h-16 md:h-18 px-4 sm:px-5 lg:px-8"
              : "h-20 md:h-24 px-4 sm:px-6 lg:px-12"
          }`}
        >
          {/* Logo / Brand */}
          <Link
            to="/"
            className="flex items-center gap-3 group shrink-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E]"
          >
            <span className="w-9 h-9 rounded-full bg-linear-to-tr from-[#C9A96E] to-[#E7CA8D] text-[#141412] flex items-center justify-center font-serif font-black text-xl shadow-md shadow-[#C9A96E]/20 group-hover:scale-105 transition-transform duration-200">
              P
            </span>
            <div className="flex flex-col">
              <span className="font-serif text-2xl md:text-3xl font-bold tracking-tight leading-none text-[#F5F0E8] group-hover:text-[#C9A96E] transition-colors duration-150">
                Poodiest<span className="text-[#C9A96E]">.</span>
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-[#C9A96E]/80 font-medium font-sans">
                Culinary Journal
              </span>
            </div>
          </Link>

          {/* Center Navigation Links (How It Works & Bloggers only) */}
          <div className="hidden items-center gap-6 lg:gap-8 lg:flex font-sans shrink-0">
            <a
              href="/#how-it-works"
              className="whitespace-nowrap text-xs lg:text-sm font-semibold uppercase tracking-[0.16em] text-[#F5F0E8]/90 hover:text-[#C9A96E] transition-colors duration-150 rounded-md px-1.5 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E]"
            >
              How It Works
            </a>
            <a
              href="/#creators"
              className="whitespace-nowrap text-xs lg:text-sm font-semibold uppercase tracking-[0.16em] text-[#F5F0E8]/90 hover:text-[#C9A96E] transition-colors duration-150 rounded-md px-1.5 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E]"
            >
              Bloggers
            </a>
          </div>

          {/* Right Action Items + Live Search Dropdown */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4 font-sans">
            <div ref={searchContainerRef} className="relative">
              <form onSubmit={handleSearchSubmit} className="relative">
                <svg
                  className="w-4 h-4 text-[#F5F0E8]/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onFocus={() => setDropdownOpen(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (!dropdownOpen) setDropdownOpen(true);
                  }}
                  placeholder="Search recipes or bloggers..."
                  aria-label="Search recipes or bloggers"
                  className="w-56 lg:w-64 focus:w-68 lg:focus:w-80 pl-10 pr-8 py-2 rounded-full bg-[#1c1c18]/95 border border-white/15 text-xs lg:text-sm text-[#F5F0E8] placeholder-[#F5F0E8]/45 focus:outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/30 transition-all duration-200 ease-out"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setRecipeResults([]);
                      setBloggerResults([]);
                    }}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#F5F0E8]/50 hover:text-white p-0.5 transition-colors"
                  >
                    ✕
                  </button>
                )}
              </form>

              {/* Live Search Results Dropdown (Stays on current page) */}
              {dropdownOpen && trimmedQuery.length > 0 && (
                <div className="absolute right-0 mt-2.5 w-80 sm:w-96 rounded-2xl bg-[#1c1c18] border border-white/15 shadow-2xl shadow-black/80 overflow-hidden z-50">
                  {isSearching ? (
                    <div className="p-4 text-center text-xs text-[#F5F0E8]/60">
                      Searching recipes &amp; bloggers...
                    </div>
                  ) : !hasResults ? (
                    <div className="p-5 text-center">
                      <p className="text-sm font-medium text-[#F5F0E8]">
                        No matches for &ldquo;{searchQuery}&rdquo;
                      </p>
                      <p className="text-xs text-[#F5F0E8]/50 mt-1">
                        Try a dish name, category, or blogger name.
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto divide-y divide-white/10">
                      {/* Matching Bloggers Section */}
                      {bloggerResults.length > 0 && (
                        <div className="p-2.5">
                          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A96E]">
                            Food Bloggers
                          </div>
                          {bloggerResults.map((blogger) => {
                            const displayName =
                              blogger.name || blogger.username || "Chef";
                            return (
                              <Link
                                key={blogger._id || blogger.username || displayName}
                                to={
                                  blogger.username
                                    ? `/profile/${blogger.username}`
                                    : "/recipes"
                                }
                                onClick={() => setDropdownOpen(false)}
                                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors duration-150"
                              >
                                <div className="w-8 h-8 rounded-full bg-linear-to-tr from-[#C9A96E] to-[#E7CA8D] text-[#141412] font-bold text-xs flex items-center justify-center shrink-0">
                                  {displayName.slice(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm font-semibold text-[#F5F0E8] truncate">
                                    {displayName}
                                  </div>
                                  {blogger.username && (
                                    <div className="text-xs text-[#F5F0E8]/50 truncate">
                                      @{blogger.username}
                                    </div>
                                  )}
                                </div>
                                <span className="text-[11px] text-[#C9A96E] font-medium shrink-0">
                                  Profile →
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      )}

                      {/* Matching Recipes Section */}
                      {recipeResults.length > 0 && (
                        <div className="p-2.5">
                          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A96E]">
                            Recipes
                          </div>
                          {recipeResults.map((recipe) => {
                            const recipePath = `/recipe/${
                              recipe.slug || recipe._id || recipe.id
                            }`;
                            const authorName =
                              typeof recipe.author === "string"
                                ? recipe.author
                                : recipe.author?.name || recipe.authorName;
                            return (
                              <Link
                                key={recipe._id || recipe.id || recipe.slug}
                                to={recipePath}
                                onClick={() => setDropdownOpen(false)}
                                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors duration-150"
                              >
                                {recipe.image ? (
                                  <img
                                    src={recipe.image}
                                    alt={recipe.title}
                                    className="w-10 h-10 rounded-lg object-cover bg-white/5 shrink-0"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xs text-[#C9A96E] shrink-0">
                                    🍽
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm font-semibold text-[#F5F0E8] truncate">
                                    {recipe.title}
                                  </div>
                                  <div className="text-xs text-[#F5F0E8]/50 truncate">
                                    {recipe.category || "Recipe"}
                                    {authorName ? ` • by ${authorName}` : ""}
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/create-post"
                  className="whitespace-nowrap text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-full bg-linear-to-r from-[#C9A96E] to-[#DAB97E] text-[#141412] hover:brightness-105 shadow-sm shadow-[#C9A96E]/20 transition-all duration-150 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E]"
                >
                  + Share Recipe
                </Link>
                <Link
                  to="/account"
                  id="navbar-profile-btn"
                  className="flex max-w-44 items-center gap-2 p-1.5 rounded-full border border-white/15 hover:border-[#C9A96E]/60 bg-[#1c1c18]/80 hover:bg-[#1c1c18] transition-all duration-150 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E]"
                  title={`Signed in as ${user?.name || user?.username} • Go to Account Dashboard`}
                >
                  <div className="w-8 h-8 rounded-full bg-linear-to-tr from-[#C9A96E] to-[#E7CA8D] text-[#141412] font-sans font-bold text-xs flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-150 shrink-0">
                    {(user?.name || user?.username || "?")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <span className="hidden max-w-24 truncate pr-2 text-sm font-semibold text-white transition-colors duration-150 group-hover:text-[#C9A96E] xl:inline">
                    {user?.name || user?.username}
                  </span>
                </Link>
              </div>
            ) : (
              <Link
                to="/get-started"
                className="whitespace-nowrap text-xs lg:text-sm font-bold uppercase tracking-wider px-5 py-2.5 rounded-full bg-linear-to-r from-[#C9A96E] to-[#DAB97E] text-[#141412] hover:brightness-105 shadow-md shadow-[#C9A96E]/20 transition-all duration-150 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E]"
              >
                Get started
              </Link>
            )}
          </div>

          {/* Mobile Search Toggle + Menu Button */}
          <div className="flex items-center gap-1.5 md:hidden">
            <button
              type="button"
              onClick={() => {
                setMobileSearchOpen((prev) => !prev);
                setTimeout(() => mobileInputRef.current?.focus(), 50);
              }}
              aria-label="Toggle search bar"
              aria-expanded={mobileSearchOpen}
              className="text-[#F5F0E8] p-2 rounded-lg hover:bg-white/5 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E]"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
            <button
              onClick={() => setMenuOpen(true)}
              className="text-[#F5F0E8] p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E] rounded-lg hover:bg-white/5 transition-colors duration-150"
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

        {/* Inline Mobile Search Bar & Live Results */}
        {mobileSearchOpen && (
          <div className="md:hidden px-4 pb-4 bg-[#141412]/95 border-b border-white/10">
            <form onSubmit={handleSearchSubmit} className="relative">
              <svg
                className="w-4 h-4 text-[#F5F0E8]/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={mobileInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recipes or bloggers..."
                aria-label="Search recipes or bloggers"
                className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-[#1c1c18] border border-white/15 text-sm text-[#F5F0E8] placeholder-[#F5F0E8]/45 focus:outline-none focus:border-[#C9A96E]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setRecipeResults([]);
                    setBloggerResults([]);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#F5F0E8]/50"
                >
                  ✕
                </button>
              )}
            </form>

            {trimmedQuery.length > 0 && (
              <div className="mt-2 rounded-xl bg-[#1c1c18] border border-white/10 max-h-72 overflow-y-auto divide-y divide-white/10">
                {isSearching ? (
                  <div className="p-3 text-center text-xs text-[#F5F0E8]/60">
                    Searching...
                  </div>
                ) : !hasResults ? (
                  <div className="p-3 text-center text-xs text-[#F5F0E8]/60">
                    No recipes or bloggers found for &ldquo;{searchQuery}&rdquo;
                  </div>
                ) : (
                  <>
                    {bloggerResults.map((blogger) => {
                      const displayName =
                        blogger.name || blogger.username || "Chef";
                      return (
                        <Link
                          key={blogger._id || blogger.username || displayName}
                          to={
                            blogger.username
                              ? `/profile/${blogger.username}`
                              : "/recipes"
                          }
                          onClick={() => setMobileSearchOpen(false)}
                          className="flex items-center justify-between p-3 hover:bg-white/5"
                        >
                          <span className="text-sm font-medium text-[#F5F0E8]">
                            {displayName}
                          </span>
                          <span className="text-xs text-[#C9A96E]">Blogger →</span>
                        </Link>
                      );
                    })}
                    {recipeResults.map((recipe) => (
                      <Link
                        key={recipe._id || recipe.id || recipe.slug}
                        to={`/recipe/${recipe.slug || recipe._id || recipe.id}`}
                        onClick={() => setMobileSearchOpen(false)}
                        className="flex items-center justify-between p-3 hover:bg-white/5"
                      >
                        <span className="text-sm font-medium text-[#F5F0E8] truncate pr-2">
                          {recipe.title}
                        </span>
                        <span className="text-xs text-[#F5F0E8]/50 shrink-0">
                          Recipe →
                        </span>
                      </Link>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        )}
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
          className="fixed inset-0 z-50 flex flex-col bg-[#141412]/98 backdrop-blur-xl text-[#F5F0E8] font-sans overflow-y-auto"
        >
          <div className="flex items-center justify-between px-6 h-20 border-b border-white/10 shrink-0">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E]"
            >
              <span className="w-8 h-8 rounded-full bg-linear-to-tr from-[#C9A96E] to-[#E7CA8D] text-[#141412] flex items-center justify-center font-serif font-black text-lg">
                P
              </span>
              <span className="font-serif text-2xl font-bold tracking-tight text-[#F5F0E8]">
                Poodiest<span className="text-[#C9A96E]">.</span>
              </span>
            </Link>
            <button
              onClick={() => setMenuOpen(false)}
              className="text-[#F5F0E8] p-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E] rounded-full hover:bg-white/10 transition-colors"
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

          <div className="flex min-h-0 flex-1 flex-col px-6 py-6">
            {/* 1. Primary Action Group */}
            <div className="mb-6">
              {isAuthenticated ? (
                <Link
                  to="/create-post"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-linear-to-r from-[#C9A96E] to-[#DAB97E] text-[#141412] font-sans font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#C9A96E]/20 hover:brightness-105 transition-all"
                >
                  <span className="text-base leading-none">+</span> Share a Recipe
                </Link>
              ) : (
                <Link
                  to="/get-started"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full py-3.5 text-center rounded-xl bg-linear-to-r from-[#C9A96E] to-[#DAB97E] text-[#141412] font-sans font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#C9A96E]/20 hover:brightness-105 transition-all"
                >
                  Get Started
                </Link>
              )}
            </div>

            {/* 2. Discover Group */}
            <div className="flex flex-col gap-1.5 py-2">
              <span className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#F5F0E8]/45">
                Discover
              </span>
              <a
                href="/#trending"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between px-3 py-3 rounded-xl text-base font-medium text-[#F5F0E8] hover:bg-[#1c1c18] hover:text-[#C9A96E] transition-colors duration-150"
              >
                <span>Trending Now</span>
                <span className="text-sm text-white/30">→</span>
              </a>
              <a
                href="/#how-it-works"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between px-3 py-3 rounded-xl text-base font-medium text-[#F5F0E8] hover:bg-[#1c1c18] hover:text-[#C9A96E] transition-colors duration-150"
              >
                <span>How It Works</span>
                <span className="text-sm text-white/30">→</span>
              </a>
              <a
                href="/#creators"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between px-3 py-3 rounded-xl text-base font-medium text-[#F5F0E8] hover:bg-[#1c1c18] hover:text-[#C9A96E] transition-colors duration-150"
              >
                <span>Food Bloggers</span>
                <span className="text-sm text-white/30">→</span>
              </a>
            </div>

            {/* 3. Account Group */}
            {isAuthenticated && (
              <div className="mt-auto pt-5 border-t border-white/10 flex flex-col gap-2.5 shrink-0">
                <span className="px-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#F5F0E8]/45">
                  Account
                </span>
                <Link
                  to="/account"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#1c1c18] border border-white/10 hover:border-[#C9A96E]/50 transition-colors duration-150"
                >
                  <div className="w-10 h-10 rounded-full bg-linear-to-tr from-[#C9A96E] to-[#E7CA8D] text-[#141412] font-sans font-bold text-xs flex items-center justify-center shadow-sm shrink-0">
                    {(user?.name || user?.username || "?")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">
                      {user?.name || user?.username}
                    </div>
                    <div className="text-xs text-[#C9A96E] truncate">
                      My Profile &amp; Cookbook →
                    </div>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 text-xs uppercase tracking-wider font-bold hover:text-red-300 transition-colors duration-150"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}