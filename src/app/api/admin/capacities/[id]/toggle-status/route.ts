import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/server-api";
import { getAdminForwardHeaders, handleAdminBackendResponse } from "@/lib/admin-api-helper";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await fetch(
      getApiUrl(`admin/capacities/${id}/toggle-status`),
      {
      cache: "no-store",
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAdminForwardHeaders(request),
        },
      }
    );

    const data = await handleAdminBackendResponse(response);

    if (data.success) {
      revalidateTag("capacities", "default");
    }

    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to toggle capacity status" },
      { status: 500 }
    );
  }
}