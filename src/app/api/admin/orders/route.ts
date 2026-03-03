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

// GET /api/admin/orders - Get all orders with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();

    const response = await fetch(
      `${getApiUrl("admin/orders")}${queryString ? `?${queryString}` : ""}`,
      {
        method: "GET",
        headers: getAuthHeaders(request),
      }
    );

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST /api/admin/orders - Create a new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(getApiUrl("admin/orders"), {
      method: "POST",
      headers: getAuthHeaders(request),
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to create order" },
      { status: 500 }
    );
  }
}
