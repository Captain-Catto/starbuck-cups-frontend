import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/server-api";
import { getAdminForwardHeaders, handleAdminBackendResponse } from "@/lib/admin-api-helper";

function validateCategoryBody(body: unknown): string | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return "Dữ liệu không hợp lệ";
  const b = body as Record<string, unknown>;

  if (!b.name || typeof b.name !== "string" || !b.name.trim()) {
    return "Tên danh mục là bắt buộc";
  }
  if (b.name.length > 100) {
    return "Tên danh mục không được vượt quá 100 ký tự";
  }
  if (b.description !== undefined && b.description !== null) {
    if (typeof b.description !== "string") return "Mô tả phải là chuỗi ký tự";
    if (b.description.length > 1500) return "Mô tả không được vượt quá 1500 ký tự";
  }
  if (b.isActive !== undefined && typeof b.isActive !== "boolean") {
    return "Trường isActive phải là boolean";
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = new URL(getApiUrl("admin/categories"));
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
      { success: false, message: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationError = validateCategoryBody(body);
    if (validationError) {
      return NextResponse.json(
        { success: false, message: validationError },
        { status: 400 }
      );
    }

    const response = await fetch(getApiUrl("admin/categories"), {
      cache: "no-store",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAdminForwardHeaders(request),
      },
      body: JSON.stringify(body),
    });

    const data = await handleAdminBackendResponse(response);

    if (data.success) {
      revalidateTag("categories", "default");
    }

    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to create category" },
      { status: 500 }
    );
  }
}
