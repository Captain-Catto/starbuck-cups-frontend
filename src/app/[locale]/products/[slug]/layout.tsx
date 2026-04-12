import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
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

  const productName =
    product?.name ||
    slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  const description = product?.description
    ? product.description
        .replace(/<[^>]*>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&nbsp;/g, " ")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 160)
    : t("metaDescription", { name: productName });

  const ogImage =
    product?.productImages?.[0]?.url || `${process.env.NEXT_PUBLIC_SITE_URL || "https://hasron.vn"}/logo.png`;

  const categories =
    product?.productCategories
      ?.map((pc) => pc.category.name)
      .join(", ") || "";

  const colors =
    product?.productColors
      ?.map((pc) => pc.color.name)
      .join(", ") || "";

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

  // Use original image URL for OG — social crawlers (Facebook, Zalo) load it directly,
  // proxy adds latency risk and timeout potential with no page-speed benefit.
  const ogImageUrl = ogImage;

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
