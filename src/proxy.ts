import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminApiRoute = pathname.startsWith("/api/admin");
  const isLoginPage = pathname === "/admin/login";

  if (isAdminRoute || isAdminApiRoute) {
    const hasAuthCookie = request.cookies.has("admin_refresh_token");

    if (isAdminRoute && !isLoginPage && !hasAuthCookie) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }

    if (isAdminApiRoute && !hasAuthCookie) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Missing authentication cookie" },
        { status: 401 }
      );
    }

    return NextResponse.next();
  }

  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  // Exclude _next internals and any path with a file extension (favicon.ico,
  // logo.png, images/*, sounds/*.mp3, sitemap.xml, ...) instead of listing
  // every static folder/extension by hand — new public/ assets then need no
  // changes here, unlike the previous list which silently 404'd .mp3 files.
  matcher: ["/((?!_next|.*\\..*).*)"],
};

