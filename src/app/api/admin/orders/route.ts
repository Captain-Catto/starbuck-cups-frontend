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

    console.log(`[DEBUG] Fetching orders with params: ${queryString}`);

    const response = await fetch(
      `${getApiUrl("admin/orders")}${queryString ? `?${queryString}` : ""}`,
      {
        method: "GET",
        headers: getAuthHeaders(request),
      }
    );

    const data = await response.json();

    console.log(`[DEBUG] Backend orders response:`, {
      status: response.status,
      success: data.success,
      dataCount: data.data?.orders?.length || 0,
    });

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Orders fetch error:", error);
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

    console.log(`[DEBUG] Creating order with data:`, body);

    const response = await fetch(getApiUrl("admin/orders"), {
      method: "POST",
      headers: getAuthHeaders(request),
      body: JSON.stringify(body),
    });

    const data = await response.json();

    console.log(`[DEBUG] Backend create order response:`, {
      status: response.status,
      success: data.success,
      orderId: data.data?.id,
    });

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create order" },
      { status: 500 }
    );
  }
}
