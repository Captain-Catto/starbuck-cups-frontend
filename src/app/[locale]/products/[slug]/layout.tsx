import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export const revalidate = 3600;
import {
  generateSEO,
  generateProductStructuredData,
  generateBreadcrumbStructuredData,
} from "@/lib/seo";
import { getApiUrl } from "@/lib/api-config";
import { Product } from "@/types";

interface Props {
  params: Promise<{ slug: string; locale: string }>;
  children: React.ReactNode;
}

async function getProduct(slug: string, locale?: string): Promise<Product | null> {
  try {
    const url = locale
      ? `${getApiUrl(`products/public/${slug}`)}?locale=${encodeURIComponent(locale)}`
      : getApiUrl(`products/public/${slug}`);
    const response = await fetch(url, { next: { revalidate: 3600, tags: ["products"] } });
    if (!response.ok) return null;
    const data = await response.json();
    return data.data || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const t = await getTranslations({ locale, namespace: "productDetail" });
  const product = await getProduct(slug, locale);

  const localeKey = locale as "vi" | "en" | "zh";
  const translation = product?.translations?.[localeKey];
  const productName = translation?.metaTitle || product?.name ||
    slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  const categories =
    product?.productCategories
      ?.map((pc) => pc.category.name)
      .join(", ") || "";

  const colors =
    product?.productColors
      ?.map((pc) => pc.color.name)
      .join(", ") || "";

  let description: string;
  if (translation?.metaDescription) {
    description = translation.metaDescription.slice(0, 160);
  } else if (product) {
    const parts = [product.name];
    if (categories) parts.push(categories);
    if (colors) parts.push(colors);
    const suffix =
      locale === "en"
        ? "Authentic Starbucks. In stock, express delivery nationwide."
        : locale === "zh"
        ? "正品星巴克。现货，全国快速配送。"
        : "Starbucks chính hãng. Sẵn hàng, ship hỏa tốc toàn quốc.";
    description = `${parts.join(" · ")} — ${suffix}`.slice(0, 160);
  } else {
    description = t("metaDescription", { name: productName });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hasron.vn";
  const rawOgImage = product?.productImages?.[0]?.url ?? null;

  const capacity = product?.capacity?.name || "";

  const keywords = [
    productName,
    categories,
    colors,
    capacity,
    "starbucks",
    "ly starbucks",
    "cốc starbucks",
    "starbucks cups",
    "ly starbuck chính hãng",
    "mua ly starbucks",
  ]
    .filter(Boolean)
    .join(", ");

  // Facebook/Zalo crawlers cannot load Google Drive (lh3.googleusercontent.com) URLs directly —
  // Google blocks bot user-agents and the redirect chain (303→200) is not followed reliably.
  // Run through the /api/image proxy which serves a direct JPEG with no redirects.
  const ogImageUrl = rawOgImage
    ? `${siteUrl}/api/image?url=${encodeURIComponent(rawOgImage)}&w=1200&q=85&f=jpeg`
    : `${siteUrl}/logo.png`;

  const ogTitleSuffix: Record<string, string> = {
    vi: "Mua ly Starbucks chính hãng",
    en: "Authentic Starbucks Cups",
    zh: "正品星巴克杯",
  };

  return generateSEO({
    title: productName,
    description,
    keywords,
    locale,
    openGraph: {
      title: `${productName} - ${ogTitleSuffix[locale] ?? ogTitleSuffix.vi}`,
      description,
      image: ogImageUrl,
      url: `/products/${slug}`,
      type: "website",
    },
  });
}

export default async function ProductLayout({ children, params }: Props) {
  const { slug, locale } = await params;
  const product = await getProduct(slug, locale);
  const tCommon = await getTranslations({ locale, namespace: "common" });

  const productJsonLd = product
    ? generateProductStructuredData(product)
    : null;

  const breadcrumbJsonLd = generateBreadcrumbStructuredData([
    { name: tCommon("home"), url: "/" },
    { name: tCommon("products"), url: "/products" },
    { name: product?.name || slug, url: `/products/${slug}` },
  ], locale);

  return (
    <>
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}
