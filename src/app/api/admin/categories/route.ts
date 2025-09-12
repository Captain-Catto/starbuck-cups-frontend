import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

// Helper function to get auth headers from cookies
function getAuthHeaders(request: NextRequest): Record<string, string> {
  const accessToken = request.cookies.get("admin_access_token")?.value;
  const headers: Record<string, string> = {};

  if (accessToken) {
    headers["authorization"] = `Bearer ${accessToken}`;
  }

  return headers;
}

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/admin/categories`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(request),
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Categories API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
