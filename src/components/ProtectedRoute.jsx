import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../context/useAuth";

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        className="flex min-h-[50vh] items-center justify-center"
        role="status"
        aria-label="Restoring your session"
      >
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-neutral-300 border-t-[#C9A96E] dark:border-neutral-700 dark:border-t-[#C9A96E]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/get-started" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
