import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  generateSEO,
  generateBreadcrumbStructuredData,
  siteConfig,
} from "@/lib/seo";
import { getApiUrl } from "@/lib/api-config";
import type { Category } from "@/types";

interface Props {
  params: Promise<{ slug: string; locale: string }>;
  children: React.ReactNode;
}

async function getCategory(slug: string): Promise<Category | null> {
  try {
    const response = await fetch(getApiUrl(`categories/public/${slug}`), {
      next: { revalidate: 3600 },
    });
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
  const t = await getTranslations({ locale, namespace: "categoryPage" });
  const tSeo = await getTranslations({ locale, namespace: "seo" });

  const category = await getCategory(slug);
  const categoryName = category?.name || slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  const descriptionFallback = t("metaDescriptionFallback", { name: categoryName });
  const description = category?.description
    ? category.description
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 160)
    : descriptionFallback;

  const keywords = [
    categoryName,
    `${categoryName} starbucks`,
    `${categoryName} starbucks chính hãng`,
    "starbucks",
    "ly starbucks",
    "cốc starbucks",
    tSeo("siteKeywords"),
  ]
    .filter(Boolean)
    .join(", ");

  return generateSEO({
    title: categoryName,
    description,
    keywords,
    locale,
    openGraph: {
      title: `${categoryName} Starbucks | ${siteConfig.name}`,
      description,
      image: `${siteConfig.url}/logo.png`,
      url: `/category/${slug}`,
      type: "website",
    },
  });
}

export default async function CategoryLayout({ children, params }: Props) {
  const { slug, locale } = await params;
  const category = await getCategory(slug);
  const tCommon = await getTranslations({ locale, namespace: "common" });

  const categoryName = category?.name || slug;

  const breadcrumbJsonLd = generateBreadcrumbStructuredData(
    [
      { name: tCommon("home"), url: "/" },
      { name: tCommon("products"), url: "/products" },
      { name: categoryName, url: `/category/${slug}` },
    ],
    locale
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}
