import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "../context/useAuth";
import { toggleRecipeLikeInDb } from "../api/recipeApi";

export default function RecipeCard({ recipe }) {
  const { slug, title, image, authorName, category, cookTime, prepTime } =
    recipe || {};
  const { accessToken, token } = useAuth();
  const authToken = accessToken || token;
  const [likeOverride, setLikeOverride] = useState(null);
  const isLiked =
    likeOverride?.slug === slug
      ? likeOverride.liked
      : Boolean(recipe?.likedByMe);
  const likesCount =
    likeOverride?.slug === slug
      ? likeOverride.likesCount
      : recipe?.likesCount || 0;
  const [likeLoading, setLikeLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleToggleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!slug) return;
    if (!authToken) {
      navigate("/login", { state: { from: location } });
      return;
    }
    if (likeLoading) return;

    setLikeLoading(true);
    try {
      const result = await toggleRecipeLikeInDb(slug, authToken);
      setLikeOverride({
        slug,
        liked: result.liked,
        likesCount: result.likesCount,
      });
    } catch (error) {
      console.error("Failed to update recipe like:", error);
    } finally {
      setLikeLoading(false);
    }
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
    <div className="group relative flex flex-col h-full bg-white dark:bg-[#141412] border border-neutral-200/80 dark:border-white/10 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-1 transition-all duration-300">
      {/* The Image Container with Overlays */}
      <Link
        to={`/recipe/${slug}`}
        className="relative w-full aspect-4/3 overflow-hidden bg-neutral-100 dark:bg-neutral-800 block"
      >
        {image ? (
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl bg-stone-100 dark:bg-neutral-800">
            🍽️
          </div>
        )}

        {/* Subtle vignette gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 opacity-40 group-hover:opacity-30 transition-opacity" />

        {/* Top Category Badge (From real MongoDB record) */}
        {category && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-[#E7CA8D] border border-white/10">
            {category}
          </span>
        )}

        {/* Favorite Heart Button */}
        <button
          type="button"
          onClick={handleToggleLike}
          aria-label={isLiked ? "Unlike recipe" : "Like recipe"}
          disabled={likeLoading}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:scale-110 active:scale-90 transition-all disabled:opacity-60"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill={isLiked ? "#E59834" : "none"}
            stroke={isLiked ? "#E59834" : "currentColor"}
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Bottom Time Pill (From real MongoDB record) */}
        {totalTime && (
          <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-white text-[11px] font-medium">
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>{totalTime}</span>
          </div>
        )}
      </Link>

      {/* Content from real MongoDB document */}
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
                <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium">
                  Serves {recipe.servings}
                </span>
              )}
            </div>
          </div>

          <Link
            to={`/recipe/${slug}`}
            className="block group-hover:text-[#C9A96E] transition-colors"
          >
            <h3 className="font-serif text-lg sm:text-xl font-bold text-neutral-900 dark:text-white leading-snug line-clamp-2 mb-2">
              {title}
            </h3>
          </Link>
        </div>

        {/* Real Author Info & Arrow */}
        <div className="pt-4 mt-3 border-t border-neutral-100 dark:border-white/5 flex items-center justify-between">
          <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate max-w-[150px]">
            By{" "}
            <span className="font-medium text-neutral-800 dark:text-neutral-200">
              {authorName || "Blogger"}
            </span>
          </span>

          <Link
            to={`/recipe/${slug}`}
            aria-label={`View recipe: ${title}`}
            className="text-xs font-bold text-[#C9A96E] uppercase tracking-wider flex items-center gap-1 hover:translate-x-1 transition-transform"
          >
            <span>View</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
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
