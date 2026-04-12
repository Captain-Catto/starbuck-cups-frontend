import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getApiUrl } from "@/lib/api-config";
import { buildProductsQueryParams } from "@/lib/products-query";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
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

  const [category, { products, pagination, queryKey }, tCommon] =
    await Promise.all([
      getCategory(slug),
      getInitialProducts(slug, locale),
      getTranslations({ locale, namespace: "common" }),
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
      {/* SEO intro — server-rendered, visible to Google */}
      <section className="bg-black text-white pt-20 pb-2 md:pt-24">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: tCommon("home"), href: "/" },
              { label: tCommon("products"), href: "/products" },
              { label: category.name },
            ]}
          />
          <h1 className="text-xl md:text-2xl font-bold text-white mt-4 mb-2">
            {category.name}
          </h1>
          {cleanDescription && (
            <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">
              {cleanDescription}
            </p>
          )}
        </div>
      </section>

      <CategoryPageClient
        categorySlug={slug}
        initialProducts={products}
        initialPaginationData={pagination}
        initialQueryKey={queryKey}
      />
    </div>
  );
}
