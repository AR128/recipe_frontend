import React from 'react';
import heroImage from '../assets/Picture1.png';

export default function Hero({ 
  search, 
  setSearch, 
  searchRef, 
  searchTab, 
  setSearchTab, 
  matchedUsers 
}) {
  return (
  <div className="w-full bg-[#FDFBF7]">
   <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 flex flex-col-reverse md:flex-row items-center justify-between gap-8">
      
      {/* Left Side: Text and Search */}
      <div className="md:w-1/2 flex flex-col gap-6">
        <h1 className="text-4xl md:text-5xl font-serif font-extrabold text-gray-900 leading-tight">
          Every dish, mastered from the source.
        </h1>
        
        <p className="text-lg text-gray-600 max-w-2xl mt-4">
          Poodiest is a curated recipe platform built for cooks who demand precision, context, and technique — not just ingredient lists.
        </p>

        {/* Search Bar */}
        <div className="relative max-w-md mt-2">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <input
            ref={searchRef}
            type="text"
            placeholder="Search recipes, tags, or chefs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-10 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-900"
          />
          {search && (
            <button
              onClick={() => { setSearch(''); searchRef.current?.focus(); }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>

        {/* Search Type Tabs */}
        <div className="flex flex-wrap gap-3 mt-2">
          <button
            type="button"
            onClick={() => setSearchTab('recipes')}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
              searchTab === 'recipes' 
                ? 'bg-orange-500 text-white border-transparent shadow-md' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            🍲 Recipes
          </button>
          <button
            type="button"
            onClick={() => setSearchTab('users')}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
              searchTab === 'users' 
                ? 'bg-orange-500 text-white border-transparent shadow-md' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            👨‍🍳 Foodies {matchedUsers?.length > 0 && `(${matchedUsers.length})`}
          </button>
        </div>
      </div>

      {/* Right Side: Image */}
      <div className="md:w-1/2 flex justify-center md:justify-end">
        <div className="relative w-full max-w-sm">
          {/* Soft background blob for the image */}
          <div className="absolute inset-0 bg-orange-100 rounded-[3rem] rotate-6 transform scale-105 -z-10"></div>
          <img 
            src={heroImage} 
            alt="Delicious food" 
            className="w-full h-auto object-cover rounded-[2.5rem] shadow-lg transform hover:scale-105 transition-transform duration-500"
          />
        </div>
      </div>
    </div>
   </div>
  );
}