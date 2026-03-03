import { NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api-config";

export async function GET() {
  try {
    const backendUrl = getApiUrl("categories/public");

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        // Cache for 1 hour on CDN, revalidate in background for 24 hours
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
