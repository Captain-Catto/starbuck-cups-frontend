import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /admin and /api/admin routes
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminApiRoute = pathname.startsWith("/api/admin");
  const isLoginPage = pathname === "/admin/login";

  if (isAdminRoute || isAdminApiRoute) {
    // Check for the refresh token cookie (indicates a logged-in session)
    const hasAuthCookie = request.cookies.has("admin_refresh_token");

    // If trying to access admin pages (not API) without auth, redirect to login
    if (isAdminRoute && !isLoginPage && !hasAuthCookie) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }

    // If logged in and trying to access login page, redirect to dashboard
    if (isLoginPage && hasAuthCookie) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/dashboard";
      return NextResponse.redirect(url);
    }

    // If trying to access admin API without auth, return 401 Unauthorized
    if (isAdminApiRoute && !hasAuthCookie) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Missing authentication cookie" },
        { status: 401 }
      );
    }

    // Pass through admin requests without running through next-intl
    return NextResponse.next();
  }

  // Skip API routes so next-intl doesn't try to localize them
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Run next-intl for all other routes
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Match all pathnames except:
    // - /_next (Next.js internals)
    // - Static files
    "/((?!_next|favicon\\.ico|logo.*|font|images|.*\\.webp|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.ico|sitemap\\.xml|robots\\.txt).*)",
  ],
};
