import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params;
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";

    // Get authorization header
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Authorization header required" },
        { status: 401 }
      );
    }

    // Forward the request to the backend API
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/admin/customers/${customerId}/orders?page=${page}&limit=${limit}`;

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        authorization: authHeader,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Customer Orders API Route error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
