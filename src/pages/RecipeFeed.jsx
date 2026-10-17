import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import Hero from "../components/Hero";
import FeaturedRecipe from "../components/FeaturedRecipe";
import RecipeCard from "../components/RecipeCard";
import FoodieCard from "../components/FoodieCard";
import {
  getTrendingRecipes,
  getCategories,
  searchUsers,
} from "../api/recipeApi";
import { getApiErrorMessage } from "../utils/errorUtils";

export default function RecipeFeed() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Forward query searches from / to the full collection route /recipes
  useEffect(() => {
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const tag = searchParams.get("tag");
    const tab = searchParams.get("tab");
    if (search || category || tag || tab) {
      navigate(`/recipes?${searchParams.toString()}`, { replace: true });
    }
  }, [searchParams, navigate]);

  const [trendingRecipes, setTrendingRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredChefs, setFeaturedChefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch top 5 trending recipes (top 1 for trending, next 4 for community shared)
  const fetchTrending = useCallback(() => {
    setLoading(true);
    setError("");

    const controller = new AbortController();

    getTrendingRecipes(5, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setTrendingRecipes(data.recipes || []);
      })
      .catch((err) => {
        const wasCancelled =
          controller.signal.aborted ||
          err?.name === "CanceledError" ||
          err?.code === "ERR_CANCELED";

        if (!wasCancelled) {
          setError(
            getApiErrorMessage(
              err,
              "Failed to load trending recipes. Please check your connection."
            )
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    return fetchTrending();
  }, [fetchTrending]);

  // Fetch real categories from MongoDB for quick exploration
  useEffect(() => {
    let isMounted = true;
    getCategories()
      .then((data) => {
        if (isMounted) {
          const list = (data.categories || []).filter(Boolean);
          setCategories(list);
        }
      })
      .catch(() => {
        if (isMounted) setCategories([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch real food bloggers from MongoDB who have shared cooking recipes (top 4 only)
  useEffect(() => {
    let isMounted = true;
    searchUsers({ hasRecipes: true, limit: 4 })
      .then((data) => {
        if (isMounted) {
          // Only cooks who have actually published cooking recipes
          const activeCooks = (data.users || []).filter(
            (u) => (u.recipeCount || 0) > 0
          );
          setFeaturedChefs(activeCooks.slice(0, 4));
        }
      })
      .catch(() => {
        if (isMounted) setFeaturedChefs([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Top 1 recipe: Most saved / Top trending
  const topTrendingRecipe = trendingRecipes[0] || null;

  // Next 4 recipes: Top 4 community shared recipes (excluding top trending)
  const communitySharedRecipes = trendingRecipes.slice(1, 5);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0a] text-neutral-900 dark:text-white transition-colors duration-200">
      {/* 1. HERO SECTION (Without search bar completely) */}
      <Hero />

      {/* MAIN COMMUNITY CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12 md:py-20">
        {/* Error Alert with graceful Retry button */}
        {error && (
          <div className="mb-8 sm:mb-12 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-red-700 dark:text-red-400">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <span className="text-sm font-semibold">{error}</span>
            </div>
            <button
              type="button"
              onClick={fetchTrending}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-colors shrink-0 shadow-sm"
            >
              Retry
            </button>
          </div>
        )}

        {/* 2. TOP TRENDING RECIPE SECTION */}
        {loading && (
          <div className="mb-16 sm:mb-24 animate-pulse">
            <div className="h-6 w-48 bg-neutral-200 dark:bg-neutral-800 rounded mb-4" />
            <div className="w-full aspect-16/9 md:aspect-21/9 bg-neutral-200 dark:bg-neutral-800 rounded-3xl" />
          </div>
        )}

        {!loading && !error && topTrendingRecipe && (
          <section id="trending" className="scroll-mt-28 mb-16 sm:mb-20">
            <div className="flex items-center justify-between mb-6 sm:mb-8 pb-3 sm:pb-4 border-b border-neutral-200/80 dark:border-white/10">
              <div>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#C9A96E] block mb-1">
                  Community Favorite
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-neutral-900 dark:text-white">
                  Top Trending Recipe
                </h2>
              </div>
              <Link
                to="/recipes"
                className="text-xs font-bold uppercase tracking-wider text-[#C9A96E] hover:underline flex items-center gap-1.5"
              >
                <span>Full Collection</span>
                <span>→</span>
              </Link>
            </div>

            <FeaturedRecipe recipe={topTrendingRecipe} />

            {/* If there is ONLY 1 recipe, provide a direct CTA to explore all or share a new one */}
            {trendingRecipes.length === 1 && (
              <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#141412] border border-neutral-200/80 dark:border-white/10 text-center max-w-2xl mx-auto shadow-sm">
                <h3 className="font-serif text-xl sm:text-2xl font-bold mb-2">
                  Enjoying Poodiest?
                </h3>
                <p className="text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm mb-6 font-light">
                  Be among the first to publish dishes to our open recipe
                  community or explore our complete catalog.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                  <Link
                    to="/create-post"
                    className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#C9A96E] text-[#121210] font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-md text-center"
                  >
                    + Share Your Recipe
                  </Link>
                  <Link
                    to="/recipes"
                    className="w-full sm:w-auto px-6 py-3 rounded-full border border-neutral-300 dark:border-neutral-700 font-bold text-xs uppercase tracking-wider hover:bg-neutral-100 dark:hover:bg-white/5 transition-all text-center"
                  >
                    View Full Collection →
                  </Link>
                </div>
              </div>
            )}
          </section>
        )}

        {/* 3. COMMUNITY SHARED RECIPES (The top 4 most liked recipes, excluding top trending #1) */}
        {!loading && !error && communitySharedRecipes.length > 0 && (
          <section
            id="community-recipes"
            className="mb-16 sm:mb-24 scroll-mt-28"
          >
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10 pb-4 border-b border-neutral-200/80 dark:border-white/10">
              <div>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#C9A96E] block mb-1">
                  Ranked by Community Likes
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-neutral-900 dark:text-white">
                  Community Shared Recipes
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-light mt-1 max-w-xl">
                  Top 4 recipes liked by home cooks across our platform.
                </p>
              </div>

              {/* View Full Collection link in header */}
              <Link
                to="/recipes"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#C9A96E] hover:text-[#b89452] dark:hover:text-[#E7CA8D] transition-colors shrink-0"
              >
                <span>View Full Collection</span>
                <span className="text-sm">→</span>
              </Link>
            </div>

            {/* Grid of 4 community shared recipes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 sm:gap-8">
              {communitySharedRecipes.map((recipe) => (
                <RecipeCard key={recipe._id || recipe.slug} recipe={recipe} />
              ))}
            </div>

            {/* Option to View the Full Collection Button */}
            <div className="mt-10 sm:mt-16 text-center">
              <Link
                to="/recipes"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-black font-bold text-xs uppercase tracking-widest hover:bg-[#C9A96E] dark:hover:bg-[#E7CA8D] dark:hover:text-black transition-all shadow-xl hover:scale-105 active:scale-95 text-center"
              >
                <span>Explore Full Recipe Collection &amp; Search</span>
                <span className="text-base leading-none">→</span>
              </Link>
            </div>
          </section>
        )}

        {/* 6. HOW THE COMMUNITY WORKS */}
        <section
          id="how-it-works"
          className="p-5 sm:p-8 md:p-12 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-500/5 via-neutral-100 to-neutral-200/50 dark:from-[#181715] dark:via-[#131210] dark:to-[#1a1815] border border-amber-500/20 dark:border-amber-500/10 shadow-lg mb-12 scroll-mt-28"
        >
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-neutral-900 dark:text-white mb-2 sm:mb-3">
              How Poodiest Works
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
              We are an open food blogging platform built for real home cooks.
              Anyone can contribute family recipes and discover culinary
              techniques.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#161614] border border-neutral-200/80 dark:border-white/10 flex flex-col items-center text-center shadow-sm">
              <span className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#C9A96E]/20 text-[#C9A96E] flex items-center justify-center text-lg sm:text-xl font-bold mb-3 sm:mb-4">
                ✍️
              </span>
              <h3 className="font-serif text-base sm:text-lg font-bold mb-1.5 sm:mb-2">
                1. Share Your Recipes
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-light leading-relaxed">
                Publish your secret family dishes, cooking times, yields, and
                step-by-step instructions with photos.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#161614] border border-neutral-200/80 dark:border-white/10 flex flex-col items-center text-center shadow-sm">
              <span className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#C9A96E]/20 text-[#C9A96E] flex items-center justify-center text-lg sm:text-xl font-bold mb-3 sm:mb-4">
                ❤️
              </span>
              <h3 className="font-serif text-base sm:text-lg font-bold mb-1.5 sm:mb-2">
                2. Bookmark &amp; Save
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-light leading-relaxed">
                Click the heart on any recipe you love to save it to your
                profile. The most saved recipes rise to Top Trending!
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#161614] border border-neutral-200/80 dark:border-white/10 flex flex-col items-center text-center shadow-sm">
              <span className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#C9A96E]/20 text-[#C9A96E] flex items-center justify-center text-lg sm:text-xl font-bold mb-3 sm:mb-4">
                💬
              </span>
              <h3 className="font-serif text-base sm:text-lg font-bold mb-1.5 sm:mb-2">
                3. Discuss &amp; Review
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-light leading-relaxed">
                Leave cooking notes, tips, and recipe questions directly in the
                comments section to connect with other foodies.
              </p>
            </div>
          </div>
        </section>

        {/* 5. COMMUNITY FOOD BLOGGERS */}
        {featuredChefs.length > 0 && (
          <section id="creators" className="mb-16 sm:mb-24 scroll-mt-28">
            <div className="flex items-center justify-between mb-6 sm:mb-8 pb-3 sm:pb-4 border-b border-neutral-200/80 dark:border-white/10">
              <div>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#C9A96E] block mb-1">
                  Active Recipe Authors
                </span>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-neutral-900 dark:text-white">
                  Featured Community Cooks
                </h2>
              </div>
              <Link
                to="/recipes?tab=users"
                className="text-xs font-bold uppercase tracking-wider text-[#C9A96E] hover:underline flex items-center gap-1.5"
              >
                <span>Find More Bloggers</span>
                <span>→</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {featuredChefs.map((chef) => (
                <FoodieCard key={chef._id} user={chef} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
