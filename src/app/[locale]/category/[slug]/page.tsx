import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getApiUrl } from "@/lib/server-api";
import { buildProductsQueryParams } from "@/lib/products-query";
import CategoryPageClient from "@/components/pages/CategoryPageClient";
import ProductsPageSkeleton from "@/components/ui/ProductsPageSkeleton";
import { PRODUCTS_PAGE_LIMIT } from "@/utils/layoutCalculator";
import { generateSEO, siteConfig } from "@/lib/seo";
import type { Category, Color, Capacity, Product } from "@/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const [t, tSeo, category] = await Promise.all([
    getTranslations({ locale, namespace: "categoryPage" }),
    getTranslations({ locale, namespace: "seo" }),
    getCategory(slug),
  ]);
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
      image: `${siteConfig.url}/images/placeholder.webp`,
      url: `/category/${slug}`,
      type: "website",
    },
  });
}

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

// ─── Server-side helpers ────────────────────────────────────────────────────

async function getCategory(slug: string): Promise<Category | null> {
  try {
    const response = await fetch(getApiUrl(`categories/public/${slug}`), {
      next: { revalidate: 3600, tags: ["categories"] },
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.data || null;
  } catch {
    return null;
  }
}

async function getInitialProducts(slug: string, locale: string) {
  const params = buildProductsQueryParams({
    searchQuery: "",
    selectedCategory: slug,
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
      { next: { revalidate: 3600, tags: ["products"] } }
    );
    if (!response.ok) return { products: [], pagination: null, queryKey: params.toString() };

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

/** Fetch all categories for the filter sidebar. Falls back to [] on error. */
async function getFilterCategories(): Promise<Category[]> {
  try {
    const response = await fetch(getApiUrl("categories/public"), {
      next: { revalidate: 3600, tags: ["categories"] },
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

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  setRequestLocale(locale);

  // All data fetched in parallel — zero waterfalls
  const [
    category,
    { products, pagination, queryKey },
    categories,
    colors,
    capacities,
  ] = await Promise.all([
    getCategory(slug),
    getInitialProducts(slug, locale),
    getFilterCategories(),
    getFilterColors(),
    getFilterCapacities(),
  ]);

  if (!category) notFound();

  const cleanDescription = category.description
    ? category.description
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    : null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* SEO text — server-rendered for Google, visually hidden for users */}
      <div className="sr-only">
        <h1>{category.name}</h1>
        {cleanDescription && <p>{cleanDescription}</p>}
      </div>

      <Suspense fallback={<ProductsPageSkeleton />}>
        <CategoryPageClient
          categorySlug={slug}
          categoryName={category.name}
          initialProducts={products}
          initialPaginationData={pagination}
          initialQueryKey={queryKey}
          initialCategories={categories}
          initialColors={colors}
          initialCapacities={capacities}
        />
      </Suspense>
    </div>
  );
}
