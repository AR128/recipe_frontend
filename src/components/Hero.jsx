import { Link } from "react-router";
import heroBg from "../assets/hero-bg.jpg";

export default function Hero() {
  return (
    <section className="relative w-full min-h-[100svh] flex flex-col justify-center pt-28 sm:pt-32 md:pt-36 lg:pt-40 pb-12 sm:pb-16 md:pb-20 overflow-hidden">
      {/* BACKGROUND IMAGE & ATMOSPHERIC OVERLAYS */}
      <div className="absolute inset-0 z-0 bg-[#0d0d0c]">
        <img
          src={heroBg}
          alt="Community food bloggers kitchen table"
          className="w-full h-full object-cover opacity-60 scale-102 hover:scale-105 transition-transform duration-1000 ease-out"
        />
        {/* Deep cinematic gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-black/10" />
        <div className="absolute inset-0 bg-radial from-transparent via-black/10 to-black/40" />
        {/* Seamless bottom transition */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-neutral-50 dark:from-[#0a0a0a] to-transparent transition-colors duration-200" />
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
        <p className="text-sm sm:text-lg md:text-xl text-neutral-200 font-light max-w-2xl leading-relaxed mb-8 sm:mb-10 drop-shadow-sm">
          Explore home-cooked recipes from food lovers everywhere. Share your
          creations and save the dishes you love.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-8 sm:mb-12 w-full sm:w-auto">
          <Link
            to="/create-post"
            className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-[#C9A96E] to-[#DAB97E] text-[#121210] font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 shadow-xl shadow-[#C9A96E]/20 transition-all text-center"
          >
            <span className="text-base leading-none">+</span>
            <span>Share Your Recipe</span>
          </Link>

          <a
            href="#trending-recipe"
            className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3.5 sm:py-4 rounded-full bg-white/15 hover:bg-white/20 border border-white/25 text-white font-bold text-xs uppercase tracking-wider backdrop-blur-md hover:border-[#C9A96E] transition-all shadow-lg shadow-black/20 text-center"
          >
            <span>Top Trending Dish</span>
            <span>↓</span>
          </a>
        </div>

        {/* Feature Highlights Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-6 sm:pt-8 border-t border-white/10 w-full max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-[#C9A96E]/20 text-[#E7CA8D] flex items-center justify-center text-sm font-bold border border-[#C9A96E]/30">
              1
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white">
                Share Dishes
              </p>
              <p className="text-xs text-neutral-400 font-light">
                Post your unique recipes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-[#C9A96E]/20 text-[#E7CA8D] flex items-center justify-center text-sm font-bold border border-[#C9A96E]/30">
              2
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white">
                Save &amp; Bookmark
              </p>
              <p className="text-xs text-neutral-400 font-light">
                Sync favorites to profile
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-[#C9A96E]/20 text-[#E7CA8D] flex items-center justify-center text-sm font-bold border border-[#C9A96E]/30">
              3
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white">
                Connect &amp; Discuss
              </p>
              <p className="text-xs text-neutral-400 font-light">
                Learn from home cooks
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
