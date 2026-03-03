import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api-config";

export async function GET(request: NextRequest) {
  try {
    // Forward cookies to backend
    const cookies = request.headers.get("cookie");

    const response = await fetch(getApiUrl("auth/admin/session"), {
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
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
