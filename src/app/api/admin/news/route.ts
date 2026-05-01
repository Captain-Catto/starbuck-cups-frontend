import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api-config";
import { getAdminForwardHeaders, handleAdminBackendResponse } from "@/lib/admin-api-helper";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(getApiUrl("news/admin"));
    request.nextUrl.searchParams.forEach((v, k) => url.searchParams.append(k, v));

    const response = await fetch(url.toString(), {
      headers: { "Content-Type": "application/json", ...getAdminForwardHeaders(request) },
    });

    const data = await handleAdminBackendResponse(response);
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to fetch news" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(getApiUrl("news/admin"), {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAdminForwardHeaders(request) },
      body: JSON.stringify(body),
    });

    const data = await handleAdminBackendResponse(response);
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to create news" }, { status: 500 });
  }
}
