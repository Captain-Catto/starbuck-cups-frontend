import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const response = await fetch(`${BACKEND_URL}/api/products/public/${slug}`, {
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
          error: data.message || "Failed to fetch product",
          data: null,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: data.data,
      error: null,
    });
  } catch (error) {
    console.error("API Error:", error);
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
