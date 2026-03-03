import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api-config";

interface StatusUpdateRequest {
  status: string;
}

const validStatuses = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID is required" },
        { status: 400 }
      );
    }

    const body: StatusUpdateRequest = await request.json();
    const { status } = body;

    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status provided" },
        { status: 400 }
      );
    }

    // Here you would call your backend API
    const backendResponse = await fetch(
      `${getApiUrl("admin/orders")}/${orderId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: request.headers.get("Authorization") || "",
        },
        body: JSON.stringify({ status }),
      }
    );

    const result = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(result, { status: backendResponse.status });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
