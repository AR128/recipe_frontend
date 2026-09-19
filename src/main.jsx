import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router";
import "./index.css";
import App from "./App.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import RecipeFeed from "./pages/RecipeFeed.jsx";
import RecipeDetail from "./pages/RecipeDetail.jsx";
import Account from "./pages/Account.jsx";
import Settings from "./pages/Settings.jsx";
import CreatePost from "./pages/CreatePost.jsx";
import UserProfile from "./pages/UserProfile.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

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
        path: "/user/:username",
        element: <UserProfile />,
      },
      {
        path: "/profile/:username",
        element: <UserProfile />,
      },

      {
        path: "/settings",
        element: <Settings />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/signup",
        element: <Signup />,
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
      <RouterProvider router={router} />
    </AuthProvider>
  </ThemeProvider>
);
