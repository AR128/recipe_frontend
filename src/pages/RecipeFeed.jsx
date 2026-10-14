import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router';
import RecipeCard from '../components/RecipeCard';
import FoodieCard from '../components/FoodieCard';
import { getRecipes, getCategories, searchUsers } from '../api/recipeApi';
import Hero from '../components/Hero';
import FeaturedRecipe from '../components/FeaturedRecipe';

function useDebounce(value, delay) {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebounced(value);
        }, delay);

        return () => clearTimeout(timeoutId);
    }, [value, delay]);

    return debounced;
}

function RecipeCardSkeleton() {
    return (
        <div className="flex flex-col gap-4 animate-pulse">
            <div className="w-full aspect-4/5 bg-neutral-200 dark:bg-neutral-800 rounded-sm" />

            <div className="flex items-center justify-between px-1">
                <div className="h-3 w-16 bg-neutral-200 dark:bg-neutral-800 rounded-sm" />
                <div className="h-3 w-12 bg-neutral-200 dark:bg-neutral-800 rounded-sm" />
            </div>

            <div className="h-6 w-3/4 bg-neutral-200 dark:bg-neutral-800 mx-1 mt-1 rounded-sm" />
            <div className="h-4 w-1/2 bg-neutral-200 dark:bg-neutral-800 mx-1 mt-1 rounded-sm" />
        </div>
    );
}

function RecipeFeed() {
    const [searchParams] = useSearchParams();

    const [recipes, setRecipes] = useState([]);
    const [categories, setCategories] = useState(['All']);
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Reads /?search=Vegan when the page first loads.
    const [search, setSearch] = useState(
        () => searchParams.get('search') || ''
    );

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

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setError('');

        if (
            searchTab === 'users' &&
            debouncedSearch.trim().length > 0
        ) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setUsersLoading(true);
        } else if (searchTab === 'users') {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setMatchedUsers([]);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setUsersLoading(false);
        }
    }, [search, selectedCategory, searchTab, debouncedSearch]);

    useEffect(() => {
        let isMounted = true;

        getCategories()
            .then((data) => {
                if (!isMounted) return;

                const fetchedCategories = (data.categories || []).filter(
                    Boolean
                );

                setCategories([
                    'All',
                    'Quick & Easy',
                    'Vegan',
                    'Techniques',
                    ...fetchedCategories,
                ]);
            })
            .catch(() => {
                if (isMounted) {
                    setCategories(['All']);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        let isMounted = true;

        searchUsers('')
            .then((data) => {
                if (!isMounted) return;

                setFeaturedChefs((data.users || []).slice(0, 4));
            })
            .catch(() => {
                if (isMounted) {
                    setFeaturedChefs([]);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const fetchRecipes = useCallback(() => {
        if (searchTab !== 'recipes') {
            return undefined;
        }

        const controller = new AbortController();

        getRecipes({
            search: debouncedSearch,
            category: selectedCategory,
            signal: controller.signal,
        })
            .then((data) => {
                // Ignore a response if this request was cancelled.
                if (controller.signal.aborted) {
                    return;
                }

                const fetchedRecipes = [...(data.recipes || [])];

                if (sortBy === 'Newest') {
                    fetchedRecipes.sort(
                        (a, b) =>
                            new Date(b.createdAt || 0) -
                            new Date(a.createdAt || 0)
                    );
                }

                if (sortBy === 'Most Popular') {
                    fetchedRecipes.sort(
                        (a, b) =>
                            (b.likesCount || b.likes?.length || 0) -
                            (a.likesCount || a.likes?.length || 0)
                    );
                }

                if (sortBy === 'Highest Rated') {
                    fetchedRecipes.sort(
                        (a, b) => (b.rating || 0) - (a.rating || 0)
                    );
                }

                setRecipes(fetchedRecipes);
                setTotal(data.total || fetchedRecipes.length);
            })
            .catch((requestError) => {
                const requestWasCancelled =
                    controller.signal.aborted ||
                    requestError.name === 'CanceledError' ||
                    requestError.code === 'ERR_CANCELED';

                if (!requestWasCancelled) {
                    setError('Failed to load recipes. Please try again.');
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            });

        // React calls this cleanup when search/category/sort changes.
        // That cancels the previous request before the next one starts.
        return () => {
            controller.abort();
        };
    }, [debouncedSearch, selectedCategory, sortBy, searchTab]);

    useEffect(() => {
        return fetchRecipes();
    }, [fetchRecipes]);

    useEffect(() => {
        if (
            searchTab !== 'users' ||
            debouncedSearch.trim().length === 0
        ) {
            return undefined;
        }

        let isMounted = true;

        searchUsers(debouncedSearch.trim())
            .then((data) => {
                if (isMounted) {
                    setMatchedUsers(data.users || []);
                }
            })
            .catch(() => {
                if (isMounted) {
                    setMatchedUsers([]);
                }
            })
            .finally(() => {
                if (isMounted) {
                    setUsersLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [debouncedSearch, searchTab]);

    const hasSearch = search.trim().length > 0;

    return (
        <div className="min-h-screen transition-colors duration-200">
            <Hero
                search={search}
                setSearch={setSearch}
                searchRef={searchRef}
                searchTab={searchTab}
                setSearchTab={setSearchTab}
                matchedUsers={matchedUsers}
            />

            <div className="max-w-350 mx-auto px-6 lg:px-12 py-16 md:py-24">
                {searchTab === 'users' ? (
                    <div>
                        <div className="mb-12">
                            <h2 className="text-3xl font-serif font-medium text-neutral-900 dark:text-white mb-4 transition-colors">
                                {hasSearch
                                    ? `Results for "${search}"`
                                    : 'Discover Creators'}
                            </h2>

                            <p className="text-lg text-neutral-500 dark:text-neutral-400 font-light max-w-2xl transition-colors">
                                Connect with culinary creators and explore their
                                published recipe collections.
                            </p>
                        </div>

                        {usersLoading ? (
                            <div className="text-center py-20 text-neutral-400 dark:text-neutral-500 font-serif text-xl italic transition-colors">
                                Searching...
                            </div>
                        ) : matchedUsers.length === 0 ? (
                            <div className="text-center py-32 border-y border-neutral-200 dark:border-neutral-800 transition-colors">
                                <h3 className="text-2xl font-serif text-neutral-900 dark:text-white mb-4 transition-colors">
                                    {hasSearch
                                        ? `No creators found matching "${search}"`
                                        : 'Type a name above to search'}
                                </h3>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                                {matchedUsers.map((user) => (
                                    <FoodieCard
                                        key={user._id}
                                        user={user}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        {!hasSearch && categories.length > 1 && (
                            <div className="w-full mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-200 dark:border-neutral-800 pb-px transition-colors">
                                <div className="flex-1 flex overflow-x-auto gap-10 md:flex-wrap scrollbar-none [&::-webkit-scrollbar]:hidden">
                                    {categories.map((category) => (
                                        <button
                                            key={category}
                                            type="button"
                                            onClick={() =>
                                                setSelectedCategory(category)
                                            }
                                            className={`whitespace-nowrap pb-4 text-xs font-semibold uppercase tracking-widest transition-all relative ${
                                                selectedCategory === category
                                                    ? 'text-neutral-900 dark:text-white'
                                                    : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                                            }`}
                                        >
                                            {category}

                                            {selectedCategory === category && (
                                                <span className="absolute bottom-0 left-0 w-full h-px bg-neutral-900 dark:bg-white transition-colors" />
                                            )}
                                        </button>
                                    ))}
                                </div>

                                <div className="relative shrink-0 pb-4 hidden md:block">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowSortMenu((isOpen) => !isOpen)
                                        }
                                        className="flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
                                    >
                                        Sort:{' '}
                                        <span className="text-neutral-900 dark:text-white">
                                            {sortBy}
                                        </span>

                                        <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                        >
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </button>

                                    {showSortMenu && (
                                        <div className="absolute right-0 top-10 w-48 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-2xl py-2 z-50 transition-colors">
                                            {[
                                                'Newest',
                                                'Most Popular',
                                                'Highest Rated',
                                            ].map((option) => (
                                                <button
                                                    key={option}
                                                    type="button"
                                                    onClick={() => {
                                                        setSortBy(option);
                                                        setShowSortMenu(false);
                                                    }}
                                                    className="block w-full px-6 py-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm text-neutral-900 dark:text-white transition-colors"
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
                                <h2 className="text-3xl font-serif font-medium text-neutral-900 dark:text-white transition-colors">
                                    {hasSearch
                                        ? `Results for "${search}"`
                                        : selectedCategory !== 'All'
                                          ? selectedCategory
                                          : 'Latest Recipes'}
                                </h2>

                                {total > 0 && (
                                    <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 transition-colors">
                                        {total} recipe{total !== 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>
                        )}

                        {error && (
                            <div className="border border-neutral-900 dark:border-white p-6 text-neutral-900 dark:text-white font-serif text-lg flex items-center justify-between mb-12 transition-colors">
                                <span>{error}</span>

                                <button
                                    type="button"
                                    onClick={fetchRecipes}
                                    className="uppercase text-xs font-bold tracking-widest border-b border-neutral-900 dark:border-white hover:opacity-60 transition-opacity"
                                >
                                    Retry
                                </button>
                            </div>
                        )}

                        {!loading &&
                            !error &&
                            recipes.length > 0 &&
                            selectedCategory === 'All' &&
                            !hasSearch && (
                                <FeaturedRecipe recipe={recipes[0]} />
                            )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                            {loading
                                ? Array.from({ length: 8 }).map((_, index) => (
                                      <RecipeCardSkeleton key={index} />
                                  ))
                                : (selectedCategory === 'All' &&
                                      !hasSearch
                                          ? recipes.slice(1)
                                          : recipes
                                  ).map((recipe) => (
                                      <RecipeCard
                                          key={recipe._id || recipe.slug}
                                          recipe={recipe}
                                      />
                                  ))}
                        </div>

                        {!loading && !error && recipes.length === 0 && (
                            <div className="text-center py-32 border-y border-neutral-200 dark:border-neutral-800 mt-12 transition-colors">
                                <h3 className="text-3xl font-serif text-neutral-900 dark:text-white mb-6 transition-colors">
                                    {hasSearch
                                        ? 'No recipes found.'
                                        : 'No recipes published yet.'}
                                </h3>

                                {hasSearch && (
                                    <button
                                        type="button"
                                        onClick={() => setSearch('')}
                                        className="uppercase text-xs font-bold tracking-widest border-b border-neutral-900 dark:border-white pb-1 hover:opacity-60 transition-opacity text-neutral-900 dark:text-white"
                                    >
                                        Clear Search
                                    </button>
                                )}
                            </div>
                        )}

                        {!hasSearch &&
                            selectedCategory === 'All' &&
                            featuredChefs.length > 0 && (
                                <section className="mt-32 pt-20 border-t border-neutral-200 dark:border-neutral-800 transition-colors">
                                    <div className="flex items-end justify-between mb-16">
                                        <h2 className="font-serif text-4xl text-neutral-900 dark:text-white transition-colors">
                                            Curated Creators
                                        </h2>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSearchTab('users')
                                            }
                                            className="uppercase text-xs font-bold tracking-widest text-neutral-900 dark:text-white hover:opacity-60 transition-opacity"
                                        >
                                            View all
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                                        {featuredChefs.map((chef) => {
                                            const chefName =
                                                chef.name ||
                                                chef.username ||
                                                'Chef';

                                            const avatar =
                                                chef.avatar ||
                                                chef.profileImage ||
                                                chef.image;

                                            return (
                                                <div
                                                    key={chef._id}
                                                    className="flex flex-col items-start group"
                                                >
                                                    <Link
                                                        to={`/user/${chef.username}`}
                                                        className="block w-full mb-6 overflow-hidden bg-neutral-100 dark:bg-neutral-800 transition-colors"
                                                    >
                                                        {avatar ? (
                                                            <img
                                                                src={avatar}
                                                                alt={chefName}
                                                                className="w-full aspect-square object-cover grayscale-20 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                                                            />
                                                        ) : (
                                                            <div className="w-full aspect-square flex items-center justify-center text-4xl font-serif text-neutral-400 dark:text-neutral-500 group-hover:scale-105 transition-all duration-700">
                                                                {chefName
                                                                    .slice(0, 2)
                                                                    .toUpperCase()}
                                                            </div>
                                                        )}
                                                    </Link>

                                                    <Link
                                                        to={`/user/${chef.username}`}
                                                        className="font-serif text-2xl text-neutral-900 dark:text-white hover:opacity-60 transition-opacity truncate w-full"
                                                    >
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