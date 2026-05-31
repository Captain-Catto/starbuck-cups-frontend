import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api-config";
import { getAdminForwardHeaders, handleAdminBackendResponse } from "@/lib/admin-api-helper";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();

    const backendFormData = new FormData();
    for (const [key, value] of formData.entries()) {
      backendFormData.append(key, value);
    }

    const response = await fetch(getApiUrl(`admin/products/${id}/upload`), {
      cache: "no-store",
      method: "PUT",
      headers: {
        // Don't set Content-Type — let fetch set it with boundary for FormData
        ...getAdminForwardHeaders(request),
      },
      body: backendFormData,
    });

    const data = await handleAdminBackendResponse(response);
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to upload and update product" },
      { status: 500 }
    );
  }
}
