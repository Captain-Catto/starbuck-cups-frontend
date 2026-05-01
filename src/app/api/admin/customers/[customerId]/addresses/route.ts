import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api-config";
import { getAdminForwardHeaders, handleAdminBackendResponse } from "@/lib/admin-api-helper";

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
          ...getAdminForwardHeaders(request),
        },
      }
    );

    const data = await handleAdminBackendResponse(response);
    return NextResponse.json(data, { status: response.status });
  } catch {
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
          ...getAdminForwardHeaders(request),
        },
        body: JSON.stringify(body),
      }
    );

    const data = await handleAdminBackendResponse(response);
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to add customer address" },
      { status: 500 }
    );
  }
}