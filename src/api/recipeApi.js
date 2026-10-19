import axios from "axios";
import userApi, { installAuthRefreshInterceptor } from "./axios";
import { API_BASE_URL } from "./apiBaseUrl";

// Public API — no authentication required
export const publicApi = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});
installAuthRefreshInterceptor(publicApi);

publicApi.interceptors.request.use((config) => {
  const token =
    userApi.defaults.headers?.common?.Authorization ||
    axios.defaults.headers?.common?.Authorization;

  if (token && !config.headers.Authorization) {
    config.headers.Authorization = token.startsWith("Bearer ")
      ? token
      : `Bearer ${token}`;
  }

  return config;
});

// Authenticated recipe API
export const authRecipeApi = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});
installAuthRefreshInterceptor(authRecipeApi);

// Format the Authorization header
const getAuthHeaders = (accessToken) => {
  const token =
    accessToken ||
    userApi.defaults.headers?.common?.Authorization ||
    axios.defaults.headers?.common?.Authorization;

  if (!token) {
    return {};
  }

  return {
    Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
  };
};

// Add the current token to authenticated requests
authRecipeApi.interceptors.request.use((config) => {
  const token =
    userApi.defaults.headers?.common?.Authorization ||
    axios.defaults.headers?.common?.Authorization;

  if (token && !config.headers.Authorization) {
    config.headers.Authorization = token.startsWith("Bearer ")
      ? token
      : `Bearer ${token}`;
  }

  return config;
});

// Fetch published recipes
export const getRecipes = async ({
  search = "",
  category = "",
  page = 1,
  limit = 12,
  signal,
} = {}) => {
  const params = new URLSearchParams();

  if (search) {
    params.set("search", search);
  }

  if (category && category !== "All") {
    params.set("category", category);
  }

  if (page > 1) {
    params.set("page", page);
  }

  if (limit !== 12) {
    params.set("limit", limit);
  }

  const response = await authRecipeApi.get(`/recipes?${params.toString()}`, {
    signal,
  });

  return response.data;
};

// Fetch top trending recipes ranked by saves from MongoDB
export const getTrendingRecipes = async (limit = 9, signal) => {
  const response = await publicApi.get(`/recipes/trending?limit=${limit}`, {
    signal,
  });
  return response.data;
};

// Fetch one recipe by slug
export const getRecipe = async (slug, signal) => {
  const response = await authRecipeApi.get(
    `/recipes/${encodeURIComponent(slug)}`,
    { signal }
  );

  return response.data;
};

// Fetch comments for a recipe
export const getComments = async (slug, page = 1) => {
  const response = await publicApi.get(
    `/recipes/${encodeURIComponent(slug)}/comments?page=${page}`
  );

  return response.data;
};

// Fetch all recipe categories
export const getCategories = async () => {
  const response = await publicApi.get("/recipes/categories");

  return response.data;
};

// Search users by name or username, with optional hasRecipes filter
export const searchUsers = async (params = "", signal) => {
  let query = "";
  let hasRecipes = false;
  let limit = 12;
  let page = 1;

  if (typeof params === "string") {
    query = params;
  } else if (params && typeof params === "object") {
    query = params.query || params.q || "";
    hasRecipes = !!params.hasRecipes;
    if (params.limit) limit = params.limit;
    if (params.page) page = params.page;
    if (params.signal) signal = params.signal;
  }

  const queryParams = new URLSearchParams();
  if (query) queryParams.set("q", query);
  if (hasRecipes) queryParams.set("hasRecipes", "true");
  if (limit) queryParams.set("limit", limit);
  if (page > 1) queryParams.set("page", page);

  const response = await authRecipeApi.get(
    `/user/search?${queryParams.toString()}`,
    { signal }
  );

  return response.data;
};

// Fetch a public user profile and published recipes
export const getPublicUserProfile = async (username, page = 1) => {
  const response = await authRecipeApi.get(
    `/user/public/${encodeURIComponent(username)}?page=${page}`
  );

  return response.data;
};

// Post a comment
export const postComment = async (slug, text, accessToken) => {
  const response = await authRecipeApi.post(
    `/recipes/${encodeURIComponent(slug)}/comments`,
    { text },
    {
      headers: getAuthHeaders(accessToken),
    }
  );

  return response.data;
};

// Create a new recipe post
export const createRecipePost = async (recipeData, accessToken) => {
  const response = await authRecipeApi.post("/recipes", recipeData, {
    headers: getAuthHeaders(accessToken),
  });

  return response.data;
};

// Update an existing recipe post
export const updateRecipePost = async (id, recipeData, accessToken) => {
  const response = await authRecipeApi.put(`/recipes/${id}`, recipeData, {
    headers: getAuthHeaders(accessToken),
  });

  return response.data;
};

// Delete a recipe post
export const deleteRecipePost = async (id, accessToken) => {
  const response = await authRecipeApi.delete(`/recipes/${id}`, {
    headers: getAuthHeaders(accessToken),
  });

  return response.data;
};

// Upload an image
export const uploadImage = async (imageData, accessToken) => {
  const response = await authRecipeApi.post(
    "/upload",
    { image: imageData },
    {
      headers: getAuthHeaders(accessToken),
    }
  );

  return response.data;
};

// Fetch posts created by the logged-in user
export const getMyPosts = async (accessToken, page = 1) => {
  const response = await authRecipeApi.get(`/user/my-posts?page=${page}`, {
    headers: getAuthHeaders(accessToken),
  });

  return response.data;
};

// Fetch saved recipes directly from MongoDB
export const getSavedRecipesFromDb = async (accessToken, page = 1) => {
  const response = await authRecipeApi.get(`/user/saved-recipes?page=${page}`, {
    headers: getAuthHeaders(accessToken),
  });

  return response.data;
};

// Toggle save recipe in MongoDB
export const toggleSaveRecipeInDb = async (idOrSlug, accessToken) => {
  const response = await authRecipeApi.post(
    `/user/saved-recipes/${encodeURIComponent(idOrSlug)}`,
    {},
    {
      headers: getAuthHeaders(accessToken),
    }
  );

  return response.data;
};

// Toggle a like stored on the recipe in MongoDB
export const toggleRecipeLikeInDb = async (slug, accessToken) => {
  const response = await authRecipeApi.post(
    `/recipes/${encodeURIComponent(slug)}/likes`,
    {},
    {
      headers: getAuthHeaders(accessToken),
    }
  );

  return response.data;
};
