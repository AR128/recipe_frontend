import React from 'react';
import heroBg from '../assets/hero-bg.jpg';

export default function Hero({ 
  search, 
  setSearch, 
  searchRef, 
  searchTab, 
  setSearchTab 
}) {
  return (
    <section className="relative w-full min-h-[80vh] flex flex-col justify-end pb-24 md:pb-32 overflow-hidden">
      
      {/* FULL BACKGROUND IMAGE WITH OVERLAY */}
      <div className="absolute inset-0 z-0 bg-[#1A1A1A]">
        <img 
            src={heroBg} 
            alt="Culinary presentation" 
            className="w-full h-full object-cover opacity-60 mix-blend-overlay hover:scale-105 transition-transform duration-1000 ease-out grayscale-20"
        />
        {/* Gradient overlay for perfect text contrast */}
        <div className="absolute inset-0 bg-linear-to-t from-[#1A1A1A] via-[#1A1A1A]/40 to-transparent"></div>
      </div>

      {/* FOREGROUND CONTENT */}
      <div className="relative z-10 w-full max-w-350 mx-auto px-6 lg:px-12 flex flex-col items-start mt-32">
        
        <h1 className="text-5xl sm:text-7xl lg:text-[6rem] font-serif font-medium text-white leading-none tracking-tighter mb-8 max-w-4xl">
          The art of <br/>
          <span className="text-[#A3A3A3] italic font-light">good food.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-[#CCCCCC] font-light max-w-xl leading-relaxed mb-16">
          A curated space for those who respect technique. Find precise measurements, honest notes, and recipes that actually work.
        </p>

        {/* INLINE ARCHITECTURAL SEARCH */}
        <div className="w-full max-w-2xl bg-white/5 backdrop-blur-sm p-8 border border-white/10">
          <div className="flex items-center gap-6 mb-6">
            <button 
              onClick={() => setSearchTab('recipes')}
              className={`text-xs font-semibold uppercase tracking-widest transition-colors ${searchTab === 'recipes' ? 'text-white' : 'text-[#8C8C8C] hover:text-[#CCCCCC]'}`}
            >
              Recipes
            </button>
            <button 
              onClick={() => setSearchTab('users')}
              className={`text-xs font-semibold uppercase tracking-widest transition-colors ${searchTab === 'users' ? 'text-white' : 'text-[#8C8C8C] hover:text-[#CCCCCC]'}`}
            >
              Chefs
            </button>
          </div>

          <div className="flex items-end border-b border-white/30 focus-within:border-white transition-colors pb-3">
            <input
              ref={searchRef}
              type="text"
              aria-label="Search"
              placeholder={searchTab === 'recipes' ? "What are you cooking today?" : "Find a creator..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-2xl font-serif text-white placeholder:text-white/40"
            />
            <button className="shrink-0 text-white hover:opacity-60 transition-opacity ml-4 pb-1">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
