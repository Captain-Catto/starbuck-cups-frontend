import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api-config";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const url = new URL(getApiUrl(`admin/products/${id}`));

    // Forward query parameters
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
    console.error("Get product API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch product" },
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
    const body = await request.json();

    const response = await fetch(getApiUrl(`admin/products/${id}`), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(request.headers.get("authorization") && {
          authorization: request.headers.get("authorization") as string,
        }),
        ...(request.headers.get("cookie") && {
          cookie: request.headers.get("cookie") as string,
        }),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Update product API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const response = await fetch(getApiUrl(`admin/products/${id}`), {
      method: "DELETE",
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
    console.error("Delete product API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete product" },
      { status: 500 }
    );
  }
}
