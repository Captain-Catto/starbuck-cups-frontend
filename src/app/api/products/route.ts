import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api-config";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = new URLSearchParams();

    // Pass through all search parameters to the backend
    searchParams.forEach((value, key) => {
      query.append(key, value);
    });

    const backendUrl = `${getApiUrl("products/public")}${
      query.toString() ? "?" + query.toString() : ""
    }`;

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();

    // Cache based on locale to support multilingual content
    const locale = searchParams.get("locale") || "vi";
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        "Vary": "Accept-Language",
        "X-Locale": locale,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
