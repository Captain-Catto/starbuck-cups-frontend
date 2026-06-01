import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { locales } from "@/i18n/config";
import { getApiUrl } from "@/lib/server-api";
import { convertDriveUrl } from "@/utils/googleDriveHelper";

/**
 * On-demand revalidation endpoint.
 * Backend calls this after creating / updating / deleting a product.
 *
 * POST /api/revalidate
 * Authorization: Bearer <REVALIDATE_SECRET>
 * Body (optional): { slug?: string }
 *   slug present → also revalidate that specific product page
 *   slug absent  → revalidate all products + listings + homepage
 */
export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const slug: string | undefined = body.slug;

    if (slug) {
      for (const locale of locales) {
        const prefix = locale === "vi" ? "" : `/${locale}`;
        revalidatePath(`${prefix}/products/${slug}`);
      }

      // Warm the OG image proxy cache so Messenger gets a fast response.
      // Fire-and-forget: don't block the revalidate response.
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hasron.vn";
      fetch(getApiUrl(`products/public/${slug}`), { cache: "no-store" })
        .then((r) => r.json())
        .then((data) => {
          const imageUrl = data?.data?.productImages?.[0]?.url;
          if (!imageUrl) return;
          const proxyUrl = `${siteUrl}/api/image?url=${encodeURIComponent(convertDriveUrl(imageUrl))}&w=1200&q=85&f=jpeg`;
          return fetch(proxyUrl, {
      cache: "no-store", signal: AbortSignal.timeout(30_000) });
        })
        .catch(() => {});
    }

    // Invalidate all fetches tagged "products" + key pages
    revalidateTag("products", "default");
    revalidatePath("/[locale]", "layout");
    revalidatePath("/[locale]/products", "layout");

    return NextResponse.json({
      revalidated: true,
      slug: slug ?? "all",
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

