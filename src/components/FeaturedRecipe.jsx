import { Link } from "react-router";
import useRecipeLike from "../hooks/useRecipeLike";

export default function FeaturedRecipe({ recipe }) {
  const { isLiked, likesCount, likeLoading, toggleLike } =
    useRecipeLike(recipe);

  const handleToggleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleLike();
  };

  if (!recipe) return null;

  const totalTime = [recipe.prepTime, recipe.cookTime]
    .filter(Boolean)
    .join(" + ");
  const author =
    recipe.authorName || recipe.author?.name || "Community Blogger";

  return (
    <div
      id="trending-recipe"
      className="relative mb-16 sm:mb-24 p-5 sm:p-10 lg:p-12 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-500/5 via-neutral-100 to-amber-900/5 dark:from-[#181715] dark:via-[#131210] dark:to-[#1a1815] border border-amber-500/20 dark:border-amber-500/10 shadow-xl overflow-hidden transition-all duration-300 scroll-mt-28"
    >
      {/* Decorative background glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-400/10 dark:bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid md:grid-cols-12 gap-8 lg:gap-14 items-center">
        {/* Large Visual Frame */}
        <div className="md:col-span-7 relative group">
          <Link
            to={`/recipe/${recipe.slug}`}
            className="block overflow-hidden rounded-2xl aspect-4/3 sm:aspect-16/10 shadow-lg relative bg-neutral-200 dark:bg-neutral-800"
          >
            {recipe.image ? (
              <img
                src={recipe.image}
                alt={recipe.title}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-7xl bg-stone-100 dark:bg-neutral-800">
                🍽️
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity" />
          </Link>

          {/* Floating Badge */}
          <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/75 backdrop-blur-md text-[#E7CA8D] border border-[#C9A96E]/40 text-xs font-bold uppercase tracking-wider shadow-md">
            <span>🔥</span> #1 Top Trending Recipe
          </div>

          {/* Quick Favorite Button */}
          <button
            type="button"
            onClick={handleToggleLike}
            aria-label={isLiked ? "Unlike recipe" : "Like recipe"}
            disabled={likeLoading}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-md disabled:opacity-60"
            title={isLiked ? "Unlike recipe" : "Like recipe"}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill={isLiked ? "#E59834" : "none"}
              stroke={isLiked ? "#E59834" : "currentColor"}
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>

        {/* Real Recipe Metadata */}
        <div className="md:col-span-5 flex flex-col items-start">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <span>★</span> Top Community Pick{" "}
              {likesCount ? `• ${likesCount} likes` : ""}
            </span>
            {recipe.category && (
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-md bg-[#C9A96E]/15 text-[#b0873a] dark:text-[#E7CA8D]">
                {recipe.category}
              </span>
            )}
            {recipe.createdAt && (
              <>
                <span className="text-xs text-neutral-400 dark:text-neutral-500">
                  •
                </span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {new Date(recipe.createdAt).toLocaleDateString()}
                </span>
              </>
            )}
          </div>

          <Link to={`/recipe/${recipe.slug}`} className="group">
            <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl text-neutral-900 dark:text-white font-medium leading-[1.15] sm:leading-[1.12] tracking-tight mb-3 sm:mb-4 group-hover:text-[#C9A96E] transition-colors line-clamp-2">
              {recipe.title}
            </h2>
          </Link>

          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 font-light leading-relaxed mb-6 line-clamp-3">
            {recipe.description}
          </p>

          {/* Key Specs Pills from MongoDB */}
          <div className="w-full grid grid-cols-2 gap-2.5 sm:gap-3 py-3 sm:py-4 border-y border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 mb-6 sm:mb-8">
            {totalTime && (
              <div className="flex items-center gap-2">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-[#C9A96E]"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>{totalTime}</span>
              </div>
            )}
            {recipe.servings && (
              <div className="flex items-center gap-2">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-[#C9A96E]"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
                <span>Yield: {recipe.servings} Servings</span>
              </div>
            )}
            <div className="flex items-center gap-2 col-span-2">
              <span className="text-neutral-400">Shared by:</span>
              <span className="font-medium text-neutral-900 dark:text-white">
                {author}
              </span>
            </div>
          </div>

          {/* Action Link */}
          <Link
            to={`/recipe/${recipe.slug}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-[0.18em] px-6 py-3.5 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:bg-[#C9A96E] dark:hover:bg-[#E7CA8D] dark:hover:text-black transition-all group shadow-md text-center"
          >
            <span>View Recipe &amp; Ingredients</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
