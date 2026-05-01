import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api-config";
import { getAdminForwardHeaders, handleAdminBackendResponse } from "@/lib/admin-api-helper";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params;

    const response = await fetch(getApiUrl(`admin/customers/${customerId}`), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAdminForwardHeaders(request),
      },
    });

    const data = await handleAdminBackendResponse(response);
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch customer" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params;
    const body = await request.json();

    const response = await fetch(getApiUrl(`admin/customers/${customerId}`), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAdminForwardHeaders(request),
      },
      body: JSON.stringify(body),
    });

    const data = await handleAdminBackendResponse(response);
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to update customer" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params;

    const response = await fetch(getApiUrl(`admin/customers/${customerId}`), {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...getAdminForwardHeaders(request),
      },
    });

    const data = await handleAdminBackendResponse(response);
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to delete customer" },
      { status: 500 }
    );
  }
}
