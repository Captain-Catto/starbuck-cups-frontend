// JWT token utilities
export interface JWTPayload {
  id: string;
  email: string;
  name: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Decode JWT token without verification (client-side only)
 * Note: This is for reading token data, not for security verification
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    // JWT has 3 parts separated by dots: header.payload.signature
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];

    // Add padding if needed for base64 decoding
    const paddedPayload = payload + "=".repeat((4 - (payload.length % 4)) % 4);

    // Decode base64
    const decodedPayload = atob(paddedPayload);

    // Parse JSON
    const data = JSON.parse(decodedPayload) as JWTPayload;

    return data;
  } catch (error) {

    return null;
  }
}

/**
 * Check if JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return true;
  }

  // exp is in seconds, Date.now() is in milliseconds
  return payload.exp * 1000 < Date.now();
}

/**
 * Get user info from JWT token
 */
export function getUserFromToken(
  token: string
): { id: string; email: string; name: string; role: string } | null {
  const payload = decodeJWT(token);
  if (!payload) {
    return null;
  }

  return {
    id: payload.id,
    email: payload.email,
    name: payload.name,
    role: payload.role,
  };
}
