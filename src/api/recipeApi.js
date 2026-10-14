import axios from 'axios';
import userApi from './axios';

const API_BASE_URL =
    import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

// Public API — no authentication required
export const publicApi = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    withCredentials: false,
});

// Authenticated recipe API
export const authRecipeApi = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    withCredentials: true,
});

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
        Authorization: token.startsWith('Bearer ')
            ? token
            : `Bearer ${token}`,
    };
};

// Add the current token to authenticated requests
authRecipeApi.interceptors.request.use((config) => {
    const token =
        userApi.defaults.headers?.common?.Authorization ||
        axios.defaults.headers?.common?.Authorization;

    if (token && !config.headers.Authorization) {
        config.headers.Authorization = token.startsWith('Bearer ')
            ? token
            : `Bearer ${token}`;
    }

    return config;
});

// Fetch published recipes
export const getRecipes = async ({
    search = '',
    category = '',
    page = 1,
    limit = 20,
    signal,
} = {}) => {
    const params = new URLSearchParams();

    if (search) {
        params.set('search', search);
    }

    if (category && category !== 'All') {
        params.set('category', category);
    }

    if (page > 1) {
        params.set('page', page);
    }

    if (limit !== 20) {
        params.set('limit', limit);
    }

    const response = await publicApi.get(
        `/recipes?${params.toString()}`,
        {
            signal,
        }
    );

    return response.data;
};

// Fetch one recipe by slug
export const getRecipe = async (slug) => {
    const response = await publicApi.get(
        `/recipes/${encodeURIComponent(slug)}`
    );

    return response.data;
};

// Fetch comments for a recipe
export const getComments = async (slug) => {
    const response = await publicApi.get(
        `/recipes/${encodeURIComponent(slug)}/comments`
    );

    return response.data;
};

// Fetch all recipe categories
export const getCategories = async () => {
    const response = await publicApi.get('/recipes/categories');

    return response.data;
};

// Search users by name or username
export const searchUsers = async (query) => {
    const response = await publicApi.get(
        `/user/search?q=${encodeURIComponent(query)}`
    );

    return response.data;
};

// Fetch a public user profile and published recipes
export const getPublicUserProfile = async (username) => {
    const response = await publicApi.get(
        `/user/public/${encodeURIComponent(username)}`
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
    const response = await authRecipeApi.post(
        '/recipes',
        recipeData,
        {
            headers: getAuthHeaders(accessToken),
        }
    );

    return response.data;
};

// Update an existing recipe post
export const updateRecipePost = async (
    id,
    recipeData,
    accessToken
) => {
    const response = await authRecipeApi.put(
        `/recipes/${id}`,
        recipeData,
        {
            headers: getAuthHeaders(accessToken),
        }
    );

    return response.data;
};

// Delete a recipe post
export const deleteRecipePost = async (id, accessToken) => {
    const response = await authRecipeApi.delete(
        `/recipes/${id}`,
        {
            headers: getAuthHeaders(accessToken),
        }
    );

    return response.data;
};

// Upload an image
export const uploadImage = async (imageData, accessToken) => {
    const response = await authRecipeApi.post(
        '/upload',
        { image: imageData },
        {
            headers: getAuthHeaders(accessToken),
        }
    );

    return response.data;
};

// Fetch posts created by the logged-in user
export const getMyPosts = async (accessToken) => {
    const response = await authRecipeApi.get(
        '/user/my-posts',
        {
            headers: getAuthHeaders(accessToken),
        }
    );

    return response.data;
};