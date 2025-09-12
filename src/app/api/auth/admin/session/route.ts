import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

export async function GET(request: NextRequest) {
  try {
    // Forward cookies to backend
    const cookies = request.headers.get("cookie");

    console.log("Next.js session API:", {
      hasCookie: !!cookies,
      cookieValue: cookies,
      allHeaders: Object.fromEntries(request.headers.entries()),
    });

    const response = await fetch(`${BACKEND_URL}/api/auth/admin/session`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(cookies && { Cookie: cookies }),
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
