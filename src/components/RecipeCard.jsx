import { useMemo } from "react";
import { Link } from "react-router";
import useRecipeLike from "../hooks/useRecipeLike";

export function RecipeCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col h-full bg-white dark:bg-[#141412] border border-neutral-200/80 dark:border-white/10 rounded-2xl overflow-hidden animate-pulse"
    >
      <div className="relative w-full aspect-4/3 bg-neutral-200 dark:bg-[#1c1c18]">
        <div className="absolute top-3 left-3 w-16 h-5 rounded-md bg-neutral-300 dark:bg-white/10" />
        <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-neutral-300 dark:bg-white/10" />
        <div className="absolute bottom-3 left-3 w-12 h-5 rounded bg-neutral-300 dark:bg-white/10" />
      </div>
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="w-20 h-3 rounded bg-neutral-200 dark:bg-white/10" />
            <div className="w-14 h-3 rounded bg-neutral-200 dark:bg-white/10" />
          </div>
          <div className="w-4/5 h-5 rounded bg-neutral-200 dark:bg-white/10 mb-2" />
          <div className="w-3/5 h-5 rounded bg-neutral-200 dark:bg-white/10" />
        </div>
        <div className="pt-4 mt-4 border-t border-neutral-100 dark:border-white/10 flex items-center justify-between">
          <div className="w-24 h-3 rounded bg-neutral-200 dark:bg-white/10" />
          <div className="w-12 h-3 rounded bg-neutral-200 dark:bg-white/10" />
        </div>
      </div>
    </div>
  );
}

export default function RecipeCard({ recipe }) {
  const { slug, title, image, authorName, category, cookTime, prepTime } =
    recipe || {};
  const { isLiked, likesCount, likeLoading, toggleLike } =
    useRecipeLike(recipe);

  const handleToggleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleLike();
  };

  // Calculate total time safely from real MongoDB fields
  const totalTime = useMemo(() => {
    const prep = parseInt(prepTime) || 0;
    const cook = parseInt(cookTime) || 0;
    const total = prep + cook;
    if (total > 0) return `${total}m`;
    if (cookTime) return cookTime;
    if (prepTime) return prepTime;
    return "";
  }, [prepTime, cookTime]);

  if (!recipe) return null;

  return (
    <div className="group relative flex flex-col h-full bg-white dark:bg-[#141412] border border-neutral-200/80 dark:border-white/10 hover:dark:border-[#C9A96E]/35 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-1 transition-all duration-200 font-sans">
      {/* The Image Container with Overlays */}
      <Link
        to={`/recipe/${slug}`}
        className="relative w-full aspect-4/3 overflow-hidden bg-neutral-100 dark:bg-[#1c1c18] block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#C9A96E]"
      >
        {image ? (
          <img
            src={image}
            alt={title ? `${title} recipe dish` : "Community shared recipe"}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div
            role="img"
            aria-label={title ? `${title} placeholder` : "Recipe placeholder"}
            className="w-full h-full flex items-center justify-center text-4xl bg-stone-100 dark:bg-[#1c1c18]"
          >
            🍽️
          </div>
        )}

        {/* Subtle vignette gradient */}
        <div className="absolute inset-0 bg-linear-to-t from-black/55 via-transparent to-black/10 opacity-45 group-hover:opacity-30 transition-opacity duration-200" />

        {/* Top Category Badge */}
        {category && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#141412]/80 backdrop-blur-md text-[#E7CA8D] border border-white/10">
            {category}
          </span>
        )}

        {/* Favorite Heart Button */}
        <button
          type="button"
          onClick={handleToggleLike}
          aria-label={
            isLiked
              ? `Remove ${title || "recipe"} from liked recipes`
              : `Like ${title || "recipe"}`
          }
          aria-pressed={isLiked}
          disabled={likeLoading}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#141412]/75 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:scale-110 hover:border-[#C9A96E] active:scale-90 transition-all duration-150 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E]"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill={isLiked ? "#E59834" : "none"}
            stroke={isLiked ? "#E59834" : "currentColor"}
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Bottom Time Pill */}
        {totalTime && (
          <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#141412]/80 backdrop-blur-md text-white text-[11px] font-medium border border-white/10">
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>{totalTime}</span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#C9A96E]">
              {category || "Community Dish"}
            </span>
            <div className="flex items-center gap-2">
              {likesCount > 0 && (
                <span
                  className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1"
                  title={`Liked by ${likesCount} users`}
                >
                  ❤️ {likesCount}
                </span>
              )}
              {recipe.servings && (
                <span className="text-[11px] text-neutral-400 dark:text-neutral-400 font-medium">
                  Serves {recipe.servings}
                </span>
              )}
            </div>
          </div>

          <Link
            to={`/recipe/${slug}`}
            className="block rounded-md group-hover:text-[#C9A96E] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E]"
          >
            <h3 className="font-serif text-lg sm:text-xl font-bold text-neutral-900 dark:text-white leading-snug line-clamp-2 mb-2">
              {title}
            </h3>
          </Link>
        </div>

        {/* Author Info & Arrow */}
        <div className="pt-4 mt-3 border-t border-neutral-100 dark:border-white/10 flex items-center justify-between">
          <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate max-w-38">
            By{" "}
            <span className="font-medium text-neutral-800 dark:text-neutral-200">
              {authorName || "Blogger"}
            </span>
          </span>

          <Link
            to={`/recipe/${slug}`}
            aria-label={`View recipe: ${title}`}
            className="text-xs font-bold text-[#C9A96E] uppercase tracking-wider flex items-center gap-1 rounded-md px-1.5 py-0.5 hover:translate-x-1 transition-transform duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E]"
          >
            <span>View</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden="true"
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