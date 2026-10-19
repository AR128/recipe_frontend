/**
 * Extracts a clean, human-readable error message from an API error response.
 * Prevents the application from crashing and provides friendly feedback to users.
 */
export function getApiErrorMessage(
  err,
  fallback = "Something went wrong. Please try again."
) {
  if (!err) return fallback;

  if (typeof err === "string") return err;

  if (err.userMessage) return err.userMessage;

  // Backend returned a specific message in response data
  if (err.response?.data?.message && typeof err.response.data.message === "string") {
    return err.response.data.message;
  }

  if (err.response?.data?.error && typeof err.response.data.error === "string") {
    return err.response.data.error;
  }

  // HTTP status code fallbacks
  const status = err.response?.status;
  if (status === 400) return "Invalid request. Please check your input.";
  if (status === 401) return "Please log in to continue.";
  if (status === 403) return "You do not have permission to perform this action.";
  if (status === 404) return "The requested recipe or resource was not found.";
  if (status === 413) return "The uploaded file is too large.";
  if (status === 429) return "Too many requests. Please slow down and try again shortly.";
  if (status >= 500) return "Our kitchen servers are taking a brief break. Please try again in a moment.";

  // Network level errors
  if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
    return "Cannot reach the server. Please check your internet connection.";
  }

  if (err.message && typeof err.message === "string") {
    return err.message;
  }

  return fallback;
}

