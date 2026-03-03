import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api-config";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Build query string from search params
    const queryString = searchParams.toString();
    const url = `${getApiUrl("products/public")}${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data.message || "Failed to fetch products",
          data: null,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: data.data,
        error: null,
      },
      {
        headers: {
          // Cache for 1 hour on CDN, revalidate in background for 24 hours
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        data: null,
      },
      { status: 500 }
    );
  }
}
