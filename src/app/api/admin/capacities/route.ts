import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/server-api";
import { getAdminForwardHeaders, handleAdminBackendResponse } from "@/lib/admin-api-helper";

function validateCapacityBody(body: unknown): string | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return "Dữ liệu không hợp lệ";
  const b = body as Record<string, unknown>;

  if (!b.name || typeof b.name !== "string" || !b.name.trim()) {
    return "Tên dung tích là bắt buộc";
  }
  if (b.name.length > 100) {
    return "Tên dung tích không được vượt quá 100 ký tự";
  }
  if (b.volumeMl === undefined || b.volumeMl === null) {
    return "Dung tích (volumeMl) là bắt buộc";
  }
  if (typeof b.volumeMl !== "number" || b.volumeMl <= 0) {
    return "Dung tích phải là số lớn hơn 0";
  }
  if (b.volumeMl > 10000) {
    return "Dung tích không được vượt quá 10,000ml";
  }
  if (b.isActive !== undefined && typeof b.isActive !== "boolean") {
    return "Trường isActive phải là boolean";
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = new URL(getApiUrl("admin/capacities"));
    searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString(), {
      cache: "no-store",
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
      { success: false, message: "Failed to fetch capacities" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationError = validateCapacityBody(body);
    if (validationError) {
      return NextResponse.json(
        { success: false, message: validationError },
        { status: 400 }
      );
    }

    const response = await fetch(getApiUrl("admin/capacities"), {
      cache: "no-store",
      method: "POST",
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
      { success: false, message: "Failed to create capacity" },
      { status: 500 }
    );
  }
}
