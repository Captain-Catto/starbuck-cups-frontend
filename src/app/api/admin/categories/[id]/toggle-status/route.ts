import { revalidateTag, revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api-config";
import { getAdminForwardHeaders, handleAdminBackendResponse } from "@/lib/admin-api-helper";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await fetch(
      getApiUrl(`admin/categories/${id}/toggle-status`),
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAdminForwardHeaders(request),
        },
      }
    );

    const data = await handleAdminBackendResponse(response);

    if (data.success) {
      revalidateTag("categories", "default");
      revalidatePath("/[locale]/category/[slug]", "page");
    }

    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to toggle category status" },
      { status: 500 }
    );
  }
}