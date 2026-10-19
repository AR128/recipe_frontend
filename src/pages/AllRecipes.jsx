import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useSearchParams } from "react-router";
import RecipeCard from "../components/RecipeCard";
import FoodieCard from "../components/FoodieCard";
import { getRecipes, getCategories, searchUsers } from "../api/recipeApi";
import { getApiErrorMessage } from "../utils/errorUtils";
import { useAuth } from "../context/useAuth";

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
    <div className="flex flex-col rounded-2xl bg-white dark:bg-[#141412] border border-neutral-200/80 dark:border-white/10 overflow-hidden animate-pulse">
      <div className="w-full aspect-4/3 bg-neutral-200 dark:bg-neutral-800" />
      <div className="p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="h-3 w-16 bg-neutral-200 dark:bg-neutral-800 rounded" />
          <div className="h-3 w-12 bg-neutral-200 dark:bg-neutral-800 rounded" />
        </div>
        <div className="h-5 w-4/5 bg-neutral-200 dark:bg-neutral-800 rounded mt-1" />
        <div className="h-4 w-1/2 bg-neutral-200 dark:bg-neutral-800 rounded" />
        <div className="pt-4 border-t border-neutral-100 dark:border-white/5 flex justify-between items-center mt-2">
          <div className="h-3 w-20 bg-neutral-200 dark:bg-neutral-800 rounded" />
          <div className="h-3 w-12 bg-neutral-200 dark:bg-neutral-800 rounded" />
        </div>
      </div>
    </div>
  );
}

const CATEGORY_ICONS = {
  All: "🍽️",
  Dinner: "🍝",
  Breakfast: "🥑",
  "Quick & Easy": "⏱️",
  Dessert: "🍰",
  Vegan: "🥗",
  Techniques: "🔪",
  Drink: "🍹",
  Italian: "🍕",
  Asian: "🥢",
  Mexican: "🌮",
  Seafood: "🦐",
  Healthy: "🥑",
  General: "🍲",
};

export default function AllRecipes() {
  const { loading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const selectedCategory = searchParams.get("category") || "All";
  const search = searchParams.get("search") || searchParams.get("tag") || "";
  const searchTab = searchParams.get("tab") === "users" ? "users" : "recipes";
  const [matchedUsers, setMatchedUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [usersLoading, setUsersLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const recipePage = Math.max(
    1,
    Number.parseInt(searchParams.get("page") || "1", 10) || 1
  );
  const [recipePages, setRecipePages] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [userPages, setUserPages] = useState(1);
  const [sortBy, setSortBy] = useState("Newest");
  const [showSortMenu, setShowSortMenu] = useState(false);

  const searchInputRef = useRef(null);
  const debouncedSearch = useDebounce(search, 350);

  // Fetch real categories directly from MongoDB
  useEffect(() => {
    let isMounted = true;

    getCategories()
      .then((data) => {
        if (!isMounted) return;
        const fetchedCategories = (data.categories || []).filter(Boolean);
        setCategories(["All", ...fetchedCategories]);
      })
      .catch(() => {
        if (isMounted) {
          setCategories(["All"]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch all recipes from MongoDB
  const fetchRecipes = useCallback(() => {
    if (authLoading || searchTab !== "recipes") {
      return undefined;
    }

    const controller = new AbortController();

    queueMicrotask(() => {
      if (controller.signal.aborted) return;
      setLoading(true);
      setError("");

      getRecipes({
        search: debouncedSearch,
        category: selectedCategory,
        page: recipePage,
        limit: 20,
        signal: controller.signal,
      })
        .then((data) => {
          if (controller.signal.aborted) return;

          const fetchedRecipes = [...(data.recipes || [])];

          if (sortBy === "Newest") {
            fetchedRecipes.sort(
              (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
            );
          } else if (sortBy === "Most Popular") {
            fetchedRecipes.sort(
              (a, b) => (b.likesCount || 0) - (a.likesCount || 0)
            );
          } else if (sortBy === "Quickest") {
            fetchedRecipes.sort((a, b) => {
              const timeA =
                (parseInt(a.prepTime) || 0) + (parseInt(a.cookTime) || 0) ||
                999;
              const timeB =
                (parseInt(b.prepTime) || 0) + (parseInt(b.cookTime) || 0) ||
                999;
              return timeA - timeB;
            });
          }

          setRecipes(fetchedRecipes);
          setTotal(data.total || fetchedRecipes.length);
          setRecipePages(data.pages || 1);
        })
        .catch((requestError) => {
          const requestWasCancelled =
            controller.signal.aborted ||
            requestError.name === "CanceledError" ||
            requestError.code === "ERR_CANCELED";

          if (!requestWasCancelled) {
            setError(
              getApiErrorMessage(
                requestError,
                "Failed to load recipes from server. Please check your connection."
              )
            );
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setLoading(false);
          }
        });
    });

    return () => {
      controller.abort();
    };
  }, [
    authLoading,
    debouncedSearch,
    selectedCategory,
    sortBy,
    searchTab,
    recipePage,
  ]);

  useEffect(() => {
    return fetchRecipes();
  }, [fetchRecipes]);

  // Handle user search in MongoDB - loads all community bloggers and live-filters
  useEffect(() => {
    if (searchTab !== "users") {
      return undefined;
    }

    let isMounted = true;
    const controller = new AbortController();

    queueMicrotask(() => {
      if (!isMounted) return;
      setUsersLoading(true);
      searchUsers(
        {
          query: debouncedSearch.trim(),
          hasRecipes: true,
          limit: 20,
          page: userPage,
          signal: controller.signal,
        },
        controller.signal
      )
        .then((data) => {
          if (isMounted) {
            setMatchedUsers(data.users || []);
            setTotalUsers(data.total || 0);
            setUserPages(data.pages || 1);
          }
        })
        .catch((err) => {
          const wasAborted =
            controller.signal.aborted ||
            err?.name === "CanceledError" ||
            err?.code === "ERR_CANCELED";
          if (isMounted && !wasAborted) {
            setMatchedUsers([]);
          }
        })
        .finally(() => {
          if (isMounted && !controller.signal.aborted) {
            setUsersLoading(false);
          }
        });
    });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [debouncedSearch, searchTab, userPage]);

  const hasSearch = search.trim().length > 0;
  const hasActiveFilters = hasSearch || selectedCategory !== "All";

  const updateSearchTab = (tab) => {
    const nextParams = new URLSearchParams(searchParams);
    if (tab === "users") {
      nextParams.set("tab", "users");
      nextParams.delete("category");
    } else {
      nextParams.delete("tab");
    }
    nextParams.delete("page");
    setSearchParams(nextParams, { replace: true });
    setUserPage(1);
  };

  const updateSearch = (value) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("tag");
    if (value.trim()) nextParams.set("search", value);
    else nextParams.delete("search");
    nextParams.delete("page");
    setSearchParams(nextParams, { replace: true });
    setUserPage(1);
  };

  const updateCategory = (category) => {
    const nextParams = new URLSearchParams(searchParams);
    if (category && category !== "All") {
      nextParams.set("category", category);
    } else {
      nextParams.delete("category");
    }
    nextParams.delete("page");
    setSearchParams(nextParams, { replace: true });
  };

  const updateRecipePage = (page) => {
    const nextParams = new URLSearchParams(searchParams);
    if (page > 1) nextParams.set("page", String(page));
    else nextParams.delete("page");
    setSearchParams(nextParams);
  };

  const clearFilters = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("search");
    nextParams.delete("tag");
    nextParams.delete("category");
    nextParams.delete("page");
    setSearchParams(nextParams, { replace: true });
    setUserPage(1);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0a] text-neutral-900 dark:text-white transition-colors duration-200 pt-20 sm:pt-24 md:pt-28 pb-16 sm:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-4 sm:mb-6">
          <Link to="/" className="hover:text-[#C9A96E] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#C9A96E]">Full Recipe Collection</span>
        </nav>

        {/* Page Header */}
        <div className="mb-6 sm:mb-10">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#C9A96E] block mb-1.5 sm:mb-2">
            Explore The Community Archive
          </span>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-neutral-900 dark:text-white tracking-tight mb-2 sm:mb-4">
            Full Recipe Collection
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-neutral-600 dark:text-neutral-400 font-light max-w-2xl leading-relaxed">
            Search across all authentic dishes shared by home cooks, filter by
            cuisine, and save recipes directly to your personal cookbook.
          </p>
        </div>

        {/* SEARCH & FILTER CONSOLE */}
        <div className="bg-white dark:bg-[#141412] border border-neutral-200/80 dark:border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm mb-8 sm:mb-12">
          {/* Dual Category Tabs */}
          <div className="flex items-center gap-6 mb-6 border-b border-neutral-200/80 dark:border-white/10 pb-4">
            <button
              type="button"
              onClick={() => updateSearchTab("recipes")}
              className={`text-xs font-bold uppercase tracking-widest pb-1 relative transition-colors ${
                searchTab === "recipes"
                  ? "text-[#C9A96E]"
                  : "text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              Search Recipes
              {searchTab === "recipes" && (
                <span className="absolute -bottom-4.5 left-0 w-full h-[2px] bg-[#C9A96E]" />
              )}
            </button>

            <span className="text-neutral-300 dark:text-neutral-700">•</span>

            <button
              type="button"
              onClick={() => updateSearchTab("users")}
              className={`text-xs font-bold uppercase tracking-widest pb-1 relative transition-colors ${
                searchTab === "users"
                  ? "text-[#C9A96E]"
                  : "text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              Find Food Bloggers
              {searchTab === "users" && (
                <span className="absolute -bottom-4.5 left-0 w-full h-[2px] bg-[#C9A96E]" />
              )}
            </button>
          </div>

          {/* Search Input Bar */}
          <div className="relative flex items-center mb-6">
            <svg
              className="w-5 h-5 text-neutral-400 absolute left-4 pointer-events-none"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              aria-label={
                searchTab === "recipes"
                  ? "Search community recipes"
                  : "Search food bloggers"
              }
              placeholder={
                searchTab === "recipes"
                  ? "Search by dish name, ingredient, or tag (e.g. Pasta, Avocado, Cookies)..."
                  : "Search bloggers by name or username (e.g. Pegasus, Chef)..."
              }
              value={search}
              onChange={(e) => updateSearch(e.target.value)}
              className="w-full bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-2xl pl-12 pr-12 py-3.5 outline-none text-base text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-[#C9A96E] dark:focus:border-[#C9A96E] transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => updateSearch("")}
                className="absolute right-4 text-neutral-400 hover:text-neutral-900 dark:hover:text-white p-1 text-sm rounded-full transition-colors"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Categories Horizontal Strip (When searching recipes) */}
          {searchTab === "recipes" && categories.length > 1 && (
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Filter by Category:
                </span>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-xs font-semibold text-[#C9A96E] hover:underline flex items-center gap-1"
                  >
                    <span>Clear all filters</span>
                    <span>✕</span>
                  </button>
                )}
              </div>

              <div className="category-scroller flex items-center gap-2.5 overflow-x-auto pb-2 -mx-1 px-1">
                {categories.map((cat) => {
                  const icon = CATEGORY_ICONS[cat] || "🍳";
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => updateCategory(cat)}
                      className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 border ${
                        isActive
                          ? "bg-gradient-to-r from-[#C9A96E] to-[#DAB97E] text-[#121210] border-transparent shadow-md shadow-[#C9A96E]/20 font-extrabold"
                          : "bg-neutral-100 dark:bg-white/5 text-neutral-700 dark:text-neutral-300 border-neutral-200/80 dark:border-white/10 hover:border-[#C9A96E]/50 hover:bg-neutral-200/50 dark:hover:bg-white/10"
                      }`}
                    >
                      <span>{icon}</span>
                      <span>{cat}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* RESULTS SECTION */}
        {searchTab === "users" ? (
          /* FOOD BLOGGERS TAB */
          <div>
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-200/80 dark:border-white/10">
              <h2 className="text-2xl font-serif font-bold text-neutral-900 dark:text-white">
                {hasSearch
                  ? `Food Bloggers matching "${search}"`
                  : "Community Home Cooks & Bloggers"}
              </h2>
              {matchedUsers.length > 0 && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#C9A96E]/15 text-[#C9A96E]">
                  {totalUsers} found
                </span>
              )}
            </div>

            {usersLoading ? (
              <div className="text-center py-24 text-neutral-400 font-serif italic animate-pulse">
                Searching community bloggers...
              </div>
            ) : matchedUsers.length === 0 ? (
              <div className="text-center py-24 border border-dashed border-neutral-200 dark:border-white/10 rounded-3xl p-8">
                <span className="text-4xl mb-3 block">👨‍🍳</span>
                <h3 className="text-xl font-serif font-bold text-neutral-900 dark:text-white mb-2">
                  {hasSearch
                    ? `No food bloggers found matching "${search}"`
                    : "No food bloggers registered yet"}
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
                  {hasSearch
                    ? "Try searching by another username or check your spelling, or switch back to the recipes tab."
                    : "Be the first to create an account and share your recipes with our food community!"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {matchedUsers.map((user) => (
                  <FoodieCard
                    key={user.id || user._id || user.username}
                    user={user}
                  />
                ))}
              </div>
            )}
            <PageControls
              page={userPage}
              pages={userPages}
              onChange={setUserPage}
            />
          </div>
        ) : (
          /* RECIPES TAB */
          <div>
            {/* Header with Sort Menu */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-neutral-200/80 dark:border-white/10">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-serif font-bold text-neutral-900 dark:text-white">
                  {hasSearch
                    ? `Results for "${search}"`
                    : selectedCategory !== "All"
                      ? `${selectedCategory} Recipes`
                      : "All Community Recipes"}
                </h2>
                {!loading && total > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-neutral-200/70 dark:bg-white/10 text-neutral-700 dark:text-neutral-300">
                    {total}
                  </span>
                )}
              </div>

              {/* Sort Menu */}
              <div className="relative self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setShowSortMenu((prev) => !prev)}
                  className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl bg-white dark:bg-[#141412] border border-neutral-200/80 dark:border-white/10 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors shadow-sm"
                >
                  <span className="text-neutral-400 font-normal">Sort:</span>
                  <span className="text-[#C9A96E]">{sortBy}</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`transition-transform duration-200 ${
                      showSortMenu ? "rotate-180" : ""
                    }`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {showSortMenu && (
                  <div className="absolute right-0 top-12 w-48 bg-white dark:bg-[#161614] border border-neutral-200 dark:border-white/15 shadow-2xl rounded-2xl py-2 z-40 animate-fade-in">
                    {["Newest", "Most Popular", "Quickest"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setSortBy(option);
                          setShowSortMenu(false);
                        }}
                        className={`w-full px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors ${
                          sortBy === option
                            ? "text-[#C9A96E]"
                            : "text-neutral-700 dark:text-neutral-300"
                        }`}
                      >
                        <span>{option}</span>
                        {sortBy === option && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Error Message with Retry */}
            {error && (
              <div className="mb-10 p-6 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-red-700 dark:text-red-400">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚠️</span>
                  <span className="text-sm font-semibold">{error}</span>
                </div>
                <button
                  type="button"
                  onClick={fetchRecipes}
                  className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-colors shrink-0"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Loading Skeletons */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <RecipeCardSkeleton key={`skeleton-${idx}`} />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && recipes.length === 0 && (
              <div className="text-center py-24 border border-dashed border-neutral-200 dark:border-white/10 rounded-3xl p-8 max-w-xl mx-auto">
                <span className="text-5xl mb-4 block">🍳</span>
                <h3 className="text-2xl font-serif font-bold text-neutral-900 dark:text-white mb-3">
                  No recipes found
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8 leading-relaxed font-light">
                  {hasActiveFilters
                    ? "No dishes match your current search query or category filter. Try clearing filters or exploring a different cuisine."
                    : "Be the very first home cook to share a recipe with our community!"}
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  {hasActiveFilters ? (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="px-6 py-3 rounded-full bg-[#C9A96E] text-[#121210] font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-md"
                    >
                      Clear Filters
                    </button>
                  ) : (
                    <Link
                      to="/create-post"
                      className="px-6 py-3 rounded-full bg-[#C9A96E] text-[#121210] font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-md"
                    >
                      + Share The First Recipe
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Recipe Grid */}
            {!loading && !error && recipes.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {recipes.map((recipe) => (
                  <RecipeCard key={recipe._id || recipe.slug} recipe={recipe} />
                ))}
              </div>
            )}
            <PageControls
              page={recipePage}
              pages={recipePages}
              onChange={updateRecipePage}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function PageControls({ page, pages, onChange }) {
  if (pages <= 1) return null;
  return (
    <div className="mt-8 flex items-center justify-center gap-4">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="rounded-full border border-neutral-300 px-4 py-2 text-xs font-semibold disabled:opacity-40 dark:border-neutral-700"
      >
        Previous
      </button>
      <span className="text-xs text-neutral-500 dark:text-neutral-400">
        Page {page} of {pages}
      </span>
      <button
        type="button"
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
        className="rounded-full border border-neutral-300 px-4 py-2 text-xs font-semibold disabled:opacity-40 dark:border-neutral-700"
      >
        Next
      </button>
    </div>
  );
}
