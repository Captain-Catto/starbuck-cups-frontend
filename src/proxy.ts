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
  matcher: [
    "/((?!_next|favicon\\.ico|logo.*|font|images|.*\\.webp|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.ico|sitemap\\.xml|robots\\.txt).*)",
  ],
};

