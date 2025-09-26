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

// GET /api/admin/customers/{customerId}/addresses - Get all addresses for a customer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params;

    const response = await fetch(
      getApiUrl(`admin/customers/${customerId}/addresses`),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(request),
        },
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Get customer addresses API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch customer addresses" },
      { status: 500 }
    );
  }
}

// POST /api/admin/customers/{customerId}/addresses - Add new address for customer
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params;
    const body = await request.json();

    const response = await fetch(
      getApiUrl(`admin/customers/${customerId}/addresses`),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(request),
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Add customer address API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add customer address" },
      { status: 500 }
    );
  }
}