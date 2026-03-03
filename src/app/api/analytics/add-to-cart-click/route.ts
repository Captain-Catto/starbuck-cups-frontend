import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api-config";

// Track add to cart click
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, productName, timestamp } = body;

    // Validate required fields
    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Forward to backend analytics service
    const response = await fetch(getApiUrl("analytics/add-to-cart-click"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId,
        productName,
        timestamp,
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend request failed: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    // Return success even on error to prevent blocking user experience
    return NextResponse.json(
      {
        success: true,
        message: "Tracking request processed",
        error: "Silent failure - tracking error logged",
      },
      { status: 200 }
    );
  }
}
