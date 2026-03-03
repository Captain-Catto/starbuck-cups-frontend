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

// PATCH /api/admin/colors/[id]/toggle-status - Toggle color status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const response = await fetch(
      getApiUrl(`admin/colors/${id}/toggle-status`),
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(request),
        },
      }
    );

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Colors toggle status error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to toggle color status" },
      { status: 500 }
    );
  }
}
