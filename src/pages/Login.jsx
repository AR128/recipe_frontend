import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import loginImg from "../assets/Login-image.avif";
import { useAuth } from "../context/useAuth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate(location.state?.from || "/", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen md:h-screen flex flex-col md:flex-row bg-white dark:bg-[#0a0a0a] font-sans text-neutral-900 dark:text-white md:overflow-hidden transition-colors duration-200">
      {/* IMAGE SIDE (Left) */}
      <div className="w-full md:w-1/2 h-40 sm:h-52 md:h-screen relative shrink-0">
        <img
          src={loginImg}
          alt="Login background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/5 pointer-events-none" />
      </div>

      {/* FORM SIDE (Right) */}
      <div className="w-full md:w-1/2 flex-1 md:h-screen overflow-y-auto flex items-center justify-center p-6 md:p-12 lg:p-16">
        <div className="w-full max-w-sm m-auto">
          <Link
            to="/"
            className="font-serif text-3xl font-bold text-black dark:text-white tracking-tight block mb-10 hover:opacity-70 transition-opacity"
          >
            Poodiest.
          </Link>

          <h1 className="font-serif text-4xl text-black dark:text-white mb-2 transition-colors">
            Welcome back.
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-10 transition-colors">
            Sign in to access your saved recipes and curated collections.
          </p>

          {error && (
            <div className="mb-6 p-3 bg-neutral-100 dark:bg-neutral-800 border-l-4 border-black dark:border-white text-black dark:text-white text-sm transition-colors">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-neutral-900 dark:text-neutral-300 mb-2 transition-colors">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-700 rounded-none bg-transparent text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-colors"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-neutral-900 dark:text-neutral-300 mb-2 transition-colors">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-700 rounded-none bg-transparent text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-colors"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black dark:bg-white text-white dark:text-black py-3.5 mt-4 text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Log in"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-neutral-500 dark:text-neutral-400 pb-8 md:pb-0 transition-colors">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-black dark:text-white font-medium hover:underline transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
