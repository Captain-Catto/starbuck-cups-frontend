import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api-config";

export interface ConsultationOrderData {
  customer: {
    customerName: string;
    phoneNumber: string;
    email?: string;
    address: string;
  };
  items: Array<{
    productId: string;
    productName: string;
    color: string;
    capacity: string;
    category: string;
  }>;
  createdAt: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: ConsultationOrderData = await request.json();

    // Validate required fields
    if (
      !data.customer.customerName ||
      !data.customer.phoneNumber ||
      !data.customer.address
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required customer information" },
        { status: 400 }
      );
    }

    if (!data.items || data.items.length === 0) {
      return NextResponse.json(
        { success: false, error: "No items in consultation request" },
        { status: 400 }
      );
    }

    // Forward to backend API
    const backendResponse = await fetch(getApiUrl("consultations"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!backendResponse.ok) {
      throw new Error(`Backend API error: ${backendResponse.status}`);
    }

    const result = await backendResponse.json();

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        timestamp: new Date().toISOString(),
      },
      error: null,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create consultation order",
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}
