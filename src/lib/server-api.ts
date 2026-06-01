const DEFAULT_API_URL =
  process.env.NODE_ENV === "production"
    ? "https://api.hasron.vn/api"
    : "http://localhost:8080/api";

export const getApiUrl = (endpoint: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  if (!cleanEndpoint) return baseUrl;
  return `${baseUrl}/${cleanEndpoint}`;
};
