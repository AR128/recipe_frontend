import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { getRecipe } from "../api/recipeApi";
import CommentSection from "../components/CommentSection";
import useRecipeLike from "../hooks/useRecipeLike";
import { useAuth } from "../context/useAuth";

export default function RecipeDetail() {
  const { slug } = useParams();
  const { loading: authLoading } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkedIngs, setCheckedIngs] = useState(new Set());
  const [baseServings, setBaseServings] = useState(4);
  const [servings, setServings] = useState(4);
  const [copied, setCopied] = useState(false);
  const { isLiked, likesCount, likeLoading, toggleLike } =
    useRecipeLike(recipe);

  useEffect(() => {
    if (!slug || authLoading) return undefined;
    const controller = new AbortController();

    queueMicrotask(() => {
      if (controller.signal.aborted) return;
      setLoading(true);
      setError("");

      getRecipe(slug, controller.signal)
        .then((data) => {
          if (controller.signal.aborted) return;
          const fetchedRecipe = data.recipe || data;
          setRecipe(fetchedRecipe);
          const initialServings =
            Number(fetchedRecipe.servings) > 0
              ? Number(fetchedRecipe.servings)
              : 4;
          setBaseServings(initialServings);
          setServings(initialServings);
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            setError("Failed to load recipe. Please try again.");
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    });

    return () => controller.abort();
  }, [slug, authLoading]);

  const ingredients = recipe?.ingredients || [];
  const instructions = recipe?.steps || recipe?.instructions || [];
  const tags = recipe?.tags || [];
  const authorName =
    recipe?.author?.name ||
    recipe?.author?.username ||
    recipe?.authorName ||
    "The Culinary Team";
  const recipeImage =
    recipe?.image || recipe?.imageUrl || recipe?.coverImage || "";
  const description = recipe?.description || "";
  const story = recipe?.content || recipe?.story || recipe?.notes || "";

  const totalMinutesText = useMemo(() => {
    const values = [recipe?.prepTime, recipe?.cookTime].filter(Boolean);
    return values.length ? values.join(" + ") : "30 mins";
  }, [recipe]);

  const toggleIngredient = (index) => {
    setCheckedIngs((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const scaleAmount = (amount) => {
    if (!amount) return "";
    const match = String(amount).match(/^(\d*\.?\d+)\s*(.*)/);
    if (!match) return amount;
    const number = parseFloat(match[1]);
    const unit = match[2];
    const scaled = (number * servings) / baseServings;
    return `${Number(scaled.toFixed(1))}${unit ? ` ${unit}` : ""}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0a] transition-colors duration-200 flex flex-col items-center justify-center gap-4">
        <span className="w-12 h-12 rounded-full border-2 border-[#C9A96E] border-t-transparent animate-spin" />
        <span className="font-serif text-xl text-neutral-500 dark:text-neutral-400 italic">
          Gathering ingredients & notes...
        </span>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0a] transition-colors duration-200 flex flex-col items-center justify-center px-6">
        <span className="text-5xl mb-4">🍽️</span>
        <h1 className="font-serif text-3xl sm:text-4xl text-neutral-900 dark:text-white mb-3 text-center">
          {error ? "Something went wrong" : "Recipe not found"}
        </h1>
        <p className="text-neutral-500 mb-8 max-w-md text-center text-sm">
          The dish you are looking for might have been moved or removed by its
          author.
        </p>
        <Link
          to="/"
          className="text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-black hover:opacity-80 transition-all"
        >
          Return to Recipes Feed
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0a] text-neutral-900 dark:text-white transition-colors duration-200">
      {/* ════════════════════════════════════════
                HERO — full-width cinematic image
                with overlaid title, description & actions
            ════════════════════════════════════════ */}
      <header className="relative w-full h-[60vw] max-h-[680px] min-h-[320px] overflow-hidden">
        {recipeImage ? (
          <img
            src={recipeImage}
            alt={recipe.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1400&auto=format&fit=crop";
            }}
          />
        ) : (
          <div className="w-full h-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-6xl text-neutral-400 dark:text-neutral-500">
            🍽️
          </div>
        )}

        {/* gradient overlay — stronger at bottom for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

        {/* Top bar — back link + action buttons */}
        <div className="absolute top-0 left-0 right-0 px-4 sm:px-8 lg:px-12 pt-4 sm:pt-6 flex items-center justify-between">
          <Link
            to="/"
            className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-white/80 hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10"
          >
            <span>←</span> Back to Feed
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="text-[11px] sm:text-xs font-bold uppercase tracking-wider px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 text-white hover:border-[#C9A96E] flex items-center gap-1.5 sm:gap-2 transition-colors"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              <span className="hidden sm:inline">
                {copied ? "Copied!" : "Share"}
              </span>
            </button>

            <button
              type="button"
              onClick={toggleLike}
              disabled={likeLoading}
              className={`text-[11px] sm:text-xs font-bold uppercase tracking-wider px-3 sm:px-4 py-1.5 sm:py-2 rounded-full flex items-center gap-1.5 sm:gap-2 transition-all ${
                isLiked
                  ? "bg-[#C9A96E] text-[#121210] border border-[#C9A96E]"
                  : "bg-black/40 backdrop-blur-sm border border-white/20 text-white hover:border-[#C9A96E]"
              }`}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill={isLiked ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span className="hidden sm:inline">
                {isLiked ? "Liked" : "Like Recipe"}
              </span>
            </button>
          </div>
        </div>

        {/* Bottom overlay — category pill + title + description + saves */}
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 lg:px-16 pb-6 sm:pb-10 lg:pb-14">
          <div className="max-w-screen-xl mx-auto">
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-[#C9A96E]/20 backdrop-blur-sm border border-[#C9A96E]/40 text-[#E7CA8D]">
                {recipe.category || "Recipe"}
              </span>
              {typeof likesCount === "number" && (
                <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 text-white flex items-center gap-1.5">
                  <span className="text-rose-400">❤️</span> {likesCount}{" "}
                  {likesCount === 1 ? "like" : "likes"}
                </span>
              )}
            </div>
            <h1
              className="font-serif font-medium text-white leading-[1.1] tracking-tight mb-3 sm:mb-4
                            text-3xl sm:text-5xl lg:text-6xl xl:text-7xl max-w-4xl"
            >
              {recipe.title}
            </h1>
            <p className="text-sm sm:text-lg text-white/70 font-light leading-relaxed max-w-2xl line-clamp-2 sm:line-clamp-3">
              {description}
            </p>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════
                SPECS BAND — full-width dark strip
            ════════════════════════════════════════ */}
      <div className="w-full bg-[#141412] dark:bg-[#0d0d0b] border-b border-white/5">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-8 lg:px-16">
          <div className="grid grid-cols-2 sm:grid-cols-4">
            {[
              { label: "Recipe Author", value: authorName },
              { label: "Prep Time", value: recipe?.prepTime || "—" },
              { label: "Total Time", value: totalMinutesText },
              {
                label: "Community Likes",
                value: (
                  <span className="flex items-center gap-1.5 text-rose-400">
                    <span>❤️</span> {likesCount}
                  </span>
                ),
              },
            ].map(({ label, value }, i) => (
              <div
                key={i}
                className={`py-5 sm:py-6 px-4 sm:px-6 ${i < 3 ? "border-r border-white/8" : ""} ${i >= 2 ? "border-t sm:border-t-0 border-white/8" : ""}`}
              >
                <span className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A96E] mb-1">
                  {label}
                </span>
                <span className="font-serif text-sm sm:text-base lg:text-lg font-bold text-white flex items-center gap-1.5">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
                MAIN CONTENT — full-width grid
                Desktop: Ingredients (left) | Steps (right)
                Mobile: stacked
            ════════════════════════════════════════ */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-8 lg:px-16 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 xl:gap-16 items-start">
          {/* ── LEFT: INGREDIENTS ── */}
          <aside className="lg:col-span-2 lg:sticky lg:top-24 self-start">
            <div className="rounded-2xl bg-white dark:bg-[#141412] border border-neutral-200/80 dark:border-white/8 shadow-sm overflow-hidden">
              {/* Card header */}
              <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-neutral-100 dark:border-white/8">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white mb-0.5">
                  Ingredients
                </h2>
                <p className="text-xs text-neutral-400 font-light">
                  Tap items to check off as you prep
                </p>
              </div>

              {/* Servings scaler */}
              <div className="px-5 sm:px-6 py-3.5 bg-neutral-50 dark:bg-white/[0.03] border-b border-neutral-100 dark:border-white/8 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Scale Servings
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setServings(Math.max(1, servings - 1))}
                    className="w-7 h-7 rounded-full bg-white dark:bg-white/10 border border-neutral-200 dark:border-white/10 flex items-center justify-center font-bold shadow-sm hover:bg-[#C9A96E] hover:border-[#C9A96E] hover:text-black transition-colors text-sm"
                  >
                    −
                  </button>
                  <span className="font-serif text-base font-bold w-5 text-center">
                    {servings}
                  </span>
                  <button
                    type="button"
                    onClick={() => setServings(servings + 1)}
                    className="w-7 h-7 rounded-full bg-white dark:bg-white/10 border border-neutral-200 dark:border-white/10 flex items-center justify-center font-bold shadow-sm hover:bg-[#C9A96E] hover:border-[#C9A96E] hover:text-black transition-colors text-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Ingredient list */}
              <ul className="px-5 sm:px-6 py-4 sm:py-5 space-y-0 divide-y divide-neutral-100 dark:divide-white/5">
                {ingredients.length > 0 ? (
                  ingredients.map((ingredient, index) => {
                    const checked = checkedIngs.has(index);
                    const amount =
                      typeof ingredient === "string" ? "" : ingredient?.amount;
                    const item =
                      typeof ingredient === "string"
                        ? ingredient
                        : ingredient?.item || ingredient?.name || "";

                    return (
                      <li
                        key={index}
                        className="flex items-start gap-3 py-3 select-none cursor-pointer group"
                        onClick={() => toggleIngredient(index)}
                      >
                        <div
                          className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                            checked
                              ? "bg-[#C9A96E] border-[#C9A96E] text-[#121210]"
                              : "bg-transparent border-neutral-300 dark:border-white/20 group-hover:border-[#C9A96E]"
                          }`}
                        >
                          {checked && (
                            <svg
                              width="11"
                              height="11"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                        <div
                          className={`text-sm leading-relaxed transition-all ${checked ? "opacity-40 line-through text-neutral-400" : "text-neutral-700 dark:text-neutral-200"}`}
                        >
                          {amount && (
                            <span className="font-semibold text-neutral-900 dark:text-white mr-1.5">
                              {scaleAmount(amount)}
                            </span>
                          )}
                          <span>{item}</span>
                        </div>
                      </li>
                    );
                  })
                ) : (
                  <li className="py-4 text-sm italic text-neutral-400">
                    No ingredients specified.
                  </li>
                )}
              </ul>
            </div>
          </aside>

          {/* ── RIGHT: METHOD + CHEF NOTES + TAGS ── */}
          <article className="lg:col-span-3 space-y-10 sm:space-y-12">
            {/* Method header */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200/80 dark:border-white/10">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
                Method & Preparation
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A96E] hidden sm:block">
                Step-by-Step
              </span>
            </div>

            {/* Steps */}
            <div className="space-y-4">
              {instructions.length > 0 ? (
                instructions.map((step, index) => {
                  const text =
                    typeof step === "string"
                      ? step
                      : step?.step || step?.text || "";
                  return (
                    <div
                      key={index}
                      className="flex gap-4 sm:gap-6 p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#141412] border border-neutral-200/80 dark:border-white/8 shadow-sm"
                    >
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#C9A96E]/15 text-[#C9A96E] font-serif font-bold text-sm sm:text-base flex items-center justify-center shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-sm sm:text-base leading-relaxed text-neutral-700 dark:text-neutral-200 pt-1.5 font-light">
                        {text}
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm italic text-neutral-400">
                  No preparation instructions provided.
                </p>
              )}
            </div>

            {/* Chef Notes */}
            {story && (
              <div className="p-6 sm:p-8 rounded-2xl bg-amber-50 dark:bg-white/[0.03] border border-amber-200/60 dark:border-white/8">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A96E] block mb-2">
                  Chef's Kitchen Notes
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                  Behind the Dish
                </h3>
                <div className="text-sm sm:text-base leading-relaxed text-neutral-600 dark:text-neutral-300 whitespace-pre-line font-light">
                  {story}
                </div>
              </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-neutral-200/80 dark:border-white/10">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 mr-1">
                  Tags:
                </span>
                {tags.map((tag, index) => {
                  const cleanTag = String(tag).replace(/^#/, "").trim();
                  return (
                    <Link
                      key={index}
                      to={`/recipes?search=${encodeURIComponent(cleanTag)}`}
                      className="px-3.5 py-1.5 rounded-full bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:border-[#C9A96E] hover:text-[#C9A96E] transition-colors"
                    >
                      #{cleanTag}
                    </Link>
                  );
                })}
              </div>
            )}
          </article>
        </div>
      </div>

      {/* ════════════════════════════════════════
                COMMENTS — full width, narrower read container
            ════════════════════════════════════════ */}
      <div className="border-t border-neutral-200/80 dark:border-white/8 bg-white dark:bg-[#0d0d0b]">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-8 lg:px-16 py-10 sm:py-14">
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mb-8">
            Home Cook Reviews & Notes
          </h3>
          <CommentSection slug={slug} />
        </div>
      </div>
    </div>
  );
}
