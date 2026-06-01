import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/server-api";
import { getAdminForwardHeaders, handleAdminBackendResponse } from "@/lib/admin-api-helper";

function validateProductBody(body: unknown): string | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return "Dữ liệu không hợp lệ";
  const b = body as Record<string, unknown>;
  if (!b.name || typeof b.name !== "string" || !b.name.trim()) return "Tên sản phẩm là bắt buộc";
  if (b.categoryIds !== undefined && !Array.isArray(b.categoryIds)) return "Danh mục không hợp lệ";
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(getApiUrl("admin/products"));
    request.nextUrl.searchParams.forEach((value, key) => {
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
      { success: false, message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationError = validateProductBody(body);
    if (validationError) {
      return NextResponse.json({ success: false, message: validationError }, { status: 400 });
    }

    const response = await fetch(getApiUrl("admin/products"), {
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
      { success: false, message: "Failed to create product" },
      { status: 500 }
    );
  }
}
