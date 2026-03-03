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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = new URL(getApiUrl("admin/hero-images"));

    // Forward all query parameters
    searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(request),
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch hero images" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // For file uploads, we need to pass the FormData directly
    const formData = await request.formData();

    const response = await fetch(getApiUrl("admin/hero-images"), {
      method: "POST",
      headers: {
        ...getAuthHeaders(request),
        // Don't set Content-Type for FormData - browser will set it with boundary
      },
      body: formData,
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to create hero image" },
      { status: 500 }
    );
  }
}
