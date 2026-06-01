import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/server-api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const queryString = request.nextUrl.searchParams.toString();
    const url = `${getApiUrl(`news/public/${slug}`)}${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error", data: null }, { status: 500 });
  }
}
