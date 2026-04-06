import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { generateSEO } from "@/lib/seo";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const { locale } = await params;
  const resolvedSearch = searchParams ? await searchParams : {};
  const t = await getTranslations({ locale, namespace: "seo" });

  // Noindex filtered/paginated views to avoid duplicate content
  const hasFilters =
    resolvedSearch.search ||
    resolvedSearch.category ||
    resolvedSearch.color ||
    resolvedSearch.minCapacity ||
    resolvedSearch.maxCapacity ||
    resolvedSearch.sort;
  const page = Number(resolvedSearch.page ?? 1);
  const isFiltered = !!hasFilters || page > 1;

  return {
    ...generateSEO({
      title: `${t("siteTitle")} - ${t("productsPageTitle")}`,
      description: t("productsPageDescription"),
      keywords: t("siteKeywords"),
      locale,
      openGraph: {
        title: `${t("siteTitle")} - ${t("productsPageTitle")}`,
        description: t("productsPageDescription"),
        image: "/logo.png",
        url: "/products",
        type: "website",
      },
    }),
    ...(isFiltered && {
      robots: { index: false, follow: true },
    }),
  };
}

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
