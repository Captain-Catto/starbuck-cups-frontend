const ADMIN_TOKEN_STORAGE_KEY = "admin_token";

/**
 * Current admin access token, read at call time.
 *
 * Data hooks used to take the token from Redux and list it in their hook dependencies, so every
 * silent token refresh re-created their fetch callbacks and re-ran their load effects (the page
 * loaded its data again). localStorage always holds the latest token, whoever refreshed it.
 */
export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function getAdminAuthHeaders(): Record<string, string> {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
