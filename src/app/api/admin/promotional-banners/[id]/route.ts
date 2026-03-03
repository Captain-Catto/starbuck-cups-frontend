import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api-config";

// Helper function to forward auth headers
function getAuthHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {};

  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    headers["authorization"] = authHeader;
  }

  return headers;
}

/**
 * GET /api/admin/promotional-banners/[id]
 * Get promotional banner by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(getApiUrl(`promotional-banners/admin/${id}`));

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(request),
      },
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to fetch promotional banner",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Error fetching promotional banner:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/promotional-banners/[id]
 * Update promotional banner
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const url = new URL(getApiUrl(`promotional-banners/admin/${id}`));

    const response = await fetch(url.toString(), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(request),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to update promotional banner",
          errors: data.errors,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Error updating promotional banner:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/promotional-banners/[id]
 * Delete promotional banner
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(getApiUrl(`promotional-banners/admin/${id}`));

    const response = await fetch(url.toString(), {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(request),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to delete promotional banner",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Error deleting promotional banner:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
