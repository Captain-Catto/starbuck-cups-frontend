import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api-config";

function getAuthHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {};
  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    headers["authorization"] = authHeader;
  }
  return headers;
}

function validateColorBody(body: unknown): string | null {
  if (!body || typeof body !== "object") return "Dữ liệu không hợp lệ";
  const b = body as Record<string, unknown>;

  if (!b.name || typeof b.name !== "string" || !b.name.trim()) {
    return "Tên màu là bắt buộc";
  }
  if (b.name.length > 100) {
    return "Tên màu không được vượt quá 100 ký tự";
  }
  if (!b.hexCode || typeof b.hexCode !== "string") {
    return "Mã màu hex là bắt buộc";
  }
  if (!/^#[0-9A-Fa-f]{6}$/.test(b.hexCode)) {
    return "Mã màu phải có định dạng #RRGGBB";
  }
  if (b.isActive !== undefined && typeof b.isActive !== "boolean") {
    return "Trường isActive phải là boolean";
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = new URL(getApiUrl("admin/colors"));
    searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(request),
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch colors" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationError = validateColorBody(body);
    if (validationError) {
      return NextResponse.json(
        { success: false, message: validationError },
        { status: 400 }
      );
    }

    const response = await fetch(getApiUrl("admin/colors"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(request),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to create color" },
      { status: 500 }
    );
  }
}
