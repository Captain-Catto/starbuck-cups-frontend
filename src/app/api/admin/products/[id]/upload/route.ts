import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api-config";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get the form data from the request
    const formData = await request.formData();

    // Create a new FormData object to forward to the backend
    const backendFormData = new FormData();

    // Copy all form data entries to the backend FormData
    for (const [key, value] of formData.entries()) {
      backendFormData.append(key, value);
    }

    const response = await fetch(getApiUrl(`admin/products/${id}/upload`), {
      method: "PUT",
      headers: {
        ...(request.headers.get("authorization") && {
          authorization: request.headers.get("authorization") as string,
        }),
        ...(request.headers.get("cookie") && {
          cookie: request.headers.get("cookie") as string,
        }),
        // Don't set Content-Type, let fetch set it with boundary for FormData
      },
      body: backendFormData,
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Upload product API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to upload and update product" },
      { status: 500 }
    );
  }
}