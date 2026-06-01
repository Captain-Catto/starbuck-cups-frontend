import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/server-api";
import { getAdminForwardHeaders, handleAdminBackendResponse } from "@/lib/admin-api-helper";

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(getApiUrl("consultations/pending/count"), {
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
      { success: false, message: "Failed to fetch pending consultations count" },
      { status: 500 }
    );
  }
}
