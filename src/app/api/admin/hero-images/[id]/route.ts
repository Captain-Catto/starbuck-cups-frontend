import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api-config";
import { getAdminForwardHeaders, handleAdminBackendResponse } from "@/lib/admin-api-helper";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await fetch(getApiUrl(`admin/hero-images/${id}`), {
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
      { success: false, message: "Failed to fetch hero image" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // For file uploads, we need to check if it's FormData or JSON
    const contentType = request.headers.get("content-type");
    let body;
    let headers;

    if (contentType?.includes("multipart/form-data")) {
      // File upload
      body = await request.formData();
      headers = {
        ...getAdminForwardHeaders(request),
        // Don't set Content-Type for FormData
      };
    } else {
      // Regular JSON update
      body = JSON.stringify(await request.json());
      headers = {
        "Content-Type": "application/json",
        ...getAdminForwardHeaders(request),
      };
    }

    const response = await fetch(getApiUrl(`admin/hero-images/${id}`), {
      cache: "no-store",
      method: "PUT",
      headers,
      body,
    });

    const data = await handleAdminBackendResponse(response);

    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to update hero image" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await fetch(getApiUrl(`admin/hero-images/${id}`), {
      cache: "no-store",
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
      { success: false, message: "Failed to delete hero image" },
      { status: 500 }
    );
  }
}