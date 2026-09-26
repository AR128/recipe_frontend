import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

// Authenticated user API — points to user endpoints
const api = axios.create({
    baseURL: `${API_BASE_URL}/api/user`,
    withCredentials: true, // Sends the httpOnly refresh token cookie automatically
});

export const setAuthToken = (token) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Response interceptor — automatically refresh the access token on 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const url = originalRequest?.url || '';
        const isAuthEndpoint =
            url === '/login' ||
            url === '/signup' ||
            url === '/refresh' ||
            url === '/logout';

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers['Authorization'] = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const response = await axios.post(
                    `${API_BASE_URL}/api/user/refresh`,
                    {},
                    { withCredentials: true }
                );
                const newAccessToken = response.data.accessToken;
                setAuthToken(newAccessToken);
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                processQueue(null, newAccessToken);
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                setAuthToken(null);
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
