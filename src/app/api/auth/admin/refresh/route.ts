import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api-config";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Forward cookies from the client request to the backend
    const cookies = request.headers.get("cookie") || "";

    const response = await fetch(getApiUrl("auth/admin/refresh"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookies, // Forward cookies to backend
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.message || "Token refresh failed" },
        { status: response.status }
      );
    }

    // Forward any set-cookie headers back to the client
    const nextResponse = NextResponse.json(data);
    const setCookieHeader = response.headers.get("set-cookie");
    if (setCookieHeader) {
      nextResponse.headers.set("set-cookie", setCookieHeader);
    }

    return nextResponse;
  } catch (error) {
    console.error("Admin auth refresh error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}