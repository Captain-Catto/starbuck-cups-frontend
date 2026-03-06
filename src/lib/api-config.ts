/**
 * API configuration helper
 */
const DEFAULT_API_URL =
  process.env.NODE_ENV === "production"
    ? "https://api.hasron.vn/api"
    : "http://localhost:8080/api";

export const getApiUrl = (endpoint: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;
  // Remove leading slash from endpoint if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return `${baseUrl}/${cleanEndpoint}`;
};

export const getBackendUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;
  // Remove trailing /api suffix only to get backend base URL
  return apiUrl.replace(/\/api\/?$/, "");
};
