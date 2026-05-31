import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api-config";
import { getAdminForwardHeaders, handleAdminBackendResponse } from "@/lib/admin-api-helper";

function validateNewsBody(body: unknown): string | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return "Dữ liệu không hợp lệ";
  const b = body as Record<string, unknown>;
  if (!b.title || typeof b.title !== "string" || !b.title.trim()) return "Tiêu đề bài viết là bắt buộc";
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(getApiUrl("news/admin"));
    request.nextUrl.searchParams.forEach((v, k) => url.searchParams.append(k, v));

    const response = await fetch(url.toString(), {
      cache: "no-store",
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

    const validationError = validateNewsBody(body);
    if (validationError) {
      return NextResponse.json({ success: false, message: validationError }, { status: 400 });
    }

    const response = await fetch(getApiUrl("news/admin"), {
      cache: "no-store",
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
