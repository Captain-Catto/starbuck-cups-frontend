import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * GET /api/promotional-banners
 * Get active promotional banner (public)
 */
export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/promotional-banners`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Enable caching for better performance
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to fetch promotional banner",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, {
      headers: {
        // Cache for 30 minutes on CDN, revalidate in background for 24 hours
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400',
      },
    });
  } catch (error: unknown) {

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
