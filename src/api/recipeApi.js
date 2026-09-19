import axios from 'axios';
import userApi from './axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

// Public API — no auth required (direct base URL)
export const publicApi = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    withCredentials: false,
});

// Authenticated recipe API — carries auth header for protected endpoints
export const authRecipeApi = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    withCredentials: true,
});

// Helper to format auth header
const getAuthHeaders = (accessToken) => {
    const token = accessToken || userApi.defaults.headers?.common?.['Authorization'] || axios.defaults.headers?.common?.['Authorization'];
    if (!token) return {};
    return {
        Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
    };
};

// Intercept to inject current Authorization header
authRecipeApi.interceptors.request.use((config) => {
    const token = userApi.defaults.headers?.common?.['Authorization'] || axios.defaults.headers?.common?.['Authorization'];
    if (token && !config.headers['Authorization']) {
        config.headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }
    return config;
});

// Fetch published recipes with optional search query
export const getRecipes = async ({ search = '', category = '', page = 1, limit = 20 } = {}) => {
    const params = new URLSearchParams();
    if (search)   params.set('search', search);
    if (category && category !== 'All') params.set('category', category);
    if (page > 1) params.set('page', page);
    if (limit !== 20) params.set('limit', limit);

    const response = await publicApi.get(`/recipes?${params.toString()}`);
    return response.data;
};

// Fetch single recipe by slug
export const getRecipe = async (slug) => {
    const response = await publicApi.get(`/recipes/${encodeURIComponent(slug)}`);
    return response.data;
};

// Fetch comments for a recipe
export const getComments = async (slug) => {
    const response = await publicApi.get(`/recipes/${encodeURIComponent(slug)}/comments`);
    return response.data;
};

// Fetch all unique categories
export const getCategories = async () => {
    const response = await publicApi.get('/recipes/categories');
    return response.data;
};

// Search users by name or username
export const searchUsers = async (query) => {
    const response = await publicApi.get(`/user/search?q=${encodeURIComponent(query)}`);
    return response.data;
};

// Fetch public user profile and their published recipes
export const getPublicUserProfile = async (username) => {
    const response = await publicApi.get(`/user/public/${encodeURIComponent(username)}`);
    return response.data;
};

// Post a comment (authenticated) — carries auth header
export const postComment = async (slug, text, accessToken) => {
    const response = await authRecipeApi.post(
        `/recipes/${encodeURIComponent(slug)}/comments`,
        { text },
        { headers: getAuthHeaders(accessToken) }
    );
    return response.data;
};

// Create a new recipe post (authenticated)
export const createRecipePost = async (recipeData, accessToken) => {
    const response = await authRecipeApi.post(
        '/recipes',
        recipeData,
        { headers: getAuthHeaders(accessToken) }
    );
    return response.data;
};

// Update an existing recipe post (authenticated)
export const updateRecipePost = async (id, recipeData, accessToken) => {
    const response = await authRecipeApi.put(
        `/recipes/${id}`,
        recipeData,
        { headers: getAuthHeaders(accessToken) }
    );
    return response.data;
};

// Delete a recipe post (authenticated)
export const deleteRecipePost = async (id, accessToken) => {
    const response = await authRecipeApi.delete(
        `/recipes/${id}`,
        { headers: getAuthHeaders(accessToken) }
    );
    return response.data;
};

// Upload image to Cloudinary via backend endpoint
export const uploadImage = async (imageData, accessToken) => {
    const response = await authRecipeApi.post(
        '/upload',
        { image: imageData },
        { headers: getAuthHeaders(accessToken) }
    );
    return response.data;
};

// Fetch posts authored by current logged-in user (authenticated)
export const getMyPosts = async (accessToken) => {
    const response = await authRecipeApi.get(
        '/user/my-posts',
        { headers: getAuthHeaders(accessToken) }
    );
    return response.data;
};

