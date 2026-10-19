import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router";
import { getPublicUserProfile } from "../api/recipeApi";
import RecipeCard from "../components/RecipeCard";
import bannerImg from "../assets/profile-banner.jpg";

function getInitials(user) {
  if (!user) return "?";
  const name = user.fullName || user.name || user.username || "";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "?";
}

function UserProfile() {
  const { username } = useParams();
  const [userData, setUserData] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [totalRecipes, setTotalRecipes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const recipesRef = useRef(null);

  const [prevUsername, setPrevUsername] = useState(null);

  if (username && username !== prevUsername) {
    setPrevUsername(username);
    setPage(1);
    setLoading(true);
    setError("");
  }

  useEffect(() => {
    if (!username) return;
    let isMounted = true;

    getPublicUserProfile(username, page)
      .then((data) => {
        if (isMounted) {
          setUserData(data.user);
          setRecipes(data.recipes || []);
          setPages(data.pages || 1);
          setTotalRecipes(data.total || 0);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Failed to load user profile:", err);
          setError(err.response?.data?.message || "Chef / User not found.");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [username, page]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-neutral-50 dark:bg-[#0a0a0a] transition-colors gap-4">
        <div className="w-10 h-10 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" />
        <p className="text-neutral-500 dark:text-neutral-400 font-serif italic">
          Opening chef’s kitchen...
        </p>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-neutral-50 dark:bg-[#0a0a0a] px-6 transition-colors text-center">
        <span className="text-6xl block mb-6">👨‍🍳</span>
        <h2 className="font-serif text-3xl font-bold text-neutral-900 dark:text-white mb-3">
          Creator Not Found
        </h2>
        <p className="text-neutral-500 dark:text-neutral-400 mb-8 max-w-sm text-sm font-light">
          {error ||
            "The chef profile you are looking for does not exist or has been removed."}
        </p>
        <Link
          to="/"
          className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#C9A96E] dark:hover:bg-[#C9A96E] transition-colors"
        >
          Back to Feed
        </Link>
      </div>
    );
  }

  const initials = getInitials(userData);
  const changePage = (nextPage) => {
    setPage(nextPage);
    recipesRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0a] transition-colors pb-20">
      {/* Cinematic Banner */}
      <div className="w-full h-48 sm:h-64 md:h-96 relative">
        <img
          src={bannerImg}
          alt="Chef Profile Cover"
          className="w-full h-full object-cover brightness-75 dark:brightness-40 transition-all"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Back link floating on banner */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 md:top-8 md:left-12 z-20">
          <Link
            to="/"
            className="text-white hover:text-[#C9A96E] text-[11px] sm:text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors drop-shadow-md"
          >
            <span>←</span> Back to Feed
          </Link>
        </div>
      </div>

      {/* Main Content Overlapping Banner */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 relative -mt-14 sm:-mt-20 md:-mt-24 z-10 animate-fade-in">
        {/* Profile Header Card */}
        <div className="bg-white dark:bg-[#141412] border border-neutral-200/80 dark:border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 shadow-xl mb-10 sm:mb-14 transition-colors relative flex flex-col md:flex-row items-center sm:items-start md:items-end gap-5 sm:gap-6 md:gap-10 text-center sm:text-left">
          {/* Floating Avatar */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full border-4 border-white dark:border-[#141412] flex items-center justify-center text-2xl sm:text-3xl font-serif font-black shadow-xl text-[#121210] bg-gradient-to-tr from-[#C9A96E] to-[#E7CA8D] shrink-0">
            {initials}
          </div>

          {/* Content */}
          <div className="flex-1 w-full">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 mb-1">
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white">
                {userData.fullName || userData.name || userData.username}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
                Verified Creator
              </span>
            </div>
            <p className="text-[#C9A96E] font-medium text-xs sm:text-sm tracking-wide mb-2 sm:mb-3">
              @{userData.username}
            </p>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-light max-w-xl mb-4 sm:mb-5 mx-auto sm:mx-0">
              {userData.bio ||
                "Recipe developer, food stylist, and passionate home cook sharing family treasures and experimental gastronomy."}
            </p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-4 md:gap-6 text-[11px] sm:text-xs font-semibold text-neutral-500 dark:text-neutral-400 border-t border-neutral-100 dark:border-white/5 pt-3.5 sm:pt-4">
              <span className="flex items-center gap-1.5">
                📅 Member since{" "}
                {userData.createdAt
                  ? new Date(userData.createdAt).getFullYear()
                  : "2025"}
              </span>
              <span className="flex items-center gap-1.5">
                🍲 {totalRecipes} Published{" "}
                {totalRecipes === 1 ? "Dish" : "Dishes"}
              </span>
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                ❤️ Saved by {userData.totalSavesReceived || 0}{" "}
                {userData.totalSavesReceived === 1 ? "user" : "users"}
              </span>
            </div>
          </div>
        </div>

        {/* Recipes Section */}
        <div ref={recipesRef} className="scroll-mt-28">
          <div className="flex justify-between items-center mb-6 sm:mb-8 pb-3 sm:pb-4 border-b border-neutral-200/80 dark:border-white/10">
            <div>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#C9A96E] block mb-1">
                Kitchen Catalog
              </span>
              <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
                Published Recipes
              </h2>
            </div>
            <span className="text-xs font-bold text-neutral-400">
              {totalRecipes} {totalRecipes === 1 ? "recipe" : "recipes"}
            </span>
          </div>

          {recipes.length === 0 ? (
            <div className="text-center py-16 sm:py-24 px-4 sm:px-6 bg-white dark:bg-[#141412] border border-dashed border-neutral-200 dark:border-white/10 rounded-2xl sm:rounded-3xl">
              <span className="text-4xl sm:text-5xl block mb-4">🍳</span>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-neutral-900 dark:text-white mb-2">
                No recipes published yet
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-light max-w-md mx-auto">
                {userData.name || userData.username} is currently crafting new
                recipes in the test kitchen. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 md:gap-8">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe._id || recipe.slug} recipe={recipe} />
              ))}
            </div>
          )}
          {pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => changePage(page - 1)}
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
                onClick={() => changePage(page + 1)}
                className="rounded-full border border-neutral-300 px-4 py-2 text-xs font-semibold disabled:opacity-40 dark:border-neutral-700"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
