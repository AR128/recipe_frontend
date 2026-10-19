import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import signupImage from "../assets/Signup-image.avif";
import { useAuth } from "../context/useAuth";

const getAuthErrorMessage = (error) => {
  switch (error.code) {
    case "auth/popup-closed-by-user":
      return "The sign-in window was closed before you finished. Try again when you're ready.";
    case "auth/popup-blocked":
      return "Your browser blocked the Google sign-in window. Allow pop-ups for this site and try again.";
    case "auth/unauthorized-domain":
      return "This site is not authorized for this Firebase project. Add its domain in Firebase Authentication settings.";
    case "auth/network-request-failed":
      return "We couldn't reach Google. Check your connection and try again.";
    default:
      return "Google sign-in didn't work. Please try again.";
  }
};

export default function GetStarted() {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { isAuthenticated, loading, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate(location.state?.from || "/", { replace: true });
    }
  }, [isAuthenticated, loading, location.state, navigate]);

  const handleGoogleSignIn = async () => {
    setError("");
    setSubmitting(true);

    try {
      await loginWithGoogle();
      navigate(location.state?.from || "/", { replace: true });
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f4ed] text-[#1d241d] lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative min-h-[36vh] overflow-hidden bg-[#332f24] lg:min-h-screen">
        <img
          src={signupImage}
          alt="A freshly prepared dish served at a shared table"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/20" />
        <Link
          to="/"
          className="absolute left-6 top-6 z-10 flex items-center gap-3 text-white sm:left-10 sm:top-10"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d9b977] font-serif text-xl font-black text-[#202119]">
            P
          </span>
          <span className="font-serif text-2xl font-bold tracking-tight">
            Poodiest<span className="text-[#d9b977]">.</span>
          </span>
        </Link>
        <div className="absolute inset-x-0 bottom-0 p-7 text-white sm:p-12 lg:p-16">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-[#e2c785]">
            A little more joy at the table
          </p>
          <h1 className="max-w-xl font-serif text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">
            Make room for something delicious.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-6 text-white/80 sm:text-base">
            Find recipes worth keeping, meet the people behind them, and share
            what you love to cook.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-14">
        <div className="w-full max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8b7750]">
            Your kitchen, your community
          </p>
          <h2 className="mt-3 font-serif text-4xl font-semibold tracking-tight sm:text-[2.75rem]">
            Get started.
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#6d7067]">
            Join the table with your Google account. One secure sign-in, then
            straight to the good stuff.
          </p>

          {error && (
            <div
              role="alert"
              className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={submitting || loading}
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-[#263126] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#374638] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 48 48"
              className="h-5 w-5 rounded-full bg-white p-0.5"
            >
              <path
                fill="#4285F4"
                d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z"
              />
              <path
                fill="#34A853"
                d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z"
              />
              <path
                fill="#FBBC05"
                d="M12.6 27.6a12 12 0 0 1 0-7.2v-5.3H5.8a20 20 0 0 0 0 17.8l6.8-5.3Z"
              />
              <path
                fill="#EA4335"
                d="M24 12c3 0 5.7 1 7.8 3.1l5.9-5.9A19.6 19.6 0 0 0 24 4 20 20 0 0 0 5.8 15.1l6.8 5.3C14.2 15.6 18.7 12 24 12Z"
              />
            </svg>
            {submitting ? "Connecting to Google..." : "Continue with Google"}
          </button>

          <div className="mt-7 flex items-center gap-3 text-xs text-[#85867c]">
            <span className="h-px flex-1 bg-[#ded9cd]" />
            <span>Secure sign-in powered by Firebase</span>
            <span className="h-px flex-1 bg-[#ded9cd]" />
          </div>
          <p className="mt-6 text-center text-xs leading-5 text-[#85867c]">
            By continuing, you agree to use Poodiest to share food and good
            ideas generously.
          </p>
        </div>
      </section>
    </div>
  );
}
