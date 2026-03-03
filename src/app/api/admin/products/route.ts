import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api-config";

// Helper function to forward auth headers
function getAuthHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {};

  // Forward authorization header from client request
  const authHeader = request.headers.get("authorization");

  if (authHeader) {
    headers["authorization"] = authHeader;
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
    console.error("🔍 [API ROUTE DEBUG] Error in GET:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 🔍 DEBUG: Log request body from frontend
    console.log("🔍 [API ROUTE DEBUG] Request body from frontend:", {
      body,
      isVipInBody: body.isVip,
      isVipType: typeof body.isVip,
      bodyKeys: Object.keys(body),
      hasIsVipProperty: body.hasOwnProperty("isVip"),
    });

    const response = await fetch(getApiUrl("admin/products"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(request),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // 🔍 DEBUG: Log backend response
    console.log("🔍 [API ROUTE DEBUG] Backend response:", {
      success: data.success,
      status: response.status,
      responseData: data,
    });

    if (data.error && data.error.details) {
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("🔍 [API ROUTE DEBUG] Error in POST:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create product" },
      { status: 500 }
    );
  }
}
