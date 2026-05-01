import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api-config";
import { getAdminForwardHeaders, handleAdminBackendResponse } from "@/lib/admin-api-helper";

// PUT /api/admin/customers/{customerId}/addresses/{addressId} - Update address
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string; addressId: string }> }
) {
  try {
    const { customerId, addressId } = await params;
    const body = await request.json();

    const response = await fetch(
      getApiUrl(`admin/customers/${customerId}/addresses/${addressId}`),
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAdminForwardHeaders(request),
        },
        body: JSON.stringify(body),
      }
    );

    const data = await handleAdminBackendResponse(response);
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to update address" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/customers/{customerId}/addresses/{addressId} - Delete address
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string; addressId: string }> }
) {
  try {
    const { customerId, addressId } = await params;

    const response = await fetch(
      getApiUrl(`admin/customers/${customerId}/addresses/${addressId}`),
      {
        method: "DELETE",
        headers: {
          ...getAdminForwardHeaders(request),
        },
      }
    );

    const data = await handleAdminBackendResponse(response);
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to delete address" },
      { status: 500 }
    );
  }
}