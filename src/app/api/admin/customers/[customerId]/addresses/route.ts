import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api-config";
import { getAdminForwardHeaders, handleAdminBackendResponse } from "@/lib/admin-api-helper";

function validateAddressBody(body: unknown): string | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return "Dữ liệu không hợp lệ";
  const b = body as Record<string, unknown>;
  if (!b.addressLine || typeof b.addressLine !== "string" || !b.addressLine.trim()) return "Địa chỉ là bắt buộc";
  if (!b.city || typeof b.city !== "string" || !b.city.trim()) return "Thành phố là bắt buộc";
  return null;
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
      cache: "no-store",
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

    const validationError = validateAddressBody(body);
    if (validationError) {
      return NextResponse.json({ success: false, message: validationError }, { status: 400 });
    }

    const response = await fetch(
      getApiUrl(`admin/customers/${customerId}/addresses`),
      {
      cache: "no-store",
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