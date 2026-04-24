import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api-config";

function getAuthHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {};
  const auth = request.headers.get("authorization");
  const cookie = request.headers.get("cookie");
  if (auth) headers["authorization"] = auth;
  if (cookie) headers["cookie"] = cookie;
  return headers;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(getApiUrl("news/admin"));
    request.nextUrl.searchParams.forEach((v, k) => url.searchParams.append(k, v));

    const response = await fetch(url.toString(), {
      headers: { "Content-Type": "application/json", ...getAuthHeaders(request) },
    });

    const data = await response.json();
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
      headers: { "Content-Type": "application/json", ...getAuthHeaders(request) },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to create news" }, { status: 500 });
  }
}
