/**
 * API configuration helper
 */
export const getApiUrl = (endpoint: string) => {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://api-starbuck-cups.lequangtridat.com/api";
  // Remove leading slash from endpoint if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return `${baseUrl}/${cleanEndpoint}`;
};

export const getBackendUrl = () => {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://api-starbuck-cups.lequangtridat.com/api";
  // Remove /api suffix to get backend base URL
  return apiUrl.replace("/api", "");
};
