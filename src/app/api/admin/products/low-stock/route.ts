import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api-config";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = new URL(getApiUrl("admin/products/low-stock"));

    // Forward query parameters (threshold, etc.)
    searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(request.headers.get("authorization") && {
          authorization: request.headers.get("authorization") as string,
        }),
        ...(request.headers.get("cookie") && {
          cookie: request.headers.get("cookie") as string,
        }),
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Low stock products API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch low stock products" },
      { status: 500 }
    );
  }
}
