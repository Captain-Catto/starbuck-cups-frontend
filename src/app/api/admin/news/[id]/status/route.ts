import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api-config";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = request.headers.get("authorization");
    const cookie = request.headers.get("cookie");

    const response = await fetch(getApiUrl(`news/admin/${id}/status`), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(auth && { authorization: auth }),
        ...(cookie && { cookie }),
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to update news status" }, { status: 500 });
  }
}
