import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router';
import RecipeCard from '../components/RecipeCard';
import FoodieCard from '../components/FoodieCard';
import { getRecipes, getCategories, searchUsers } from '../api/recipeApi';
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
        <div className="flex flex-col gap-4 animate-pulse">
            <div className="w-full aspect-4/5 bg-[#E5E5E5]" />
            <div className="flex items-center justify-between px-1">
                <div className="h-3 w-16 bg-[#E5E5E5]" />
                <div className="h-3 w-12 bg-[#E5E5E5]" />
            </div>
            <div className="h-6 w-3/4 bg-[#E5E5E5] mx-1 mt-1" />
            <div className="h-4 w-1/2 bg-[#E5E5E5] mx-1 mt-1" />
        </div>
    );
}

function RecipeFeed() {
    const [recipes, setRecipes] = useState([]);
    const [categories, setCategories] = useState(['All']);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [search, setSearch] = useState('');
    const [searchTab, setSearchTab] = useState('recipes');
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

    // Trigger loading immediately when typing or clicking category
    useEffect(() => {
        setLoading(true);
        setError('');
        if (searchTab === 'users' && debouncedSearch.trim().length > 0) {
            setUsersLoading(true);
        } else if (searchTab === 'users') {
            setMatchedUsers([]);
            setUsersLoading(false);
        }
    }, [search, selectedCategory, searchTab]);

    useEffect(() => {
        getCategories()
            .then((data) => {
                const cats = (data.categories || []).filter(Boolean);
                setCategories(['All', 'Quick & Easy', 'Vegan', 'Techniques', ...cats]);
            }).catch(() => {});
    }, []);

    useEffect(() => {
        searchUsers('').then((data) => {
            setFeaturedChefs((data.users || []).slice(0, 4));
        }).catch(() => setFeaturedChefs([]));
    }, []);

    const fetchRecipes = useCallback(() => {
        if (searchTab !== 'recipes') return;
        
        getRecipes({ search: debouncedSearch, category: selectedCategory })
            .then((data) => {
                let fetchedRecipes = data.recipes || [];
                
                if (sortBy === 'Newest') {
                    fetchedRecipes.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                } else if (sortBy === 'Highest Rated') {
                    fetchedRecipes.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                }
                
                setRecipes(fetchedRecipes);
                setTotal(data.total || fetchedRecipes.length);
            })
            .catch(() => setError('Failed to load recipes. Please try again.'))
            .finally(() => setLoading(false));
    }, [debouncedSearch, selectedCategory, sortBy, searchTab]);

    useEffect(() => { fetchRecipes(); }, [fetchRecipes]);

    useEffect(() => {
        if (searchTab === 'users' && debouncedSearch.trim().length > 0) {
            searchUsers(debouncedSearch.trim())
                .then((data) => setMatchedUsers(data.users || []))
                .catch(() => setMatchedUsers([]))
                .finally(() => setUsersLoading(false));
        }
    }, [debouncedSearch, searchTab]);

    const hasSearch = search.trim().length > 0;

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            <Hero 
                search={search} setSearch={setSearch} searchRef={searchRef}
                searchTab={searchTab} setSearchTab={setSearchTab} matchedUsers={matchedUsers}
            />

            <div className="max-w-350 mx-auto px-6 lg:px-12 py-16 md:py-24">
                
                {searchTab === 'users' ? (
                    <div>
                        <div className="mb-12">
                            <h2 className="text-3xl font-serif font-medium text-[#1A1A1A] mb-4">
                                {hasSearch ? `Results for "${search}"` : 'Discover Creators'}
                            </h2>
                            <p className="text-lg text-[#666666] font-light max-w-2xl">
                                Connect with culinary creators and explore their published recipe collections.
                            </p>
                        </div>

                        {usersLoading ? (
                            <div className="text-center py-20 text-[#A3A3A3] font-serif text-xl italic">Searching...</div>
                        ) : matchedUsers.length === 0 ? (
                            <div className="text-center py-32 border-y border-[#E5E5E5]">
                                <h3 className="text-2xl font-serif text-[#1A1A1A] mb-4">
                                    {hasSearch ? `No creators found matching "${search}"` : 'Type a name above to search'}
                                </h3>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                                {matchedUsers.map((u) => <FoodieCard key={u._id} user={u} />)}
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        {/* MINIMALIST TAB COMMAND BAR */}
                        {!hasSearch && categories.length > 1 && (
                            <div className="w-full mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E5E5E5] pb-px">
                                <div className="flex-1 flex overflow-x-auto gap-10 md:flex-wrap scrollbar-none [&::-webkit-scrollbar]:hidden">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`whitespace-nowrap pb-4 text-xs font-semibold uppercase tracking-widest transition-all relative ${
                                                selectedCategory === cat
                                                    ? 'text-[#1A1A1A]'
                                                    : 'text-[#8C8C8C] hover:text-[#1A1A1A]'
                                            }`}
                                        >
                                            {cat}
                                            {selectedCategory === cat && (
                                                <span className="absolute bottom-0 left-0 w-full h-px bg-[#1A1A1A]"></span>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                <div className="relative shrink-0 pb-4 hidden md:block">
                                    <button
                                        type="button"
                                        onClick={() => setShowSortMenu((isOpen) => !isOpen)}
                                        className="flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-[#8C8C8C] hover:text-[#1A1A1A] transition-colors"
                                    >
                                        Sort: <span className="text-[#1A1A1A]">{sortBy}</span>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </button>
                                    {showSortMenu && (
                                        <div className="absolute right-0 top-10 w-48 bg-white border border-[#E5E5E5] shadow-2xl py-2 z-50">
                                            {['Newest', 'Most Popular', 'Highest Rated'].map((option) => (
                                                <button
                                                    key={option}
                                                    type="button"
                                                    onClick={() => { setSortBy(option); setShowSortMenu(false); }}
                                                    className="block w-full px-6 py-3 text-left hover:bg-[#FAFAFA] text-sm text-[#1A1A1A]"
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {!loading && !error && (
                            <div className="flex justify-between items-end mb-10 flex-wrap gap-4">
                                <h2 className="text-3xl font-serif font-medium text-[#1A1A1A]">
                                    {hasSearch ? `Results for "${search}"` : selectedCategory !== 'All' ? selectedCategory : 'Latest Recipes'}
                                </h2>
                                {total > 0 && <span className="text-sm font-medium text-[#8C8C8C]">{total} recipe{total !== 1 ? 's' : ''}</span>}
                            </div>
                        )}

                        {error && (
                            <div className="border border-[#1A1A1A] p-6 text-[#1A1A1A] font-serif text-lg flex items-center justify-between mb-12">
                                <span>{error}</span>
                                <button onClick={fetchRecipes} className="uppercase text-xs font-bold tracking-widest border-b border-[#1A1A1A] hover:opacity-60 transition-opacity">
                                    Retry
                                </button>
                            </div>
                        )}

                        {!loading && !error && recipes.length > 0 && selectedCategory === 'All' && !hasSearch && (
                            <FeaturedRecipe recipe={recipes[0]} />
                        )}

                        {/* GALLERY GRID */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                            {loading
                                ? Array.from({ length: 8 }).map((_, i) => <RecipeCardSkeleton key={i} />)
                                : recipes.map((recipe) => (
                                      <RecipeCard key={recipe._id || recipe.slug} recipe={recipe} />
                                  ))}
                        </div>

                        {!loading && !error && recipes.length === 0 && (
                            <div className="text-center py-32 border-y border-[#E5E5E5] mt-12">
                                <h3 className="text-3xl font-serif text-[#1A1A1A] mb-6">
                                    {hasSearch ? 'No recipes found.' : 'No recipes published yet.'}
                                </h3>
                                {hasSearch && (
                                    <button onClick={() => setSearch('')} className="uppercase text-xs font-bold tracking-widest border-b border-[#1A1A1A] pb-1 hover:opacity-60 transition-opacity">
                                        Clear Search
                                    </button>
                                )}
                            </div>
                        )}

                        {/* CHEF SECTION */}
                        {!hasSearch && selectedCategory === 'All' && featuredChefs.length > 0 && (
                            <section className="mt-32 pt-20 border-t border-[#E5E5E5]">
                                <div className="flex items-end justify-between mb-16">
                                    <h2 className="font-serif text-4xl text-[#1A1A1A]">Curated Creators</h2>
                                    <button onClick={() => setSearchTab('users')} className="uppercase text-xs font-bold tracking-widest text-[#1A1A1A] hover:opacity-60 transition-opacity">
                                        View all
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                                    {featuredChefs.map((chef) => {
                                        const chefName = chef.name || chef.username || 'Chef';
                                        const avatar = chef.avatar || chef.profileImage || chef.image;

                                        return (
                                            <div key={chef._id} className="flex flex-col items-start group">
                                                <Link to={`/user/${chef.username}`} className="block w-full mb-6 overflow-hidden bg-[#F2F2F2]">
                                                    {avatar ? (
                                                        <img src={avatar} alt={chefName} className="w-full aspect-square object-cover grayscale-20 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
                                                    ) : (
                                                        <div className="w-full aspect-square flex items-center justify-center text-4xl font-serif text-[#A3A3A3] group-hover:scale-105 transition-transform duration-700">
                                                            {chefName.slice(0, 2).toUpperCase()}
                                                        </div>
                                                    )}
                                                </Link>
                                                <Link to={`/user/${chef.username}`} className="font-serif text-2xl text-[#1A1A1A] hover:opacity-60 transition-opacity truncate w-full">
                                                    {chefName}
                                                </Link>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                    </div>
                )}
            </div>
        </div>
    );
}

export default RecipeFeed;