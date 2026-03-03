import { useState, useEffect, useCallback } from "react";
import { useAppSelector } from "@/store";
import type { PaginationMeta } from "@/types";

export interface LowStockProduct {
  id: string;
  name: string;
  stockQuantity: number;
  capacity: {
    id: string;
    name: string;
    volumeMl: number;
  };
}

interface UseLowStockOptions {
  limit?: number;
  threshold?: number;
  autoFetch?: boolean;
}

interface UseLowStockReturn {
  products: LowStockProduct[];
  pagination: PaginationMeta | null;
  currentPage: number;
  loading: boolean;
  error: string | null;
  handlePageChange: (page: number) => void;
  refetch: () => Promise<void>;
}

export const useLowStock = (
  options: UseLowStockOptions = {}
): UseLowStockReturn => {
  const { limit = 10, threshold = 10, autoFetch = true } = options;

  const [products, setProducts] = useState<LowStockProduct[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get token from Redux store
  const { token } = useAppSelector((state) => state.auth);

  const fetchLowStockProducts = useCallback(
    async (page: number = 1) => {
      if (!token) {
        setError("No authentication token found");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          threshold: threshold.toString(),
        });

        const response = await fetch(
          `/api/admin/products/low-stock?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch low stock products: ${response.status}`
          );
        }

        const result = await response.json();

        if (result.success && result.data) {
          setProducts(result.data.items || []);
          setPagination(result.data.pagination || null);
        } else {
          throw new Error(
            result.message || "Failed to fetch low stock products"
          );
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        setProducts([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    },
    [token, limit, threshold]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      fetchLowStockProducts(page);
    },
    [fetchLowStockProducts]
  );

  const refetch = useCallback(() => {
    return fetchLowStockProducts(currentPage);
  }, [fetchLowStockProducts, currentPage]);

  useEffect(() => {
    if (autoFetch && token) {
      fetchLowStockProducts(currentPage);
    }
  }, [autoFetch, token, currentPage, fetchLowStockProducts]);

  return {
    products,
    pagination,
    currentPage,
    loading,
    error,
    handlePageChange,
    refetch,
  };
};
