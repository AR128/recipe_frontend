import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/useAuth";
import { getComments, postComment } from "../api/recipeApi";

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function CommentSection({ slug }) {
  const { isAuthenticated, user, accessToken } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [commentsPage, setCommentsPage] = useState(1);
  const [commentsPages, setCommentsPages] = useState(1);
  const [totalComments, setTotalComments] = useState(0);
  const [loadingComments, setLoadingComments] = useState(true);
  const [commentsError, setCommentsError] = useState("");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [prevSlug, setPrevSlug] = useState(null);

  if (slug && slug !== prevSlug) {
    setPrevSlug(slug);
    setCommentsPage(1);
    setLoadingComments(true);
    setCommentsError("");
  }

  useEffect(() => {
    if (!slug) return;
    let isMounted = true;

    getComments(slug, commentsPage)
      .then((data) => {
        if (isMounted) {
          setComments(data.comments || []);
          setCommentsPages(data.pages || 1);
          setTotalComments(data.total || 0);
        }
      })
      .catch(() => {
        if (isMounted) setCommentsError("Failed to load comments.");
      })
      .finally(() => {
        if (isMounted) setLoadingComments(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug, commentsPage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/get-started");
      return;
    }
    if (!text.trim()) return;
    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);
    try {
      const data = await postComment(slug, text.trim(), accessToken);
      setCommentsPage(1);
      setComments((prev) => [data.comment, ...prev].slice(0, 20));
      setTotalComments((total) => total + 1);
      setText("");
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      setSubmitError(
        err.response?.data?.message ||
          "Failed to post comment. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnauthClick = () => {
    if (!isAuthenticated) {
      navigate("/get-started");
    }
  };

  return (
    <section
      className="pt-9 mt-9 border-t border-neutral-200 dark:border-neutral-800 transition-colors"
      id="comments"
    >
      <h2 className="font-serif text-2xl font-bold text-neutral-900 dark:text-white mb-6 transition-colors">
        Comments
        {totalComments > 0 && (
          <span className="font-sans text-sm font-medium text-neutral-500 dark:text-neutral-400 ml-3 transition-colors">
            ({totalComments})
          </span>
        )}
      </h2>

      {/* Comment form */}
      {isAuthenticated ? (
        <form
          onSubmit={handleSubmit}
          className="bg-neutral-50 dark:bg-neutral-900/50 rounded-xl p-5 mb-8 border border-neutral-200 dark:border-neutral-800 transition-colors"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center text-sm font-bold shrink-0 transition-colors">
              {(user?.name || user?.username || "?").slice(0, 2).toUpperCase()}
            </div>
            <span className="text-sm font-semibold text-neutral-900 dark:text-white transition-colors">
              {user?.name || user?.username}
            </span>
          </div>

          <textarea
            id="comment-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your thoughts on this recipe..."
            rows={3}
            maxLength={1000}
            required
            className="w-full bg-white dark:bg-[#0a0a0a] border border-neutral-300 dark:border-neutral-700 rounded-lg px-4 py-3 text-sm text-neutral-900 dark:text-white resize-y outline-none focus:border-neutral-900 dark:focus:border-white transition-colors font-sans placeholder-neutral-400 dark:placeholder-neutral-500"
          />

          <div className="flex items-center justify-between mt-3 gap-3">
            <span className="text-xs text-neutral-500 dark:text-neutral-400 transition-colors">
              {text.length}/1000
            </span>
            <button
              id="submit-comment-btn"
              type="submit"
              disabled={submitting || !text.trim()}
              className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-none rounded-lg px-5 py-2 text-sm font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 dark:border-black/40 border-t-white dark:border-t-black rounded-full animate-spin" />
                  Posting...
                </>
              ) : (
                "Post Comment"
              )}
            </button>
          </div>

          {submitError && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400 transition-colors">
              {submitError}
            </p>
          )}
          {submitSuccess && (
            <p className="mt-2 text-sm text-green-600 dark:text-green-400 transition-colors">
              ✓ Comment posted successfully!
            </p>
          )}
        </form>
      ) : (
        /* Auth gate */
        <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 mb-8 transition-colors">
          <div className="mb-3">
            <textarea
              onClick={handleUnauthClick}
              onFocus={handleUnauthClick}
              readOnly
              placeholder="Leave a comment... (Click to Log In)"
              rows={2}
              className="w-full bg-white dark:bg-[#0a0a0a] border border-neutral-300 dark:border-neutral-700 rounded-lg px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400 cursor-pointer resize-none font-sans transition-colors"
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-neutral-500 dark:text-neutral-400 m-0 transition-colors hidden sm:block">
              Join the conversation — log in to leave a comment.
            </p>
            <div className="flex gap-3 w-full sm:w-auto">
              <Link
                id="comment-login-link"
                to="/get-started"
                className="flex-1 sm:flex-none text-center bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg px-5 py-2 text-sm font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
              >
                Log In
              </Link>
              <Link
                id="comment-signup-link"
                to="/get-started"
                className="flex-1 sm:flex-none text-center bg-transparent text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700 rounded-lg px-5 py-2 text-sm font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Comment list */}
      {loadingComments ? (
        <div className="flex flex-col gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 shrink-0 transition-colors" />
              <div className="flex-1 flex flex-col gap-2 pt-1">
                <div className="w-32 h-3 bg-neutral-200 dark:bg-neutral-800 rounded transition-colors" />
                <div className="w-[90%] h-3 bg-neutral-200 dark:bg-neutral-800 rounded transition-colors" />
                <div className="w-[60%] h-3 bg-neutral-200 dark:bg-neutral-800 rounded transition-colors" />
              </div>
            </div>
          ))}
        </div>
      ) : commentsError ? (
        <p className="text-sm text-red-600 dark:text-red-400 transition-colors">
          {commentsError}
        </p>
      ) : comments.length === 0 ? (
        <div className="text-center py-10 px-5 text-neutral-500 dark:text-neutral-400 transition-colors">
          <div className="text-4xl mb-3">💬</div>
          <p className="text-sm">
            No comments yet. Be the first to share your thoughts!
          </p>
        </div>
      ) : (
        <div className="flex flex-col">
          {comments.map((comment, idx) => (
            <div
              key={comment._id}
              className={`flex gap-4 py-5 animate-fade-in ${
                idx < comments.length - 1
                  ? "border-b border-neutral-200 dark:border-neutral-800"
                  : ""
              } transition-colors`}
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              {/* Avatar */}
              <div
                className="w-10 h-10 rounded-full text-white flex items-center justify-center text-sm font-bold shrink-0"
                style={{
                  background: `hsl(${(comment.user?.username?.charCodeAt(0) * 31) % 360}, 55%, 55%)`,
                }}
              >
                {(comment.user?.name || comment.user?.username || "?")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>

              <div className="flex-1">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="font-semibold text-sm text-neutral-900 dark:text-white transition-colors">
                    {comment.user?.name ||
                      comment.user?.username ||
                      "Anonymous"}
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 transition-colors">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap m-0 transition-colors">
                  {comment.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      {commentsPages > 1 && !loadingComments && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            disabled={commentsPage <= 1}
            onClick={() => setCommentsPage((page) => page - 1)}
            className="rounded-full border border-neutral-300 px-4 py-2 text-xs font-semibold disabled:opacity-40 dark:border-neutral-700"
          >
            Previous
          </button>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            Page {commentsPage} of {commentsPages}
          </span>
          <button
            type="button"
            disabled={commentsPage >= commentsPages}
            onClick={() => setCommentsPage((page) => page + 1)}
            className="rounded-full border border-neutral-300 px-4 py-2 text-xs font-semibold disabled:opacity-40 dark:border-neutral-700"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}

export default CommentSection;
