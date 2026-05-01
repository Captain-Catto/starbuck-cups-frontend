import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/api-config";
import { getAdminForwardHeaders, handleAdminBackendResponse } from "@/lib/admin-api-helper";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = new URL(getApiUrl("admin/hero-images"));

    // Forward all query parameters
    searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAdminForwardHeaders(request),
      },
    });

    const data = await handleAdminBackendResponse(response);

    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch hero images" },
      { status: 500 }
    );
  }
}

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Validate uploaded file
    const file = formData.get("image");
    if (file instanceof File) {
      if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
        return NextResponse.json(
          { success: false, message: "Chỉ chấp nhận file ảnh (JPEG, PNG, WebP, GIF, AVIF)" },
          { status: 400 }
        );
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          { success: false, message: "Kích thước file không được vượt quá 10MB" },
          { status: 400 }
        );
      }
    }

    const response = await fetch(getApiUrl("admin/hero-images"), {
      method: "POST",
      headers: {
        ...getAdminForwardHeaders(request),
        // Don't set Content-Type for FormData - browser will set it with boundary
      },
      body: formData,
    });

    const data = await handleAdminBackendResponse(response);

    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to create hero image" },
      { status: 500 }
    );
  }
}
