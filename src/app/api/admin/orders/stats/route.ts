import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

// Helper function to forward auth headers
function getAuthHeaders(request: NextRequest): Record<string, string> {
  const authHeader = request.headers.get("authorization");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (authHeader) {
    headers.Authorization = authHeader;
  }
  return headers;
}

// GET /api/admin/orders/stats - Get order statistics
export async function GET(request: NextRequest) {
  try {
    console.log(`[DEBUG] Fetching order statistics`);

    const response = await fetch(`${BACKEND_URL}/api/admin/orders/stats`, {
      method: "GET",
      headers: getAuthHeaders(request),
    });

    const data = await response.json();

    console.log(`[DEBUG] Backend order stats response:`, {
      status: response.status,
      success: data.success,
    });

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Order stats fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch order statistics" },
      { status: 500 }
    );
  }
}
