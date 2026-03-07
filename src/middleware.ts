import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Match all pathnames except:
    // - /api (API routes)
    // - /admin (admin panel)
    // - /_next (Next.js internals)
    // - /favicon.ico, /logo.png, etc. (static files)
    "/((?!api|admin|_next|favicon\\.ico|logo.*|font|images|.*\\.webp|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.ico|sitemap\\.xml|robots\\.txt).*)",
  ],
};
