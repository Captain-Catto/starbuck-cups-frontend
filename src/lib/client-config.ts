const DEFAULT_BACKEND_URL =
  process.env.NODE_ENV === "production"
    ? "https://api.hasron.vn"
    : "http://localhost:8080";

export function getSocketBackendUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return DEFAULT_BACKEND_URL;
  return apiUrl.replace(/\/api\/?$/, "");
}

