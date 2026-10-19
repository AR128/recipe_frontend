import { createRoot } from "react-dom/client";
import { Navigate, RouterProvider, createBrowserRouter } from "react-router";
import "./index.css";
import App from "./App.jsx";
import GetStarted from "./pages/GetStarted.jsx";
import RecipeFeed from "./pages/RecipeFeed.jsx";
import AllRecipes from "./pages/AllRecipes.jsx";
import RecipeDetail from "./pages/RecipeDetail.jsx";
import Account from "./pages/Account.jsx";
import Settings from "./pages/Settings.jsx";
import CreatePost from "./pages/CreatePost.jsx";
import UserProfile from "./pages/UserProfile.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { ToastProvider } from "./components/Toast.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <RecipeFeed />,
      },
      {
        path: "/recipe/:slug",
        element: <RecipeDetail />,
      },
      {
        path: "/recipes/:slug",
        element: <RecipeDetail />,
      },
      {
        path: "/get-started",
        element: <GetStarted />,
      },
      {
        path: "/login",
        element: <Navigate to="/get-started" replace />,
      },
      {
        path: "/signup",
        element: <Navigate to="/get-started" replace />,
      },
      {
        path: "/recipes",
        element: <AllRecipes />,
      },
      {
        path: "/user/:username",
        element: <UserProfile />,
      },
      {
        path: "/profile/:username",
        element: <UserProfile />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/account",
            element: <Account />,
          },
          {
            path: "/create-post",
            element: <CreatePost />,
          },
          {
            path: "/settings",
            element: <Settings />,
          },
        ],
      },
      {
        path: "*",
        element: <RecipeFeed />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <AuthProvider>
      <ErrorBoundary>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </ErrorBoundary>
    </AuthProvider>
  </ThemeProvider>
);
