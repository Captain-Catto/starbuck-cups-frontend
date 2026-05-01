import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api-config";
import { getAdminForwardHeaders, handleAdminBackendResponse } from "@/lib/admin-api-helper";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(getApiUrl("promotional-banners/admin"));

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAdminForwardHeaders(request),
      },
      cache: "no-store",
    });

    const data = await handleAdminBackendResponse(response);
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: "Dữ liệu không hợp lệ" },
        { status: 400 }
      );
    }

    const url = new URL(getApiUrl("promotional-banners/admin"));

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAdminForwardHeaders(request),
      },
      body: JSON.stringify(body),
    });

    const data = await handleAdminBackendResponse(response);
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
