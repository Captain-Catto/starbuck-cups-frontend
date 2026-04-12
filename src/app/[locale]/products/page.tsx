import ProductsPageClient from "@/components/pages/ProductsPageClient";
import { getApiUrl } from "@/lib/api-config";
import { buildProductsQueryParams } from "@/lib/products-query";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Product } from "@/types";

export const revalidate = 30;
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

const DEFAULT_PRODUCTS_LIMIT = 24;

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
    limit: DEFAULT_PRODUCTS_LIMIT,
    locale,
  });

  try {
    const response = await fetch(
      `${getApiUrl("products/public")}?${params.toString()}`,
      {
        next: { revalidate: 60 },
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
          limit: data.data?.pagination?.per_page ?? DEFAULT_PRODUCTS_LIMIT,
          totalItems: data.data?.pagination?.total_items ?? products.length,
        }
      : null;

    return { products, pagination, queryKey: params.toString() };
  } catch {
    return { products: [], pagination: null, queryKey: params.toString() };
  }
}

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [{ products, pagination, queryKey }, t] = await Promise.all([
    getInitialProducts(locale),
    getTranslations({ locale, namespace: "seo" }),
  ]);

  return (
    <>
      {/* SEO intro — server-rendered, visible to Google */}
      <section className="bg-black text-white pt-20 pb-2 md:pt-24">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <h1 className="text-xl md:text-2xl font-bold text-white mb-4">
            {t("productsIntroTitle")}
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-zinc-400 leading-relaxed max-w-4xl">
            <p>{t("productsIntroP1")}</p>
            <p>{t("productsIntroP2")}</p>
            <p>{t("productsIntroP3")}</p>
            <p>{t("productsIntroP4")}</p>
          </div>
        </div>
      </section>

      <ProductsPageClient
        initialProducts={products}
        initialPaginationData={pagination}
        initialQueryKey={queryKey}
      />
    </>
  );
}
