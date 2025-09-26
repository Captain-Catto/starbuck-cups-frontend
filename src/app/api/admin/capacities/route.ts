import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api-config";

// Helper function to forward auth headers
function getAuthHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {};

  // Forward authorization header from client request
  const authHeader = request.headers.get("authorization");
  console.log("[DEBUG] Capacities API - Authorization header:", authHeader ? "Present" : "Missing");
  console.log("[DEBUG] Capacities API - Request timestamp:", new Date().toISOString());
  if (authHeader) {
    headers["authorization"] = authHeader;
    console.log("[DEBUG] Capacities API - Token preview:", authHeader.substring(0, 20) + "...");
  }

  return headers;
}

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(getApiUrl("admin/capacities"), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(request),
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Capacities API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch capacities" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(getApiUrl("admin/capacities"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(request),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Create capacity API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create capacity" },
      { status: 500 }
    );
  }
}
