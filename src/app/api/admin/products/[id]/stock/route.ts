import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/server-api";
import { getAdminForwardHeaders, handleAdminBackendResponse } from "@/lib/admin-api-helper";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ success: false, message: "Dữ liệu không hợp lệ" }, { status: 400 });
    }
    const b = body as Record<string, unknown>;
    if (typeof b.stockQuantity !== "number" || b.stockQuantity < 0) {
      return NextResponse.json({ success: false, message: "Số lượng tồn kho không hợp lệ" }, { status: 400 });
    }

    const response = await fetch(getApiUrl(`admin/products/${id}/stock`), {
      cache: "no-store",
      method: "PATCH",
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
      { success: false, message: "Failed to update product stock" },
      { status: 500 }
    );
  }
}
