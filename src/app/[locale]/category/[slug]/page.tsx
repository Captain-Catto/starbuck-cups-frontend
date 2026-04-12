import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getApiUrl } from "@/lib/api-config";
import { buildProductsQueryParams } from "@/lib/products-query";
import CategoryPageClient from "@/components/pages/CategoryPageClient";
import type { Category, Product } from "@/types";

const DEFAULT_LIMIT = 24;

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

async function getCategory(slug: string): Promise<Category | null> {
  try {
    const response = await fetch(getApiUrl(`categories/public/${slug}`), {
      next: { revalidate: 3600, tags: ["products"] },
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
    limit: DEFAULT_LIMIT,
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
          limit: data.data?.pagination?.per_page ?? DEFAULT_LIMIT,
          totalItems: data.data?.pagination?.total_items ?? products.length,
        }
      : null;

    return { products, pagination, queryKey: params.toString() };
  } catch {
    return { products: [], pagination: null, queryKey: params.toString() };
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  setRequestLocale(locale);

  const [category, { products, pagination, queryKey }] =
    await Promise.all([
      getCategory(slug),
      getInitialProducts(slug, locale),
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
    <div className="min-h-screen bg-black text-white">
      {/* SEO text — server-rendered for Google, visually hidden for users */}
      <div className="sr-only">
        <h1>{category.name}</h1>
        {cleanDescription && <p>{cleanDescription}</p>}
      </div>

      <CategoryPageClient
        categorySlug={slug}
        categoryName={category.name}
        initialProducts={products}
        initialPaginationData={pagination}
        initialQueryKey={queryKey}
      />
    </div>
  );
}
