import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api-config";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get auth token from headers
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        {
          success: false,
          message: "Authorization token required",
          data: null,
          error: {
            code: "UNAUTHORIZED",
            message: "Missing authorization token",
          },
        },
        { status: 401 }
      );
    }

    // Forward request to backend API
    const backendUrl = getApiUrl(`admin/orders/${id}`);

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        data: null,
        error: { code: "INTERNAL_ERROR", message: "Failed to fetch order" },
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get auth token from headers
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        {
          success: false,
          message: "Authorization token required",
          data: null,
          error: {
            code: "UNAUTHORIZED",
            message: "Missing authorization token",
          },
        },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();

    // Forward request to backend API
    const backendUrl = getApiUrl(`admin/orders/${id}`);

    const response = await fetch(backendUrl, {
      method: "PUT",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        data: null,
        error: { code: "INTERNAL_ERROR", message: "Failed to update order" },
      },
      { status: 500 }
    );
  }
}
