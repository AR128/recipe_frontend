import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/useAuth";
import { useTheme } from "../context/useTheme";
import api from "../api/axios";
import { deleteRecipePost, getSavedRecipesFromDb } from "../api/recipeApi";
import EditRecipeModal from "../components/EditRecipeModal";
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

function Account() {
  const { user, updateProfile, accessToken, token, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const authToken = accessToken || token;
  const navigate = useNavigate();

  // Active Sidebar View
  const [activeTab, setActiveTab] = useState("my-posts"); // 'my-posts' | 'saved-recipes' | 'commented-posts' | 'settings'

  // Profile Edit State
  const [profileDraft, setProfileDraft] = useState(null);
  const username = profileDraft?.username ?? user?.username ?? "";
  const fullName = profileDraft?.fullName ?? user?.fullName ?? user?.name ?? "";
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // My Published Posts
  const [myPosts, setMyPosts] = useState([]);
  const [myPostsLoading, setMyPostsLoading] = useState(true);
  const [myPostsError, setMyPostsError] = useState("");
  const [totalSavesReceived, setTotalSavesReceived] = useState(0);
  const [totalLikesReceived, setTotalLikesReceived] = useState(0);
  const [myPostsPage, setMyPostsPage] = useState(1);
  const [myPostsPages, setMyPostsPages] = useState(1);
  const [myPostsTotal, setMyPostsTotal] = useState(0);

  // Saved/Bookmarked Recipes
  const [savedPosts, setSavedPosts] = useState([]);
  const [savedLoading, setSavedLoading] = useState(true);
  const [savedError, setSavedError] = useState("");
  const [savedPage, setSavedPage] = useState(1);
  const [savedPages, setSavedPages] = useState(1);
  const [savedTotal, setSavedTotal] = useState(0);

  // Commented Recipes
  const [commentedPosts, setCommentedPosts] = useState([]);
  const [commentedLoading, setCommentedLoading] = useState(true);
  const [commentedError, setCommentedError] = useState("");
  const [commentedPage, setCommentedPage] = useState(1);
  const [commentedPages, setCommentedPages] = useState(1);
  const [commentedTotal, setCommentedTotal] = useState(0);

  // Modals
  const [editingPost, setEditingPost] = useState(null);
  const [deletingPost, setDeletingPost] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionFeedback, setActionFeedback] = useState("");

  // Lock body scroll during delete modal
  useEffect(() => {
    if (deletingPost) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [deletingPost]);

  // 1. Fetch user's own published posts and save metrics
  const fetchMyPosts = useCallback((page = 1) => {
    setMyPostsLoading(true);
    setMyPostsError("");
    api
      .get(`/my-posts?page=${page}`)
      .then((res) => {
        setMyPosts(res.data.recipes || []);
        setTotalSavesReceived(res.data.totalSavesReceived || 0);
        setTotalLikesReceived(res.data.totalLikesReceived || 0);
        setMyPostsTotal(res.data.total || 0);
        setMyPostsPages(res.data.pages || 1);
      })
      .catch(() => setMyPostsError("Failed to load your published posts."))
      .finally(() => setMyPostsLoading(false));
  }, []);

  // 2. Fetch saved/bookmarked recipes directly from MongoDB
  const fetchSavedPosts = useCallback(
    async (page = 1) => {
      setSavedLoading(true);
      setSavedError("");
      if (authToken) {
        try {
          const res = await getSavedRecipesFromDb(authToken, page);
          setSavedPosts(res.recipes || []);
          setSavedTotal(res.total || 0);
          setSavedPages(res.pages || 1);
        } catch (err) {
          console.error("Failed to load saved recipes from MongoDB:", err);
          setSavedPosts([]);
          setSavedError("Unable to load saved recipes right now.");
        }
      } else {
        setSavedPosts([]);
      }
      setSavedLoading(false);
    },
    [authToken]
  );

  // 3. Fetch recipes where user has commented
  const fetchCommentedPosts = useCallback((page = 1) => {
    setCommentedLoading(true);
    setCommentedError("");
    api
      .get(`/commented-posts?page=${page}`)
      .then((res) => {
        setCommentedPosts(res.data.recipes || []);
        setCommentedTotal(res.data.total || 0);
        setCommentedPages(res.data.pages || 1);
      })
      .catch(() => setCommentedError("Failed to load commented posts."))
      .finally(() => setCommentedLoading(false));
  }, []);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      fetchMyPosts();
      void fetchSavedPosts();
      fetchCommentedPosts();
    });
    return () => {
      active = false;
    };
  }, [fetchCommentedPosts, fetchMyPosts, fetchSavedPosts]);

  // Re-check saved posts whenever switching to the saved tab
  useEffect(() => {
    if (activeTab !== "saved-recipes") return undefined;
    let active = true;
    queueMicrotask(() => {
      if (active) void fetchSavedPosts(savedPage);
    });
    return () => {
      active = false;
    };
  }, [activeTab, fetchSavedPosts, savedPage]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    try {
      const updatedUser = await updateProfile(username, fullName);
      setProfileDraft({
        username: updatedUser.username || "",
        fullName: updatedUser.fullName || updatedUser.name || "",
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setSaveError(
        err.response?.data?.code === "USERNAME_TAKEN"
          ? "That username is already registered. Please choose another."
          : err.response?.data?.message || "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingPost) return;
    setIsDeleting(true);
    try {
      await deleteRecipePost(deletingPost._id, authToken);
      setMyPosts((prev) => prev.filter((p) => p._id !== deletingPost._id));
      setMyPostsTotal((total) => Math.max(0, total - 1));
      setActionFeedback(`✓ Post "${deletingPost.title}" deleted successfully.`);
      setTimeout(() => setActionFeedback(""), 4000);
      setDeletingPost(null);
    } catch (err) {
      console.error("Delete post error:", err);
      alert(err.response?.data?.message || "Failed to delete recipe post.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRecipeUpdated = (updated) => {
    setMyPosts((prev) =>
      prev.map((p) => (p._id === updated._id ? updated : p))
    );
    setActionFeedback(`✓ Post "${updated.title}" updated successfully.`);
    setTimeout(() => setActionFeedback(""), 4000);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const initials = getInitials(user);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0a] text-neutral-900 dark:text-white transition-colors pb-24">
      {/* TOP PROFILE BANNER */}
      <div className="w-full h-44 sm:h-56 md:h-72 relative">
        <img
          src={bannerImg}
          alt="Chef Profile Cover"
          className="w-full h-full object-cover brightness-75 dark:brightness-40 transition-all"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 md:top-8 md:left-12 z-20">
          <Link
            to="/"
            className="text-white hover:text-[#C9A96E] text-[11px] sm:text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors drop-shadow-md"
          >
            <span>←</span> Back to Community Feed
          </Link>
        </div>
      </div>

      {/* MAIN DASHBOARD CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative -mt-12 sm:-mt-16 md:-mt-20 z-10">
        {/* PROFILE HEADER SUMMARY CARD */}
        <div className="bg-white dark:bg-[#141412] border border-neutral-200/80 dark:border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl mb-8 flex flex-col md:flex-row items-center sm:items-start md:items-center justify-between gap-6 transition-colors text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white dark:border-[#141412] bg-gradient-to-tr from-[#C9A96E] to-[#E7CA8D] text-[#121210] font-serif font-black text-2xl sm:text-3xl flex items-center justify-center shadow-lg shrink-0">
              {initials}
            </div>
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-2.5">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
                  {user?.fullName || user?.name || "Community Chef"}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#C9A96E]/20 text-[#C9A96E] text-[10px] font-bold uppercase tracking-wider">
                  Food Blogger
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-medium mt-0.5">
                @{user?.username} • {user?.email}
              </p>
              <p className="text-xs text-neutral-400 mt-1.5">
                Member of the Poodiest open cooking community
              </p>
            </div>
          </div>

          {/* Quick Stats Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-5 md:flex items-center gap-3 sm:gap-4 border-t md:border-t-0 md:border-l border-neutral-200/80 dark:border-white/10 pt-4 md:pt-0 md:pl-8 w-full md:w-auto">
            <div className="text-center p-2 rounded-xl bg-neutral-50 dark:bg-white/5 md:bg-transparent md:p-0">
              <span className="font-serif text-xl sm:text-2xl font-bold text-[#C9A96E] block">
                {myPostsTotal}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                My Recipes
              </span>
            </div>
            <div className="text-center p-2 rounded-xl bg-neutral-50 dark:bg-white/5 md:bg-transparent md:p-0">
              <span className="font-serif text-xl sm:text-2xl font-bold text-[#C9A96E] block">
                {totalSavesReceived}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Post Saves
              </span>
            </div>
            <div className="text-center p-2 rounded-xl bg-neutral-50 dark:bg-white/5 md:bg-transparent md:p-0">
              <span className="font-serif text-xl sm:text-2xl font-bold text-[#C9A96E] block">
                {totalLikesReceived}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Post Likes
              </span>
            </div>
            <div className="text-center p-2 rounded-xl bg-neutral-50 dark:bg-white/5 md:bg-transparent md:p-0">
              <span className="font-serif text-xl sm:text-2xl font-bold text-[#C9A96E] block">
                {savedTotal}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Saved Dishes
              </span>
            </div>
            <div className="text-center p-2 rounded-xl bg-neutral-50 dark:bg-white/5 md:bg-transparent md:p-0">
              <span className="font-serif text-xl sm:text-2xl font-bold text-[#C9A96E] block">
                {commentedTotal}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Discussions
              </span>
            </div>
          </div>
        </div>

        {/* MOBILE HORIZONTAL NAVIGATION PILLS (< lg) */}
        <div className="lg:hidden mb-6 flex flex-col gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
            <button
              type="button"
              onClick={() => setActiveTab("my-posts")}
              className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === "my-posts"
                  ? "bg-[#C9A96E] text-[#121210] shadow-md shadow-[#C9A96E]/20"
                  : "bg-white dark:bg-[#141412] text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-white/10"
              }`}
            >
              <span>📖</span>
              <span>My Recipes</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === "my-posts" ? "bg-black/15 text-black" : "bg-neutral-200 dark:bg-white/10"}`}
              >
                {myPostsTotal}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("saved-recipes")}
              className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === "saved-recipes"
                  ? "bg-[#C9A96E] text-[#121210] shadow-md shadow-[#C9A96E]/20"
                  : "bg-white dark:bg-[#141412] text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-white/10"
              }`}
            >
              <span>💖</span>
              <span>Saved</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === "saved-recipes" ? "bg-black/15 text-black" : "bg-neutral-200 dark:bg-white/10"}`}
              >
                {savedTotal}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("commented-posts")}
              className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === "commented-posts"
                  ? "bg-[#C9A96E] text-[#121210] shadow-md shadow-[#C9A96E]/20"
                  : "bg-white dark:bg-[#141412] text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-white/10"
              }`}
            >
              <span>💬</span>
              <span>Discussions</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === "commented-posts" ? "bg-black/15 text-black" : "bg-neutral-200 dark:bg-white/10"}`}
              >
                {commentedTotal}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === "settings"
                  ? "bg-[#C9A96E] text-[#121210] shadow-md shadow-[#C9A96E]/20"
                  : "bg-white dark:bg-[#141412] text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-white/10"
              }`}
            >
              <span>⚙️</span>
              <span>Settings</span>
            </button>
          </div>

          <div>
            <Link
              to="/create-post"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-[#C9A96E] dark:hover:bg-[#E7CA8D] dark:hover:text-black transition-all"
            >
              <span className="text-sm font-bold">+</span>
              <span>Share Recipe</span>
            </Link>
          </div>
        </div>

        {/* TWO-COLUMN SIDEBAR + CONTENT LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT SIDEBAR NAVIGATION */}
          <aside className="hidden lg:block lg:col-span-4 bg-white dark:bg-[#141412] border border-neutral-200/80 dark:border-white/10 rounded-3xl p-5 shadow-sm lg:sticky lg:top-28">
            <div className="mb-4 pb-3 border-b border-neutral-100 dark:border-white/5 px-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A96E]">
                Kitchen Hub
              </span>
              <h2 className="font-serif text-lg font-bold text-neutral-900 dark:text-white">
                Navigation &amp; Library
              </h2>
            </div>

            {/* Navigation Buttons */}
            <nav className="flex flex-col gap-1.5 font-sans">
              {/* My Published Recipes */}
              <button
                type="button"
                onClick={() => setActiveTab("my-posts")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all text-left ${
                  activeTab === "my-posts"
                    ? "bg-[#C9A96E] text-[#121210] shadow-md shadow-[#C9A96E]/20 font-extrabold"
                    : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">📖</span>
                  <span>My Recipes</span>
                </div>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full ${
                    activeTab === "my-posts"
                      ? "bg-[#121210]/15 text-[#121210]"
                      : "bg-neutral-200/70 dark:bg-white/10 text-neutral-600 dark:text-neutral-300"
                  }`}
                >
                  {myPostsTotal}
                </span>
              </button>

              {/* Saved Recipes (The feature requested by the user!) */}
              <button
                type="button"
                onClick={() => setActiveTab("saved-recipes")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all text-left ${
                  activeTab === "saved-recipes"
                    ? "bg-[#C9A96E] text-[#121210] shadow-md shadow-[#C9A96E]/20 font-extrabold"
                    : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">💖</span>
                  <span>Saved Recipes</span>
                </div>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full ${
                    activeTab === "saved-recipes"
                      ? "bg-[#121210]/15 text-[#121210]"
                      : "bg-neutral-200/70 dark:bg-white/10 text-neutral-600 dark:text-neutral-300"
                  }`}
                >
                  {savedTotal}
                </span>
              </button>

              {/* Commented Discussions */}
              <button
                type="button"
                onClick={() => setActiveTab("commented-posts")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all text-left ${
                  activeTab === "commented-posts"
                    ? "bg-[#C9A96E] text-[#121210] shadow-md shadow-[#C9A96E]/20 font-extrabold"
                    : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">💬</span>
                  <span>Discussions</span>
                </div>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full ${
                    activeTab === "commented-posts"
                      ? "bg-[#121210]/15 text-[#121210]"
                      : "bg-neutral-200/70 dark:bg-white/10 text-neutral-600 dark:text-neutral-300"
                  }`}
                >
                  {commentedTotal}
                </span>
              </button>

              {/* Account & Preferences */}
              <button
                type="button"
                onClick={() => setActiveTab("settings")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all text-left ${
                  activeTab === "settings"
                    ? "bg-[#C9A96E] text-[#121210] shadow-md shadow-[#C9A96E]/20 font-extrabold"
                    : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">⚙️</span>
                  <span>Settings &amp; Theme</span>
                </div>
              </button>

              {/* Direct Post Creator CTA */}
              <div className="pt-3 mt-2 border-t border-neutral-100 dark:border-white/5">
                <Link
                  to="/create-post"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-xs font-bold uppercase tracking-wider hover:bg-[#C9A96E] dark:hover:bg-[#E7CA8D] dark:hover:text-black transition-all shadow-sm"
                >
                  <span>+</span>
                  <span>Share a Recipe</span>
                </Link>
              </div>

              {/* Logout Option */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors text-left"
                >
                  <span>🚪</span>
                  <span>Sign Out</span>
                </button>
              </div>
            </nav>
          </aside>

          {/* RIGHT MAIN CONTENT PANEL */}
          <main className="lg:col-span-8 flex flex-col gap-6">
            {/* Action feedback notification */}
            {actionFeedback && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-sm font-semibold animate-fade-in flex items-center gap-2">
                <span>{actionFeedback}</span>
              </div>
            )}

            {/* VIEW 1: MY PUBLISHED POSTS */}
            {activeTab === "my-posts" && (
              <div className="bg-white dark:bg-[#141412] border border-neutral-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-neutral-100 dark:border-white/5">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-neutral-900 dark:text-white">
                      My Published Recipes
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      Recipes you have written and shared with the Poodiest
                      community.
                    </p>
                  </div>
                  <Link
                    to="/create-post"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C9A96E] text-[#121210] font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-sm"
                  >
                    <span>+</span> Create New Recipe
                  </Link>
                </div>

                {myPostsLoading ? (
                  <div className="text-center py-20 text-neutral-400 font-serif italic animate-pulse">
                    Loading your kitchen catalog...
                  </div>
                ) : myPostsError ? (
                  <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                    {myPostsError}
                  </div>
                ) : myPostsTotal === 0 ? (
                  <div className="text-center py-20 px-6 border border-dashed border-neutral-200 dark:border-white/10 rounded-3xl">
                    <span className="text-5xl block mb-4">🍳</span>
                    <h4 className="font-serif text-xl font-bold text-neutral-900 dark:text-white mb-2">
                      You haven&apos;t shared any recipes yet
                    </h4>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mb-6 font-light">
                      Got a grandmother’s secret pasta, a 15-minute quick lunch,
                      or a signature baking technique? Share it with fellow food
                      bloggers!
                    </p>
                    <Link
                      to="/create-post"
                      className="px-6 py-3 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-black font-bold text-xs uppercase tracking-wider hover:bg-[#C9A96E] dark:hover:bg-[#C9A96E] transition-all"
                    >
                      Publish Your First Recipe
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {myPosts.map((post) => (
                      <RecipePostCard
                        key={post._id}
                        post={post}
                        isOwnPost={true}
                        onEdit={() => setEditingPost(post)}
                        onDelete={() => setDeletingPost(post)}
                      />
                    ))}
                  </div>
                )}
                <PageControls
                  page={myPostsPage}
                  pages={myPostsPages}
                  onChange={(page) => {
                    setMyPostsPage(page);
                    fetchMyPosts(page);
                  }}
                />
              </div>
            )}

            {/* VIEW 2: SAVED & BOOKMARKED RECIPES */}
            {activeTab === "saved-recipes" && (
              <div className="bg-white dark:bg-[#141412] border border-neutral-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-neutral-100 dark:border-white/5">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-2xl font-bold text-neutral-900 dark:text-white">
                        Saved Recipes
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#C9A96E]/20 text-[#C9A96E] text-xs font-bold">
                        {savedTotal}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      Recipes you’ve liked or bookmarked, all in one place.
                    </p>
                  </div>
                  <Link
                    to="/"
                    className="text-xs font-bold uppercase tracking-wider text-[#C9A96E] hover:underline"
                  >
                    Explore More Recipes →
                  </Link>
                </div>

                {savedLoading ? (
                  <div className="text-center py-20 text-neutral-400 font-serif italic animate-pulse">
                    Retrieving your saved cookbook...
                  </div>
                ) : savedError ? (
                  <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                    {savedError}
                  </div>
                ) : savedTotal === 0 ? (
                  <div className="text-center py-20 px-6 border border-dashed border-neutral-200 dark:border-white/10 rounded-3xl">
                    <span className="text-5xl block mb-4">💖</span>
                    <h4 className="font-serif text-xl font-bold text-neutral-900 dark:text-white mb-2">
                      No saved recipes yet
                    </h4>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mb-6 font-light">
                      Like a recipe or bookmark it to keep it here for your next
                      cooking session.
                    </p>
                    <Link
                      to="/"
                      className="px-6 py-3 rounded-full bg-[#C9A96E] text-[#121210] font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-sm"
                    >
                      Explore Community Recipes
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {savedPosts.map((post) => (
                      <RecipeCard key={post._id || post.slug} recipe={post} />
                    ))}
                  </div>
                )}
                <PageControls
                  page={savedPage}
                  pages={savedPages}
                  onChange={(page) => {
                    setSavedPage(page);
                  }}
                />
              </div>
            )}

            {/* VIEW 3: COMMENTED DISCUSSIONS */}
            {activeTab === "commented-posts" && (
              <div className="bg-white dark:bg-[#141412] border border-neutral-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm animate-fade-in">
                <div className="mb-8 pb-4 border-b border-neutral-100 dark:border-white/5">
                  <h3 className="font-serif text-2xl font-bold text-neutral-900 dark:text-white">
                    Community Discussions &amp; Notes
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Recipes where you shared feedback, tips, or reviews.
                  </p>
                </div>

                {commentedLoading ? (
                  <div className="text-center py-20 text-neutral-400 font-serif italic animate-pulse">
                    Loading your discussion history...
                  </div>
                ) : commentedError ? (
                  <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                    {commentedError}
                  </div>
                ) : commentedTotal === 0 ? (
                  <div className="text-center py-20 px-6 border border-dashed border-neutral-200 dark:border-white/10 rounded-3xl">
                    <span className="text-5xl block mb-4">💬</span>
                    <h4 className="font-serif text-xl font-bold text-neutral-900 dark:text-white mb-2">
                      No commented recipes yet
                    </h4>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mb-6 font-light">
                      Try leaving a question or sharing your cooking experience
                      on any recipe page to join the community discussion!
                    </p>
                    <Link
                      to="/"
                      className="px-6 py-3 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-black font-bold text-xs uppercase tracking-wider hover:opacity-80 transition-all"
                    >
                      Browse Recipe Feed
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {commentedPosts.map((post) => (
                      <RecipePostCard key={post._id} post={post} />
                    ))}
                  </div>
                )}
                <PageControls
                  page={commentedPage}
                  pages={commentedPages}
                  onChange={(page) => {
                    setCommentedPage(page);
                    fetchCommentedPosts(page);
                  }}
                />
              </div>
            )}

            {/* VIEW 4: SETTINGS & APPEARANCE */}
            {activeTab === "settings" && (
              <div className="bg-white dark:bg-[#141412] border border-neutral-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm animate-fade-in flex flex-col gap-8">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-neutral-900 dark:text-white">
                    Account Settings &amp; Preferences
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Manage your public foodie identity and appearance.
                  </p>
                </div>

                {/* Display Profile Form */}
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  {saveSuccess && (
                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-sm font-semibold border border-emerald-500/20">
                      ✓ Profile updated successfully!
                    </div>
                  )}
                  {saveError && (
                    <div className="p-3.5 rounded-2xl bg-red-500/10 text-red-700 dark:text-red-300 text-sm font-semibold border border-red-500/20">
                      ⚠️ {saveError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      autoComplete="name"
                      required
                      maxLength={80}
                      value={fullName}
                      onChange={(e) =>
                        setProfileDraft((current) => ({
                          username: current?.username ?? user?.username ?? "",
                          fullName: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-[#C9A96E] dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                    <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                      Your full name is shown publicly and can be the same as
                      another community member&apos;s.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2">
                      Username
                    </label>
                    <div className="flex items-center rounded-xl border border-neutral-200 bg-neutral-50 px-4 dark:border-white/10 dark:bg-white/5 focus-within:border-[#C9A96E]">
                      <span className="text-sm text-neutral-400">@</span>
                      <input
                        type="text"
                        autoComplete="username"
                        required
                        minLength={2}
                        maxLength={24}
                        pattern="[A-Za-z0-9_]+"
                        title="Use 2–24 letters, numbers, or underscores."
                        value={username}
                        onChange={(e) =>
                          setProfileDraft((current) => ({
                            username: e.target.value,
                            fullName:
                              current?.fullName ??
                              user?.fullName ??
                              user?.name ??
                              "",
                          }))
                        }
                        className="w-full bg-transparent px-2 py-2.5 text-sm text-neutral-900 outline-none dark:text-white"
                      />
                    </div>
                    <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                      Your unique profile handle. Use 2–24 letters, numbers, or
                      underscores with no spaces; usernames are unique
                      regardless of capitalization.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      readOnly
                      value={user?.email || ""}
                      className="w-full bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/5 rounded-xl px-4 py-2.5 text-sm text-neutral-400 cursor-not-allowed"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2.5 rounded-full bg-[#C9A96E] text-[#121210] font-bold text-xs uppercase tracking-wider hover:brightness-110 disabled:opacity-50 transition-all shadow-sm"
                    >
                      {saving ? "Saving..." : "Save Profile Changes"}
                    </button>
                  </div>
                </form>

                {/* Appearance / Theme Selector */}
                <div className="pt-6 border-t border-neutral-100 dark:border-white/5">
                  <h4 className="font-serif text-lg font-bold text-neutral-900 dark:text-white mb-2">
                    Interface Appearance
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4 font-light">
                    Select your preferred aesthetic mode for browsing recipes.
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { val: "light", label: "Parchment Light", icon: "☀️" },
                      { val: "dark", label: "Midnight Dark", icon: "🌙" },
                      { val: "system", label: "System Match", icon: "💻" },
                    ].map((t) => (
                      <button
                        key={t.val}
                        type="button"
                        onClick={() => setTheme(t.val)}
                        className={`p-3.5 rounded-2xl border text-xs font-bold uppercase tracking-wider flex flex-col items-center gap-2 transition-all ${
                          theme === t.val
                            ? "bg-[#C9A96E]/20 border-[#C9A96E] text-[#C9A96E] shadow-sm"
                            : "border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300"
                        }`}
                      >
                        <span className="text-xl">{t.icon}</span>
                        <span>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Account Session / Sign Out */}
                <div className="pt-6 border-t border-neutral-100 dark:border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-serif text-lg font-bold text-neutral-900 dark:text-white mb-1">
                      Account Session
                    </h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 font-light">
                      Sign out of your active session on this device.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>🚪</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}

            {/* Safe Mobile Sign Out at the bottom of the page */}
            <div className="lg:hidden mt-8 pt-6 border-t border-neutral-200/80 dark:border-white/10 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full max-w-xs flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-red-500/25 bg-red-500/5 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider hover:bg-red-500/10 active:scale-[0.98] transition-all"
              >
                <span>🚪</span>
                <span>Sign Out of Account</span>
              </button>
              <span className="text-[11px] text-neutral-400">
                Signed in as @{user?.username}
              </span>
            </div>
          </main>
        </div>
      </div>

      {/* Edit Recipe Modal */}
      <EditRecipeModal
        isOpen={!!editingPost}
        recipe={editingPost}
        onClose={() => setEditingPost(null)}
        onRecipeUpdated={handleRecipeUpdated}
      />

      {/* Delete Confirmation Modal */}
      {deletingPost && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={() => !isDeleting && setDeletingPost(null)}
        >
          <div
            className="bg-white dark:bg-[#161614] text-neutral-900 dark:text-white rounded-3xl w-full max-w-md p-6 sm:p-8 border border-neutral-200 dark:border-white/10 shadow-2xl flex flex-col gap-5 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center text-2xl shrink-0">
                🗑️
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold m-0">
                  Delete Recipe Post?
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 m-0 mt-0.5">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
              Are you sure you want to delete{" "}
              <strong className="text-neutral-900 dark:text-white">
                &ldquo;{deletingPost.title}&rdquo;
              </strong>
              ? It will be permanently removed from your profile and community
              search.
            </p>

            <div className="flex justify-end gap-3 mt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingPost(null)}
                className="px-5 py-2.5 rounded-full border border-neutral-300 dark:border-neutral-700 text-xs font-bold uppercase tracking-wider hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-full bg-red-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete Recipe"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RecipePostCard({ post, isOwnPost, onEdit, onDelete }) {
  return (
    <div className="bg-white dark:bg-[#161614] border border-neutral-200/80 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col group">
      <Link to={`/recipe/${post.slug}`} className="flex flex-col flex-1">
        <div className="h-44 w-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden relative">
          <img
            src={
              post.image ||
              "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80"
            }
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80";
            }}
          />
          {post.category && (
            <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-[#E7CA8D] border border-white/10 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
              {post.category}
            </span>
          )}
          {(post.savedCount !== undefined || post.likesCount !== undefined) && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5">
              {post.likesCount !== undefined && (
                <span className="bg-black/70 backdrop-blur-md text-[#E7CA8D] border border-white/10 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  ❤️ {post.likesCount}
                </span>
              )}
              {post.savedCount !== undefined && (
                <span className="bg-black/70 backdrop-blur-md text-[#E7CA8D] border border-white/10 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  🔖 {post.savedCount}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="p-4 sm:p-5 flex flex-col flex-1">
          <h4 className="font-serif text-base sm:text-lg font-bold text-neutral-900 dark:text-white mb-2 leading-snug group-hover:text-[#C9A96E] transition-colors">
            {post.title}
          </h4>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3 sm:mb-4 line-clamp-2 flex-1 font-light">
            {post.description}
          </p>
          <div className="text-[11px] text-neutral-400 flex flex-wrap items-center justify-between gap-1 uppercase tracking-wider font-semibold pt-3 border-t border-neutral-100 dark:border-white/5">
            <span className="truncate max-w-[110px]">
              By {post.authorName || "Chef"}
            </span>
            <span className="inline-flex flex-wrap items-center gap-x-2 text-amber-600 dark:text-amber-400 font-bold lowercase">
              <span>❤️ {post.likesCount || 0} likes</span>
              <span>🔖 {post.savedCount || 0} saves</span>
            </span>
            <span>
              {post.createdAt
                ? new Date(post.createdAt).toLocaleDateString()
                : ""}
            </span>
          </div>
        </div>
      </Link>

      {isOwnPost && (
        <div className="flex gap-2 px-4 py-3 border-t border-neutral-100 dark:border-white/5 bg-neutral-50 dark:bg-[#121210] justify-end">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onEdit) onEdit(post);
            }}
            className="px-3.5 py-2 sm:py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-semibold hover:border-[#C9A96E] transition-colors min-h-[38px] sm:min-h-0 flex items-center gap-1"
          >
            ✏️ Edit
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onDelete) onDelete(post);
            }}
            className="px-3.5 py-2 sm:py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-colors min-h-[38px] sm:min-h-0 flex items-center gap-1"
          >
            🗑️ Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default Account;
