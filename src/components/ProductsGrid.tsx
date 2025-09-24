"use client";

import { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import { useAppDispatch } from "@/store";
import { addToCart } from "@/store/slices/cartSlice";
import type { Product, CapacityRange } from "@/types";
import { toast } from "sonner";
import { Pagination } from "@/components/ui/Pagination";
import {
  calculateOptimalProductsPerPage,
  getResponsiveGridClasses,
  getSSRSafeGridConfig,
  type GridConfig,
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
}

export default function ProductsGrid({
  searchQuery,
  selectedCategory,
  selectedColor,
  capacityRange,
  sortBy,
  currentPage,
  onPageChange,
}: ProductsGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [gridConfig, setGridConfig] = useState<GridConfig>(
    getSSRSafeGridConfig()
  );
  const [paginationData, setPaginationData] = useState<PaginationData | null>(
    null
  );
  const dispatch = useAppDispatch();

  // Handle client-side mounting to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Setup responsive products per page calculation after mounting
  useEffect(() => {
    if (!isMounted) return;

    // Ensure we're only running on client-side
    if (typeof window === "undefined") {
      return;
    }

    const updateLayout = () => {
      const config = calculateOptimalProductsPerPage();
      setGridConfig((prevConfig) => {
        // Only update if config actually changed
        if (prevConfig.productsPerPage !== config.productsPerPage) {
          return config;
        }
        return prevConfig;
      });
    };

    // Initial calculation (only on client)
    updateLayout();

    // Setup resize listener with debouncing
    const handleResize = () => {
      // Debounce resize events
      if (window.resizeTimeout) {
        clearTimeout(window.resizeTimeout);
      }
      window.resizeTimeout = setTimeout(updateLayout, 150);
    };

    window.addEventListener("resize", handleResize);

    // Return cleanup function
    return () => {
      window.removeEventListener("resize", handleResize);
      if (window.resizeTimeout) {
        clearTimeout(window.resizeTimeout);
      }
    };
  }, [isMounted]);

  useEffect(() => {
    // Don't fetch on server or before component is mounted
    if (!isMounted) return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();

        if (searchQuery) params.append("search", searchQuery);
        if (selectedCategory) params.append("category", selectedCategory);
        if (selectedColor) params.append("color", selectedColor);
        if (capacityRange.min > 0)
          params.append("capacityMin", capacityRange.min.toString());
        if (capacityRange.max < 9999)
          params.append("capacityMax", capacityRange.max.toString());
        if (sortBy) {
          let field, order;
          if (sortBy === "newest") {
            field = "createdAt";
            order = "desc";
          } else if (sortBy === "oldest") {
            field = "createdAt";
            order = "asc";
          } else {
            [field, order] = sortBy.split("_");
          }
          params.append("sortBy", field);
          params.append("sortOrder", order);
        }
        params.append("page", currentPage.toString());
        params.append("limit", gridConfig.productsPerPage.toString());

        const response = await fetch(`/api/products?${params.toString()}`);
        const data = await response.json();

        if (data.success && data.data?.items) {
          setProducts(data.data.items);
          setPaginationData({
            totalPages: data.data.pagination?.total_pages || 1,
            limit: data.data.pagination?.per_page || 20,
            totalItems: data.data.pagination?.total_items || 0,
          });
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
  }, [
    searchQuery,
    selectedCategory,
    selectedColor,
    capacityRange,
    sortBy,
    currentPage,
    gridConfig.productsPerPage,
    isMounted, // Only fetch after client mount
  ]);

  const handleAddToCart = (product: Product) => {
    dispatch(addToCart({ product, quantity: 1 }));
    toast.success(`Đã thêm ${product.name} vào giỏ hàng`, {
      duration: 3000,
    });
  };

  const handlePageChange = (page: number) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    onPageChange(page);
  };

  // Skeleton loading
  if (loading) {
    return (
      <div className="space-y-6">
        <div className={getResponsiveGridClasses("products")}>
          {[...Array(gridConfig.productsPerPage)].map((_, index) => (
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
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={handleAddToCart}
            showAddToCart={true}
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
