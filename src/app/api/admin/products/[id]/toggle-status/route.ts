import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api-config";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const response = await fetch(
      getApiUrl(`admin/products/${id}/toggle-status`),
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(request.headers.get("authorization") && {
            authorization: request.headers.get("authorization") as string,
          }),
          ...(request.headers.get("cookie") && {
            cookie: request.headers.get("cookie") as string,
          }),
        },
      }
    );

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Toggle product status API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to toggle product status" },
      { status: 500 }
    );
  }
}
