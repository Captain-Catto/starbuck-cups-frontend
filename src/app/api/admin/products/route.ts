import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api-config";

// Helper function to forward auth headers
function getAuthHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {};

  // Forward authorization header from client request
  const authHeader = request.headers.get("authorization");
  console.log("[DEBUG] Products API - Authorization header:", authHeader ? "Present" : "Missing");
  console.log("[DEBUG] Products API - Request timestamp:", new Date().toISOString());
  if (authHeader) {
    headers["authorization"] = authHeader;
    console.log("[DEBUG] Products API - Token preview:", authHeader.substring(0, 20) + "...");
  }

  return headers;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = new URL(getApiUrl("admin/products"));

    // Forward all query parameters
    searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(request),
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Admin products API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[DEBUG] POST request received");
    console.log("[DEBUG] All headers:", Object.fromEntries(request.headers.entries()));

    const body = await request.json();
    console.log("[DEBUG] Request body:", body);

    const response = await fetch(getApiUrl("admin/products"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(request),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log("[DEBUG] Backend response:", response.status, data);
    if (data.error && data.error.details) {
      console.log("[DEBUG] Validation details:", JSON.stringify(data.error.details, null, 2));
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Create product API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create product" },
      { status: 500 }
    );
  }
}
