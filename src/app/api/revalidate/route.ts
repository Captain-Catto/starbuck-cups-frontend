import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { locales } from "@/i18n/config";

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
    }

    // Invalidate all fetches tagged "products" + key pages
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore — Next.js 16 type mismatch for revalidateTag
    revalidateTag("products");
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

// Keep GET for backward compatibility (manual trigger from browser)
export async function GET(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  const querySecret = request.nextUrl.searchParams.get("secret");

  if (!secret || querySecret !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore — Next.js 16 type mismatch for revalidateTag
  revalidateTag("products");
  revalidatePath("/[locale]", "layout");
  revalidatePath("/[locale]/products", "layout");

  return NextResponse.json({ revalidated: true, timestamp: new Date().toISOString() });
}
