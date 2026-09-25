import { useState, useEffect, useCallback, useRef } from 'react';
import RecipeCard from '../components/RecipeCard';
import FoodieCard from '../components/FoodieCard';
import { getRecipes, getCategories, searchUsers } from '../api/recipeApi';
import useWindowWidth from '../hooks/useWindowWidth';
import Hero from '../components/Hero';
import FeaturedRecipe from '../components/FeaturedRecipe';

function useDebounce(value, delay) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

function RecipeCardSkeleton() {
    return (
        <div
            style={{
                background: 'var(--color-surface)',
                borderRadius: 18,
                border: '1px solid var(--color-border)',
                overflow: 'hidden',
            }}
        >
            <div className="skeleton" style={{ height: 210 }} />
            <div style={{ padding: '20px 20px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="skeleton" style={{ height: 22, width: '75%' }} />
                <div className="skeleton" style={{ height: 14, width: '100%' }} />
                <div className="skeleton" style={{ height: 14, width: '60%' }} />
                <div style={{ marginTop: 8, paddingTop: 12, borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between' }}>
                    <div className="skeleton" style={{ height: 12, width: 80 }} />
                    <div className="skeleton" style={{ height: 12, width: 60 }} />
                </div>
            </div>
        </div>
    );
}

function RecipeFeed() {
    const { isMobile } = useWindowWidth();
    const [recipes, setRecipes] = useState([]);
    const [categories, setCategories] = useState(['All']);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [search, setSearch] = useState('');
    const [searchTab, setSearchTab] = useState('recipes'); // 'recipes' | 'users'
    const [matchedUsers, setMatchedUsers] = useState([]);
    const [featuredChefs, setFeaturedChefs] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [total, setTotal] = useState(0);
    const [sortBy, setSortBy] = useState('Newest');
    const [showSortMenu, setShowSortMenu] = useState(false);
    const searchRef = useRef(null);

    const debouncedSearch = useDebounce(search, 400);

    // Load categories on mount
    useEffect(() => {
        getCategories()
            .then((data) => {
                const cats = (data.categories || []).filter(Boolean);
                setCategories(['All', 'Quick & Easy', 'Vegan', 'Techniques', ...cats]);
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        searchUsers('')
            .then((data) => {
                setFeaturedChefs((data.users || []).slice(0, 4));
            })
            .catch(() => setFeaturedChefs([]));
    }, []);

    const [prevFilters, setPrevFilters] = useState({ search: null, category: null });

    // Sync loading/error state during render to avoid cascading useEffect renders
    if (debouncedSearch !== prevFilters.search || selectedCategory !== prevFilters.category) {
        setPrevFilters({ search: debouncedSearch, category: selectedCategory });
        setLoading(true);
        setError('');
        
        if (debouncedSearch.trim().length > 0) {
            setUsersLoading(true);
        } else {
            setMatchedUsers([]);
            setUsersLoading(false);
        }
    }

    // Fetch recipes whenever filters change
    const fetchRecipes = useCallback(() => {
        getRecipes({ search: debouncedSearch, category: selectedCategory })
            .then((data) => {
                setRecipes(data.recipes || []);
                setTotal(data.total || 0);
            })
            .catch(() => setError('Failed to load recipes. Please try again.'))
            .finally(() => setLoading(false));
    }, [debouncedSearch, selectedCategory]);

    useEffect(() => {
        fetchRecipes();
    }, [fetchRecipes]);

    // Fetch user search results
    useEffect(() => {
        if (debouncedSearch.trim().length > 0) {
            searchUsers(debouncedSearch.trim())
                .then((data) => setMatchedUsers(data.users || []))
                .catch(() => setMatchedUsers([]))
                .finally(() => setUsersLoading(false));
        }
    }, [debouncedSearch]);

    const hasSearch = search.trim().length > 0;

    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'var(--color-bg)',
            }}
        >
        
           {/* Hero */}
      <Hero 
        search={search}
        setSearch={setSearch}
        searchRef={searchRef}
        searchTab={searchTab}
        setSearchTab={setSearchTab}
        matchedUsers={matchedUsers}
      />
    

            {/* Feed body */}
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '24px 14px 48px' : '36px 20px 60px' }}>
                {/* USER SEARCH TAB CONTENT */}
                {searchTab === 'users' ? (
                    <div>
                        <div style={{ marginBottom: 24 }}>
                            <h2 style={{ fontSize: isMobile ? 18 : 20, fontWeight: 700, margin: '0 0 4px', color: 'var(--color-text-primary)' }}>
                                {hasSearch ? `Results for "${search}"` : 'Discover Foodies & Chefs'}
                            </h2>
                            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
                                Connect with culinary creators and explore their published recipe collections.
                            </p>
                        </div>

                        {usersLoading ? (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-muted)' }}>
                                Searching foodies...
                            </div>
                        ) : matchedUsers.length === 0 ? (
                            <div
                                style={{
                                    textAlign: 'center',
                                    padding: '48px 20px',
                                    background: 'var(--color-surface)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 16,
                                }}
                            >
                                <span style={{ fontSize: 36, display: 'block', marginBottom: 12 }}>🔍</span>
                                <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px', color: 'var(--color-text-primary)' }}>
                                    {hasSearch ? `No foodies found matching "${search}"` : 'Type a name or username above to search'}
                                </h3>
                                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>
                                    Try searching by username or display name.
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, 260px), 1fr))`, gap: 16 }}>
                                {matchedUsers.map((u) => (
                                    <FoodieCard key={u._id} user={u} />
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    /* RECIPES TAB CONTENT */
                    <div>
                      {/* Category filters */}
{!hasSearch && categories.length > 1 && (
    <div className="flex justify-between items-center w-full gap-4 mb-8">
        <div className="flex-1 flex overflow-x-auto pb-4 gap-3 md:flex-wrap" style={{ scrollbarWidth: 'none' }}>
            {categories.map((cat) => (
                <button
                    key={cat}
                    id={`cat-filter-${cat.toLowerCase()}`}
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                        selectedCategory === cat
                            ? 'bg-orange-500 text-white shadow-md transform scale-105'
                            : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-500'
                    }`}
                >
                    {cat}
                </button>
            ))}
        </div>

        <div className="relative shrink-0">
            <button
                type="button"
                onClick={() => setShowSortMenu((isOpen) => !isOpen)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white border border-gray-200 rounded-full px-4 py-2"
            >
                Sort: {sortBy}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            {showSortMenu && (
                <div className="absolute right-0 top-12 w-48 bg-white shadow-xl border border-gray-100 rounded-xl py-2 z-10">
                    {['Newest', 'Most Popular', 'Highest Rated'].map((option) => (
                        <button
                            key={option}
                            type="button"
                            onClick={() => {
                                setSortBy(option);
                                setShowSortMenu(false);
                            }}
                            className="block w-full px-4 py-2 text-left hover:bg-gray-50 text-sm text-gray-700"
                        >
                            {option}
                        </button>
                    ))}
                </div>
            )}
        </div>
    </div>
)}
                        {/* Results meta */}
                        {!loading && !error && (
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: 20,
                                    flexWrap: 'wrap',
                                    gap: 6,
                                }}
                            >
                                <h2
                                    className="font-display"
                                    style={{
                                        fontSize: isMobile ? 18 : 20,
                                        fontWeight: 700,
                                        color: 'var(--color-text-primary)',
                                        margin: 0,
                                    }}
                                >
                                    {hasSearch
                                        ? `Results for "${search}"`
                                        : selectedCategory !== 'All'
                                        ? selectedCategory
                                        : 'Latest Recipes'}
                                </h2>
                                {total > 0 && (
                                    <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                                        {total} recipe{total !== 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div
                                style={{
                                    background: 'var(--color-accent-soft)',
                                    border: '1px solid rgba(220,76,76,0.2)',
                                    borderRadius: 12,
                                    padding: '16px 20px',
                                    color: 'var(--color-accent)',
                                    fontSize: 14,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    marginBottom: 24,
                                    flexWrap: 'wrap',
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                                </svg>
                                {error}
                                <button
                                    onClick={fetchRecipes}
                                    style={{
                                        marginLeft: 'auto',
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--color-accent)',
                                        cursor: 'pointer',
                                        fontSize: 13,
                                        fontWeight: 600,
                                        textDecoration: 'underline',
                                    }}
                                >
                                    Retry
                                </button>
                            </div>
                        )}
{/* Featured Recipe Banner */}
      {!loading && !error && recipes.length > 0 && selectedCategory === 'All' && !hasSearch && (
          <FeaturedRecipe recipe={recipes[0]} />
      )}
                        {!hasSearch && selectedCategory === 'All' && featuredChefs.length > 0 && (
                            <section className="my-12">
                                <div className="flex items-center justify-between gap-4 mb-8">
                                    <h2 className="font-serif text-3xl text-gray-900 mb-0">
                                        Meet Our Top Chefs
                                    </h2>
                                    <button
                                        onClick={() => setSearchTab('users')}
                                        className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        View all foodies
                                    </button>
                                </div>
                                <div className="flex overflow-x-auto gap-10 pb-6 no-scrollbar">
                                    {featuredChefs.map((chef) => {
                                        const chefName = chef.name || chef.username || 'Chef';
                                        const avatar = chef.avatar || chef.profileImage || chef.image;
                                        const recipeCount = chef.recipeCount ?? chef.recipes?.length ?? 0;

                                        return (
                                            <div key={chef._id} className="flex flex-col items-center flex-shrink-0 w-32 group">
                                                <a href={`/user/${chef.username}`} className="block">
                                                    {avatar ? (
                                                        <img
                                                            src={avatar}
                                                            alt={chefName}
                                                            className="w-28 h-28 rounded-full object-cover shadow-sm transition-transform duration-300 group-hover:scale-105 border-4 border-transparent group-hover:border-gray-100"
                                                        />
                                                    ) : (
                                                        <div className="w-28 h-28 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-2xl font-serif shadow-sm transition-transform duration-300 group-hover:scale-105 border-4 border-transparent group-hover:border-gray-100">
                                                            {chefName.slice(0, 2).toUpperCase()}
                                                        </div>
                                                    )}
                                                </a>
                                                <a href={`/user/${chef.username}`} className="font-serif text-lg text-gray-900 mt-4 text-center truncate max-w-full hover:text-orange-600 transition-colors">
                                                    {chefName}
                                                </a>
                                                <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                                                    {recipeCount} {recipeCount === 1 ? 'Recipe' : 'Recipes'}
                                                </span>
                                                <button
                                                    type="button"
                                                    className="mt-4 px-5 py-1.5 border border-gray-300 rounded-full text-xs font-semibold text-gray-700 hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-all"
                                                >
                                                    Follow
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}
                        {/* Grid */}
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, 300px), 1fr))`,
                                gap: isMobile ? 16 : 24,
                            }}
                        >
                            {loading
                                ? Array.from({ length: 6 }).map((_, i) => <RecipeCardSkeleton key={i} />)
                                : recipes.map((recipe) => (
                                      <RecipeCard key={recipe._id || recipe.slug} recipe={recipe} />
                                  ))}
                        </div>

                        {/* Empty state */}
                        {!loading && !error && recipes.length === 0 && (
                            <div
                                style={{
                                    textAlign: 'center',
                                    padding: '60px 20px',
                                    color: 'var(--color-text-muted)',
                                }}
                            >
                                <div style={{ fontSize: 48, marginBottom: 14 }}>🍳</div>
                                <h3
                                    className="font-display"
                                    style={{
                                        fontSize: 20,
                                        fontWeight: 700,
                                        color: 'var(--color-text-secondary)',
                                        margin: '0 0 10px',
                                    }}
                                >
                                    {hasSearch ? 'No recipes found' : 'No recipes yet'}
                                </h3>
                                <p style={{ fontSize: 14, margin: 0 }}>
                                    {hasSearch
                                        ? `We couldn't find anything for "${search}". Try a different search.`
                                        : 'Check back soon — new recipes are on their way.'}
                                </p>
                                {hasSearch && (
                                    <button
                                        onClick={() => setSearch('')}
                                        style={{
                                            marginTop: 20,
                                            background: 'var(--color-accent)',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: 8,
                                            padding: '10px 22px',
                                            fontSize: 13,
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Clear Search
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default RecipeFeed;
