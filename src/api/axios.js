import axios from "axios";
import { auth } from "../firebase";
import { API_BASE_URL } from "./apiBaseUrl";

const authenticatedClients = new Set();

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/user`,
});

export const setAuthToken = (token) => {
  authenticatedClients.forEach((client) => {
    if (token) {
      client.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete client.defaults.headers.common.Authorization;
    }
  });
};

export const installAuthRefreshInterceptor = (client) => {
  authenticatedClients.add(client);
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const currentUser = auth.currentUser;

      if (
        error.response?.status !== 401 ||
        !originalRequest ||
        originalRequest._firebaseRetry ||
        !currentUser
      ) {
        return Promise.reject(error);
      }

      originalRequest._firebaseRetry = true;
      try {
        const refreshedToken = await currentUser.getIdToken(true);
        setAuthToken(refreshedToken);
        originalRequest.headers.Authorization = `Bearer ${refreshedToken}`;
        return client(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
  );
};

installAuthRefreshInterceptor(api);

export default api;
