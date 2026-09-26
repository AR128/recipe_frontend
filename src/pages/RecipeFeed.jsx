import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import RecipeCard from '../components/RecipeCard';
import { getRecipes, getCategories, searchUsers } from '../api/recipeApi';
import useWindowWidth from '../hooks/useWindowWidth';

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
    const [usersLoading, setUsersLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [total, setTotal] = useState(0);
    const searchRef = useRef(null);

    const debouncedSearch = useDebounce(search, 400);

    const navigate = useNavigate()

    // Load categories on mount
    useEffect(() => {
        getCategories()
            .then((data) => {
                const cats = (data.categories || []).filter(Boolean);
                setCategories(['All', ...cats]);
            })
            .catch(() => {});
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
            <div
                style={{
                    background: 'var(--color-surface)',
                    borderBottom: '1px solid var(--color-border)',
                    padding: isMobile ? '36px 16px 32px' : '60px 20px 48px',
                    textAlign: 'center',
                }}
            >
                <div style={{ maxWidth: 640, margin: '0 auto' }}>
                    <h1
                        className="font-display animate-fade-in"
                        style={{
                            fontSize: 'clamp(26px, 5vw, 54px)',
                            fontWeight: 700,
                            color: 'var(--color-text-primary)',
                            margin: '0 0 12px',
                            lineHeight: 1.15,
                        }}
                    >
                        Discover{' '}
                        <span style={{ color: 'var(--color-accent)' }}>Delicious</span>
                        {' '}Recipes
                    </h1>
                    <p
                        className="animate-fade-in"
                        style={{
                            fontSize: isMobile ? 14 : 16,
                            color: 'var(--color-text-secondary)',
                            margin: '0 0 28px',
                            lineHeight: 1.6,
                            animationDelay: '0.05s',
                        }}
                    >
                        From quick weeknight dinners to show-stopping desserts — find your next favourite meal.
                    </p>

                    {/* Search bar */}
                    <div
                        className="animate-fade-in"
                        style={{
                            position: 'relative',
                            maxWidth: 480,
                            margin: '0 auto',
                            animationDelay: '0.1s',
                        }}
                    >
                        <div
                            style={{
                                position: 'absolute',
                                left: 16,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--color-text-muted)',
                                pointerEvents: 'none',
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <circle cx="11" cy="11" r="8"/>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                            </svg>
                        </div>
                        <input
                            id="recipe-search-input"
                            ref={searchRef}
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search recipes, tags, or chefs..."
                            style={{
                                width: '100%',
                                paddingLeft: 46,
                                paddingRight: search ? 40 : 16,
                                paddingTop: 13,
                                paddingBottom: 13,
                                fontSize: 15,
                                background: 'var(--color-bg)',
                                border: '1.5px solid var(--color-border)',
                                borderRadius: 50,
                                color: 'var(--color-text-primary)',
                                outline: 'none',
                                transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                                fontFamily: "'Inter', sans-serif",
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = 'var(--color-accent)';
                                e.target.style.boxShadow = '0 0 0 3px rgba(220, 76, 76, 0.12)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'var(--color-border)';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                        {search && (
                            <button
                                onClick={() => { setSearch(''); searchRef.current?.focus(); }}
                                aria-label="Clear search"
                                style={{
                                    position: 'absolute',
                                    right: 14,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--color-text-muted)',
                                    padding: 2,
                                    display: 'flex',
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Search Type Tabs */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            flexWrap: 'wrap',
                            gap: 10,
                            marginTop: 16,
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => setSearchTab('recipes')}
                            style={{
                                padding: isMobile ? '7px 14px' : '6px 16px',
                                borderRadius: 20,
                                border: '1px solid var(--color-border)',
                                background: searchTab === 'recipes' ? 'var(--color-accent)' : 'var(--color-bg)',
                                color: searchTab === 'recipes' ? '#fff' : 'var(--color-text-secondary)',
                                fontSize: isMobile ? 12 : 13,
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            🍲 Recipes
                        </button>
                        <button
                            type="button"
                            onClick={() => setSearchTab('users')}
                            style={{
                                padding: isMobile ? '7px 14px' : '6px 16px',
                                borderRadius: 20,
                                border: '1px solid var(--color-border)',
                                background: searchTab === 'users' ? 'var(--color-accent)' : 'var(--color-bg)',
                                color: searchTab === 'users' ? '#fff' : 'var(--color-text-secondary)',
                                fontSize: isMobile ? 12 : 13,
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            👨‍🍳 Foodies {matchedUsers.length > 0 && `(${matchedUsers.length})`}
                        </button>
                        <button 
                            onClick={() => navigate('AddRecipe')}
                            className='bg-orange-400 border-2 rounded-sm text-center px-2 hover:bg-red-300'>
                                Add Recipe +
                        </button>
                    </div>
                </div>
            </div>

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
                                {matchedUsers.map((u) => {
                                    const initials = (u.name || u.username || '?').slice(0, 2).toUpperCase();
                                    return (
                                        <Link
                                            key={u._id}
                                            to={`/user/${u.username}`}
                                            style={{
                                                textDecoration: 'none',
                                                background: 'var(--color-surface)',
                                                border: '1px solid var(--color-border)',
                                                borderRadius: 16,
                                                padding: 20,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 16,
                                                boxShadow: 'var(--shadow-sm)',
                                                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-3px)';
                                                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: 48,
                                                    height: 48,
                                                    borderRadius: '50%',
                                                    background: 'var(--color-accent)',
                                                    color: '#fff',
                                                    fontWeight: 700,
                                                    fontSize: 16,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {initials}
                                            </div>
                                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                                <h4
                                                    style={{
                                                        fontSize: 15,
                                                        fontWeight: 700,
                                                        margin: '0 0 2px',
                                                        color: 'var(--color-text-primary)',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                    }}
                                                >
                                                    {u.name || u.username}
                                                </h4>
                                                <p style={{ fontSize: 12, color: 'var(--color-accent)', margin: 0, fontWeight: 600 }}>
                                                    @{u.username}
                                                </p>
                                            </div>
                                            <span style={{ fontSize: 12, color: 'var(--color-text-muted)', flexShrink: 0 }}>→</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ) : (
                    /* RECIPES TAB CONTENT */
                    <div>
                        {/* Category filters — horizontal scroll strip on mobile */}
                        {!hasSearch && categories.length > 1 && (
                            <div
                                className="scroll-strip"
                                style={{
                                    marginBottom: 28,
                                    paddingBottom: 4,
                                    // On desktop, allow wrapping
                                    flexWrap: isMobile ? 'nowrap' : 'wrap',
                                    gap: 8,
                                }}
                            >
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        id={`cat-filter-${cat.toLowerCase()}`}
                                        onClick={() => setSelectedCategory(cat)}
                                        style={{
                                            padding: '7px 18px',
                                            borderRadius: 50,
                                            border: selectedCategory === cat
                                                ? '1.5px solid var(--color-accent)'
                                                : '1.5px solid var(--color-border)',
                                            background: selectedCategory === cat
                                                ? 'var(--color-accent)'
                                                : 'var(--color-surface)',
                                            color: selectedCategory === cat ? '#fff' : 'var(--color-text-secondary)',
                                            fontSize: 13,
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease',
                                            fontFamily: "'Inter', sans-serif",
                                            whiteSpace: 'nowrap',
                                            flexShrink: 0,
                                        }}
                                    >
                                        {cat}
                                    </button>
                                ))}
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
