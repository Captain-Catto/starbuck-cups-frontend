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

// PUT /api/admin/customers/{customerId}/addresses/{addressId}/set-default - Set default address
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string; addressId: string }> }
) {
  try {
    const { customerId, addressId } = await params;

    const response = await fetch(
      getApiUrl(`admin/customers/${customerId}/addresses/${addressId}/set-default`),
      {
        method: "PUT",
        headers: {
          ...getAuthHeaders(request),
        },
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Set default address API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to set default address" },
      { status: 500 }
    );
  }
}