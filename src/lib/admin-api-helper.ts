import { NextRequest } from "next/server";

/**
 * Forward necessary headers from Next.js request to Backend.
 */
export function getAdminForwardHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {};
  
  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    headers["authorization"] = authHeader;
  }

  // Forward IP address if available
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    headers["x-forwarded-for"] = forwardedFor;
  }

  // Forward User Agent
  const userAgent = request.headers.get("user-agent");
  if (userAgent) {
    headers["user-agent"] = userAgent;
  }

  return headers;
}

/**
 * Robust handling of Backend responses to prevent JSON parsing errors
 * and forward the exact HTTP status codes to the frontend.
 * Returns the parsed data object.
 */
export async function handleAdminBackendResponse(response: Response) {
  let data;
  const contentType = response.headers.get("content-type");
  
  try {
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      // If it's not JSON (e.g. 502 Bad Gateway HTML), read as text
      const text = await response.text();
      data = {
        success: false,
        message: response.ok ? "Success but no JSON returned" : "Backend returned non-JSON response",
        raw: text.substring(0, 500) // limit size to avoid huge payloads
      };
    }
  } catch (e) {
    data = {
      success: false,
      message: "Error parsing backend response",
      error: e instanceof Error ? e.message : String(e)
    };
  }

  return data;
}
