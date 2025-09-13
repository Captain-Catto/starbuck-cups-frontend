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

    // Create response and forward any set-cookie headers
    const nextResponse = NextResponse.json(data, { status: response.status });
    const setCookieHeader = response.headers.get("set-cookie");
    if (setCookieHeader) {
      nextResponse.headers.set("set-cookie", setCookieHeader);
    }

    return nextResponse;
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
