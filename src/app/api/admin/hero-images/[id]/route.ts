import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api-config";

// Helper function to forward auth headers
function getAuthHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {};

  // Forward authorization header from client request
  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    headers["authorization"] = authHeader;
  }

  return headers;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await fetch(getApiUrl(`admin/hero-images/${id}`), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(request),
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Get hero image API error:", error);
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
        ...getAuthHeaders(request),
        // Don't set Content-Type for FormData
      };
    } else {
      // Regular JSON update
      body = JSON.stringify(await request.json());
      headers = {
        "Content-Type": "application/json",
        ...getAuthHeaders(request),
      };
    }

    const response = await fetch(getApiUrl(`admin/hero-images/${id}`), {
      method: "PUT",
      headers,
      body,
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Update hero image API error:", error);
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
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(request),
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Delete hero image API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete hero image" },
      { status: 500 }
    );
  }
}