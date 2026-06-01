import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/server-api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Proxy request to backend
    const response = await fetch(getApiUrl("auth/admin/login"), {
      cache: "no-store",
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

    const nextResponse = NextResponse.json({
      success: true,
      data: {
        user: data.data.user,
        token: data.data.token,
      },
      message: data.message,
    });

    // Forward the HttpOnly refresh token cookie set by the backend (contains the real refresh token)
    const setCookieHeader = response.headers.get("set-cookie");
    if (setCookieHeader) {
      nextResponse.headers.set("set-cookie", setCookieHeader);
    }

    return nextResponse;
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
