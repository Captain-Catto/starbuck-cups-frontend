import { Suspense } from "react";
import type { Metadata } from "next";
import ProductsPageClient from "@/components/pages/ProductsPageClient";
import { getApiUrl } from "@/lib/server-api";
import { buildProductsQueryParams } from "@/lib/products-query";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { generateBreadcrumbStructuredData, generateSEO } from "@/lib/seo";
import { PRODUCTS_PAGE_LIMIT } from "@/utils/layoutCalculator";
import ProductsPageSkeleton from "@/components/ui/ProductsPageSkeleton";
import type { Category, Color, Capacity, Product } from "@/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  return generateSEO({
    title: t("productsPageTitle"),
    description: t("productsPageDescription"),
    keywords: t("siteKeywords"),
    locale,
    openGraph: {
      title: `${t("productsPageTitle")} | ${t("siteTitle")}`,
      description: t("productsPageDescription"),
      image: "/images/placeholder.webp",
      url: "/products",
      type: "website",
    },
  });
}

export const revalidate = 3600;
export const dynamic = "force-static";

interface ProductsApiResponse {
  success: boolean;
  data?: {
    items?: Product[];
    pagination?: {
      total_pages?: number;
      per_page?: number;
      total_items?: number;
    };
  };
}

interface InitialPaginationData {
  totalPages: number;
  limit: number;
  totalItems: number;
}


// ─── Server-side helpers ────────────────────────────────────────────────────

async function getInitialProducts(locale: string): Promise<{
  products: Product[];
  pagination: InitialPaginationData | null;
  queryKey: string;
}> {
  const params = buildProductsQueryParams({
    searchQuery: "",
    selectedCategory: "",
    selectedColor: "",
    capacityRange: { min: 0, max: 9999 },
    sortBy: "featured",
    currentPage: 1,
    limit: PRODUCTS_PAGE_LIMIT,
    locale,
  });

  try {
    const response = await fetch(
      `${getApiUrl("products/public")}?${params.toString()}`,
      {
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      return { products: [], pagination: null, queryKey: params.toString() };
    }

    const data = (await response.json()) as ProductsApiResponse;
    const products = data.success ? (data.data?.items ?? []) : [];
    const pagination = data.success
      ? {
          totalPages: data.data?.pagination?.total_pages ?? 1,
          limit: data.data?.pagination?.per_page ?? PRODUCTS_PAGE_LIMIT,
          totalItems: data.data?.pagination?.total_items ?? products.length,
        }
      : null;

    return { products, pagination, queryKey: params.toString() };
  } catch {
    return { products: [], pagination: null, queryKey: params.toString() };
  }
}

/** Fetch categories for the filter sidebar. Falls back to [] on error. */
async function getFilterCategories(): Promise<Category[]> {
  try {
    const response = await fetch(getApiUrl("categories/public"), {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.success && Array.isArray(data.data?.items)
      ? data.data.items
      : [];
  } catch {
    return [];
  }
}

/** Fetch colors for the filter sidebar. Falls back to [] on error. */
async function getFilterColors(): Promise<Color[]> {
  try {
    const response = await fetch(`${getApiUrl("colors/public")}?limit=-1`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.success && Array.isArray(data.data?.items)
      ? data.data.items
      : [];
  } catch {
    return [];
  }
}

/** Fetch capacities for the filter sidebar. Falls back to [] on error. */
async function getFilterCapacities(): Promise<Capacity[]> {
  try {
    const response = await fetch(`${getApiUrl("capacities/public")}?limit=-1`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.success && Array.isArray(data.data?.items)
      ? data.data.items
      : [];
  } catch {
    return [];
  }
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // All data fetched in parallel — zero waterfalls
  const [
    { products, pagination, queryKey },
    t,
    tCommon,
    categories,
    colors,
    capacities,
  ] = await Promise.all([
    getInitialProducts(locale),
    getTranslations({ locale, namespace: "seo" }),
    getTranslations({ locale, namespace: "common" }),
    getFilterCategories(),
    getFilterColors(),
    getFilterCapacities(),
  ]);

  const breadcrumbJsonLd = generateBreadcrumbStructuredData(
    [
      { name: tCommon("home"), url: "/" },
      { name: tCommon("products"), url: "/products" },
    ],
    locale
  );

  return (
    <>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbJsonLd)}
      </script>
      {/* SEO intro — server-rendered for Google, visually hidden for users */}
      <div className="sr-only">
        <h1>{t("productsIntroTitle")}</h1>
        <p>{t("productsIntroP1")}</p>
        <p>{t("productsIntroP2")}</p>
        <p>{t("productsIntroP3")}</p>
        <p>{t("productsIntroP4")}</p>
      </div>

      <Suspense fallback={<ProductsPageSkeleton />}>
        <ProductsPageClient
          initialProducts={products}
          initialPaginationData={pagination}
          initialQueryKey={queryKey}
          initialCategories={categories}
          initialColors={colors}
          initialCapacities={capacities}
        />
      </Suspense>
    </>
  );
}
