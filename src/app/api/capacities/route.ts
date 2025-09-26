import { NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api-config";

export async function GET() {
  try {
    const backendUrl = getApiUrl("capacities/public");

    const response = await fetch(backendUrl, {
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
  } catch (error) {
    console.error("Error fetching capacities:", error);
    return NextResponse.json(
      { error: "Failed to fetch capacities" },
      { status: 500 }
    );
  }
}
