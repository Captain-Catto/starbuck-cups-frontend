import { NextRequest, NextResponse } from "next/server";
import { getAdminForwardHeaders, handleAdminBackendResponse } from "@/lib/admin-api-helper";
import { getApiUrl } from "@/lib/server-api";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

const METHODS_WITHOUT_BODY = new Set(["GET", "HEAD"]);

async function forwardSettingsRequest(request: NextRequest, context: RouteContext) {
  try {
    const { path } = await context.params;
    const url = new URL(getApiUrl(`settings/${path.join("/")}`));
    request.nextUrl.searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });

    const headers = getAdminForwardHeaders(request);
    const contentType = request.headers.get("content-type");
    let body: BodyInit | undefined;

    if (!METHODS_WITHOUT_BODY.has(request.method)) {
      const textBody = await request.text();
      body = textBody || undefined;
      if (contentType) {
        headers["content-type"] = contentType;
      }
    }

    const response = await fetch(url.toString(), {
      cache: "no-store",
      method: request.method,
      headers,
      body,
    });

    const data = await handleAdminBackendResponse(response);
    const nextResponse = NextResponse.json(data, { status: response.status });

    for (const headerName of ["set-cookie", "x-token-refresh-needed", "x-refresh-type"]) {
      const headerValue = response.headers.get(headerName);
      if (headerValue) {
        nextResponse.headers.set(headerName, headerValue);
      }
    }

    return nextResponse;
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to proxy settings request" },
      { status: 500 }
    );
  }
}

export const GET = forwardSettingsRequest;
export const PUT = forwardSettingsRequest;

