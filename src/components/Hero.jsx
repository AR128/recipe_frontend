import { useState } from "react";
import { Link, useNavigate } from "react-router";
import heroBg from "../assets/hero-bg.jpg";

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      navigate(`/recipes?search=${encodeURIComponent(trimmed)}`);
    } else {
      navigate("/recipes");
    }
  };

  return (
    <section className="relative w-full min-h-svh flex flex-col justify-center pt-28 sm:pt-32 md:pt-36 lg:pt-40 pb-16 sm:pb-24 overflow-hidden font-sans">
      {/* BACKGROUND IMAGE & ATMOSPHERIC OVERLAYS */}
      <div className="absolute inset-0 z-0 bg-[#141412]">
        <img
          src={heroBg}
          alt="Warm rustic kitchen table spread with freshly cooked dishes and herbs"
          className="w-full h-full object-cover opacity-55 scale-102 hover:scale-105 transition-transform duration-1000 ease-out"
        />
        {/* Strengthened cinematic gradients for WCAG text contrast */}
        <div className="absolute inset-0 bg-linear-to-r from-[#141412]/90 via-[#141412]/60 to-[#141412]/25" />
        <div className="absolute inset-0 bg-radial from-transparent via-black/20 to-[#141412]/70" />
        {/* Low-profile bottom transition so it never overlaps feature text */}
        <div className="pointer-events-none absolute bottom-0 left-0 w-full h-10 bg-linear-to-t from-neutral-50 dark:from-[#141412] to-transparent transition-colors duration-200" />
      </div>

      {/* FOREGROUND COMMUNITY BLOGGING CONTENT */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex flex-col items-start">
        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-[5.2rem] font-serif font-medium text-white leading-[1.12] sm:leading-[1.08] tracking-tight mb-4 sm:mb-6 max-w-4xl drop-shadow-md">
          Find your next favorite. <br />
          <span className="italic text-[#E7CA8D] font-normal underline decoration-[#C9A96E]/40 decoration-wavy underline-offset-8">
            Made to be shared.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-lg md:text-xl text-neutral-100 font-normal max-w-2xl leading-relaxed mb-7 sm:mb-8 drop-shadow-sm">
          Explore home-cooked recipes from food lovers everywhere. Share your
          creations and save the dishes you love.
        </p>

        {/* Prominent Hero Search Bar */}
        <form
          onSubmit={handleHeroSearch}
          className="w-full max-w-xl mb-6 sm:mb-7"
          role="search"
        >
          <div className="relative flex items-center bg-[#1c1c18]/90 backdrop-blur-md border border-white/20 rounded-full p-1.5 shadow-2xl shadow-black/40 focus-within:border-[#C9A96E] focus-within:ring-2 focus-within:ring-[#C9A96E]/35 transition-all">
            <svg
              className="w-5 h-5 text-[#E7CA8D] ml-3.5 shrink-0 pointer-events-none"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recipes, ingredients, or chefs..."
              aria-label="Search recipes, ingredients, or chefs"
              className="w-full bg-transparent px-3.5 py-2.5 text-sm sm:text-base text-white placeholder-neutral-400 focus:outline-none font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search query"
                className="text-neutral-400 hover:text-white px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E] rounded-full"
              >
                ✕
              </button>
            )}
            <button
              type="submit"
              className="shrink-0 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-linear-to-r from-[#C9A96E] to-[#DAB97E] text-[#141412] font-sans font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E]"
            >
              Search
            </button>
          </div>
        </form>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-8 sm:mb-12 w-full sm:w-auto">
          <Link
            to="/create-post"
            className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3.5 sm:py-4 rounded-full bg-[#1c1c18]/90 hover:bg-[#1c1c18] border border-[#C9A96E]/50 hover:border-[#C9A96E] text-[#E7CA8D] font-sans font-bold text-xs uppercase tracking-wider active:scale-95 shadow-xl shadow-black/30 transition-all text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E]"
          >
            <span className="text-base leading-none">+</span>
            <span>Share Your Recipe</span>
          </Link>

          <a
            href="#trending-recipe"
            className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3.5 sm:py-4 rounded-full bg-white/12 hover:bg-white/20 border border-white/25 text-white font-sans font-bold text-xs uppercase tracking-wider backdrop-blur-md hover:border-[#C9A96E] transition-all shadow-lg shadow-black/20 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E]"
          >
            <span>Top Trending Dish</span>
            <span>↓</span>
          </a>
        </div>

        {/* Feature Highlights Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-6 sm:pt-8 border-t border-white/15 w-full max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-[#C9A96E]/20 text-[#E7CA8D] flex items-center justify-center text-sm font-bold border border-[#C9A96E]/35 shrink-0">
              1
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white">
                Share Dishes
              </p>
              <p className="text-xs text-neutral-300 font-normal">
                Post your unique recipes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-[#C9A96E]/20 text-[#E7CA8D] flex items-center justify-center text-sm font-bold border border-[#C9A96E]/35 shrink-0">
              2
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white">
                Save &amp; Bookmark
              </p>
              <p className="text-xs text-neutral-300 font-normal">
                Sync favorites to profile
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-[#C9A96E]/20 text-[#E7CA8D] flex items-center justify-center text-sm font-bold border border-[#C9A96E]/35 shrink-0">
              3
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white">
                Connect &amp; Discuss
              </p>
              <p className="text-xs text-neutral-300 font-normal">
                Learn from home cooks
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}