import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api-config";

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
    const response = await fetch(getApiUrl("admin/orders/stats"), {
      method: "GET",
      headers: getAuthHeaders(request),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch order statistics" },
      { status: 500 }
    );
  }
}
