import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api-config";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Proxy request to backend
    const response = await fetch(getApiUrl("auth/admin/login"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || "Login failed" },
        { status: response.status }
      );
    }

    // Create response with tokens
    const nextResponse = NextResponse.json({
      success: true,
      data: {
        user: data.data.user,
        token: data.data.token, // Send access token to client
      },
      message: data.message,
    });

    // Set refresh token in httpOnly cookie
    const tokenToSet = data.data.refreshToken || data.data.token;
    if (tokenToSet) {
      nextResponse.cookies.set("admin_refresh_token", tokenToSet, {
        httpOnly: true,
        secure: request.nextUrl.protocol === "https:",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      });
    }

    return nextResponse;
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
