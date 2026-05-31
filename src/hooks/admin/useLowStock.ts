import { useCallback, useEffect, useReducer } from "react";
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

interface LowStockState {
  products: LowStockProduct[];
  pagination: PaginationMeta | null;
  currentPage: number;
  loading: boolean;
  error: string | null;
}

type LowStockAction =
  | { type: "FETCH_START"; page: number }
  | {
      type: "FETCH_SUCCESS";
      page: number;
      products: LowStockProduct[];
      pagination: PaginationMeta | null;
    }
  | { type: "FETCH_ERROR"; error: string }
  | { type: "NO_TOKEN" };

const initialLowStockState: LowStockState = {
  products: [],
  pagination: null,
  currentPage: 1,
  loading: false,
  error: null,
};

function lowStockReducer(
  state: LowStockState,
  action: LowStockAction
): LowStockState {
  switch (action.type) {
    case "FETCH_START":
      return {
        ...state,
        currentPage: action.page,
        loading: true,
        error: null,
      };
    case "FETCH_SUCCESS":
      return {
        products: action.products,
        pagination: action.pagination,
        currentPage: action.page,
        loading: false,
        error: null,
      };
    case "FETCH_ERROR":
      return {
        ...state,
        products: [],
        pagination: null,
        loading: false,
        error: action.error,
      };
    case "NO_TOKEN":
      return {
        ...state,
        loading: false,
        error: "No authentication token found",
      };
    default:
      return state;
  }
}

export const useLowStock = (
  options: UseLowStockOptions = {}
): UseLowStockReturn => {
  // react-doctor-disable-next-line react-doctor/no-event-handler -- initialization fetch controlled by autoFetch option, not a user event
  const { limit = 10, threshold = 10, autoFetch = true } = options;
  const [state, dispatch] = useReducer(lowStockReducer, initialLowStockState);

  const { token } = useAppSelector((state) => state.auth);

  const fetchLowStockProducts = useCallback(
    async (page: number = 1) => {
      if (!token) {
        dispatch({ type: "NO_TOKEN" });
        return;
      }

      try {
        dispatch({ type: "FETCH_START", page });

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
          dispatch({
            type: "FETCH_SUCCESS",
            page,
            products: result.data.items || [],
            pagination: result.data.pagination || null,
          });
          return;
        }

        throw new Error(result.message || "Failed to fetch low stock products");
      } catch (err) {
        dispatch({
          type: "FETCH_ERROR",
          error: err instanceof Error ? err.message : "An error occurred",
        });
      }
    },
    [token, limit, threshold]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      fetchLowStockProducts(page);
    },
    [fetchLowStockProducts]
  );

  const refetch = useCallback(() => {
    return fetchLowStockProducts(state.currentPage);
  }, [fetchLowStockProducts, state.currentPage]);

  useEffect(() => {
    if (autoFetch && token) {
      // react-doctor-disable-next-line react-doctor/no-pass-data-to-parent -- initialization fetch, data flows down via hook return value
      fetchLowStockProducts(1);
    }
  }, [autoFetch, token, fetchLowStockProducts]);

  return {
    products: state.products,
    pagination: state.pagination,
    currentPage: state.currentPage,
    loading: state.loading,
    error: state.error,
    handlePageChange,
    refetch,
  };
};
