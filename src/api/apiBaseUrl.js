const configuredBaseUrl = import.meta.env.VITE_BACKEND_URL?.trim();

if (import.meta.env.PROD && !configuredBaseUrl) {
  throw new Error(
    "VITE_BACKEND_URL must be set to the deployed backend URL for production builds."
  );
}

const backendUrl = configuredBaseUrl || "http://localhost:3000";
const parsedBackendUrl = new URL(backendUrl);
const isLocalBackend = ["localhost", "127.0.0.1", "[::1]"].includes(
  parsedBackendUrl.hostname
);

if (
  !["http:", "https:"].includes(parsedBackendUrl.protocol) ||
  parsedBackendUrl.pathname !== "/" ||
  parsedBackendUrl.username ||
  parsedBackendUrl.password ||
  parsedBackendUrl.search ||
  parsedBackendUrl.hash ||
  (import.meta.env.PROD &&
    parsedBackendUrl.protocol !== "https:" &&
    !isLocalBackend)
) {
  throw new Error(
    "VITE_BACKEND_URL must be an HTTP(S) origin without an /api path; public production APIs must use HTTPS."
  );
}

export const API_BASE_URL = backendUrl.replace(/\/+$/, "");
