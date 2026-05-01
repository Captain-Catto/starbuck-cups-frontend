import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api-config";
import { getAdminForwardHeaders, handleAdminBackendResponse } from "@/lib/admin-api-helper";

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
          ...getAdminForwardHeaders(request),
        },
      }
    );

    const data = await handleAdminBackendResponse(response);
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to set default address" },
      { status: 500 }
    );
  }
}