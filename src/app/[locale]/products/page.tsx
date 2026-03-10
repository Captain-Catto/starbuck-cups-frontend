import ProductsPageClient from "@/components/pages/ProductsPageClient";
import { getApiUrl } from "@/lib/api-config";
import { buildProductsQueryParams } from "@/lib/products-query";
import { setRequestLocale } from "next-intl/server";
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

  const { products, pagination, queryKey } = await getInitialProducts(locale);

  return (
    <ProductsPageClient
      initialProducts={products}
      initialPaginationData={pagination}
      initialQueryKey={queryKey}
    />
  );
}
