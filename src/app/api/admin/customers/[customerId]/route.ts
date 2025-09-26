import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api-config";

// Helper function to forward auth headers
function getAuthHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {};

  // Forward authorization header from client request
  const authHeader = request.headers.get("authorization");
  console.log("API Route - Received auth header:", authHeader);

  if (authHeader) {
    headers["authorization"] = authHeader;
    console.log("API Route - Forwarding auth header to backend");
  } else {
    console.warn("API Route - No authorization header received from client");
  }

  return headers;
}

// GET /api/admin/customers/{customerId} - Get single customer by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params;
    const authHeaders = getAuthHeaders(request);

    console.log(
      "API Route - Calling backend with URL:",
      getApiUrl(`admin/customers/${customerId}`)
    );
    console.log("API Route - Headers being sent:", authHeaders);

    const response = await fetch(
      getApiUrl(`admin/customers/${customerId}`),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
      }
    );

    const data = await response.json();
    console.log("API Route - Backend response status:", response.status);
    console.log("API Route - Backend response data:", data);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Get customer API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch customer" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/customers/{customerId} - Update customer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params;
    const body = await request.json();

    const response = await fetch(
      getApiUrl(`admin/customers/${customerId}`),
      {
        method: "PUT",
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
    console.error("Update customer API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update customer" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/customers/{customerId} - Delete customer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params;

    const response = await fetch(
      getApiUrl(`admin/customers/${customerId}`),
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(request),
        },
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Delete customer API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete customer" },
      { status: 500 }
    );
  }
}
