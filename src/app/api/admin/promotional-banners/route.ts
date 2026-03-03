import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api-config";

// Helper function to forward auth headers
function getAuthHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {};

  // Forward authorization header from client request
  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    headers["authorization"] = authHeader;
  }

  return headers;
}

/**
 * GET /api/admin/promotional-banners
 * Get all promotional banners (admin)
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(getApiUrl("promotional-banners/admin"));

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(request),
      },
      cache: "no-store", // Don't cache admin requests
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to fetch promotional banners",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/promotional-banners
 * Create new promotional banner
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = new URL(getApiUrl("promotional-banners/admin"));

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(request),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to create promotional banner",
          errors: data.errors,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
