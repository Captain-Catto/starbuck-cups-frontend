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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await fetch(getApiUrl(`news/admin/${id}`), {
      headers: { "Content-Type": "application/json", ...getAuthHeaders(request) },
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to fetch news" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const response = await fetch(getApiUrl(`news/admin/${id}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders(request) },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to update news" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await fetch(getApiUrl(`news/admin/${id}`), {
      method: "DELETE",
      headers: { "Content-Type": "application/json", ...getAuthHeaders(request) },
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to delete news" }, { status: 500 });
  }
}
