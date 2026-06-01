import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/server-api";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.toString();
    const backendUrl = `${getApiUrl("capacities/public")}${query ? `?${query}` : ""}`;

    const response = await fetch(backendUrl, {
      cache: "no-store",
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch capacities" },
      { status: 500 }
    );
  }
}
