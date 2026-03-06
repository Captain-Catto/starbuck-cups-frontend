"use client";

import { useState, useEffect, useRef } from "react";
import ProductCard from "@/components/ProductCard";
import { useAppDispatch } from "@/store";
import { addToCart } from "@/store/slices/cartSlice";
import type { Product, CapacityRange } from "@/types";
import { trackAddToCart, trackPagination } from "@/lib/analytics";
import { Pagination } from "@/components/ui/Pagination";
import { buildProductsQueryParams } from "@/lib/products-query";
import {
  getResponsiveGridClasses,
  getProductsPageLimit,
} from "@/utils/layoutCalculator";

interface PaginationData {
  totalPages: number;
  limit: number;
  totalItems: number;
}

interface ProductsGridProps {
  searchQuery: string;
  selectedCategory: string;
  selectedColor: string;
  capacityRange: CapacityRange;
  sortBy: string;
  currentPage: number;
  onPageChange: (page: number) => void;
  initialProducts?: Product[];
  initialPaginationData?: PaginationData | null;
  initialQueryKey?: string;
}

export default function ProductsGrid({
  searchQuery,
  selectedCategory,
  selectedColor,
  capacityRange,
  sortBy,
  currentPage,
  onPageChange,
  initialProducts = [],
  initialPaginationData = null,
  initialQueryKey,
}: ProductsGridProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(initialProducts.length === 0);
  const [paginationData, setPaginationData] = useState<PaginationData | null>(
    initialPaginationData
  );
  const didSkipInitialFetch = useRef(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const productsLimit = getProductsPageLimit();
        const params = buildProductsQueryParams({
          searchQuery,
          selectedCategory,
          selectedColor,
          capacityRange,
          sortBy,
          currentPage,
          limit: productsLimit,
        });

        if (
          !didSkipInitialFetch.current &&
          initialQueryKey &&
          initialQueryKey === params.toString()
        ) {
          didSkipInitialFetch.current = true;
          setLoading(false);
          return;
        }
        didSkipInitialFetch.current = true;

        const response = await fetch(`/api/products?${params.toString()}`);
        const data = await response.json();

        if (data.success && data.data?.items) {
          setProducts(data.data.items);
          const totalPages = data.data.pagination?.total_pages || 1;
          setPaginationData({
            totalPages,
            limit: data.data.pagination?.per_page || 20,
            totalItems: data.data.pagination?.total_items || 0,
          });

          // Auto-reset to page 1 if current page exceeds total pages
          if (currentPage > totalPages) {
            onPageChange(1);
          }
        } else {
          setProducts([]);
          setPaginationData(null);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
        setPaginationData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchQuery,
    selectedCategory,
    selectedColor,
    capacityRange,
    sortBy,
    currentPage,
    initialQueryKey,
  ]);

  const handleAddToCart = (product: Product) => {
    dispatch(addToCart({ product }));

    // Track add to cart event
    trackAddToCart({
      id: product.id,
      name: product.name,
      category: product.productCategories?.[0]?.category?.name,
    });
  };

  const handlePageChange = (page: number) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    onPageChange(page);

    // Track pagination usage
    if (paginationData) {
      trackPagination(page, paginationData.totalPages);
    }
  };

  // Skeleton loading
  if (loading) {
    // Render only above-the-fold placeholders to reduce main-thread/layout work.
    const skeletonCount = 12;
    return (
      <div className="space-y-6">
        <div className={getResponsiveGridClasses("products")}>
          {[...Array(skeletonCount)].map((_, index) => (
            <div
              key={index}
              className="animate-pulse bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden"
            >
              <div className="aspect-square bg-zinc-700"></div>
              <div className="p-4">
                <div className="h-4 bg-zinc-700 rounded mb-2"></div>
                <div className="h-3 bg-zinc-700 rounded mb-3 w-3/4"></div>
                <div className="h-8 bg-zinc-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-400 text-lg">Không tìm thấy sản phẩm nào</p>
        <p className="text-zinc-500 text-sm mt-2">
          Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Products Grid */}
      <div className={getResponsiveGridClasses("products")}>
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={handleAddToCart}
            showAddToCart={true}
            showSecondaryImage={index < 12}
            priority={
              index < 6 &&
              currentPage === 1 &&
              !searchQuery &&
              !selectedCategory &&
              !selectedColor &&
              capacityRange.min <= 0 &&
              capacityRange.max >= 9999
            }
            imageSizes="(max-width: 640px) calc((100vw - 3rem)/2), (max-width: 768px) calc((100vw - 4rem)/2), (max-width: 1024px) calc((100vw - 5rem)/3), (max-width: 1280px) calc((100vw - 8rem)/4), (max-width: 1536px) calc((100vw - 10rem)/5), calc((100vw - 12rem)/6)"
          />
        ))}
      </div>

      {/* Pagination */}
      {paginationData && paginationData.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            data={{
              current_page: currentPage,
              has_next: currentPage < paginationData.totalPages,
              has_prev: currentPage > 1,
              per_page: paginationData.limit,
              total_items: paginationData.totalItems,
              total_pages: paginationData.totalPages,
            }}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
