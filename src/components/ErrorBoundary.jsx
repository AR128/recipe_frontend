import React from "react";
import { Link } from "react-router";

/**
 * Global React Error Boundary.
 * Catches unhandled rendering errors and renders a friendly fallback UI
 * instead of letting the entire website crash to a blank screen.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0a] text-neutral-900 dark:text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-amber-500/15 text-[#C9A96E] flex items-center justify-center text-4xl mb-6 shadow-md border border-amber-500/20">
            🍳
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold mb-3">
            Something went wrong
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md mb-8 leading-relaxed font-light">
            We ran into an unexpected kitchen glitch. Don't worry, your data and
            saved recipes are safe.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={this.handleReset}
              className="px-6 py-3 rounded-full bg-[#C9A96E] text-[#121210] font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-md"
            >
              Reload Homepage
            </button>
            <Link
              to="/recipes"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-6 py-3 rounded-full border border-neutral-300 dark:border-neutral-700 text-xs font-bold uppercase tracking-wider hover:bg-neutral-100 dark:hover:bg-white/5 transition-all"
            >
              Browse All Recipes
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

