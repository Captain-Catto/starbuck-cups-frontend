import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api-config";

// Helper function to forward auth headers
function getAuthHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {};

  // Forward authorization header from client request
  const authHeader = request.headers.get("authorization");
  console.log("Customers API Route - Received auth header:", authHeader);

  if (authHeader) {
    headers["authorization"] = authHeader;
    console.log("Customers API Route - Forwarding auth header to backend");
  } else {
    console.warn(
      "Customers API Route - No authorization header received from client"
    );
  }

  return headers;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = new URL(getApiUrl("admin/customers"));

    // Forward all query parameters
    searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });

    const authHeaders = getAuthHeaders(request);
    console.log(
      "Customers API Route - Calling backend with URL:",
      url.toString()
    );
    console.log("Customers API Route - Headers being sent:", authHeaders);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
    });

    const data = await response.json();
    console.log(
      "Customers API Route - Backend response status:",
      response.status
    );
    console.log("Customers API Route - Backend response data:", data);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Customers API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(getApiUrl("admin/customers"), {
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
    console.error("Create customer API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create customer" },
      { status: 500 }
    );
  }
}
