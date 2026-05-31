import { useState, useCallback, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useReducer } from "react";
import type { RootState } from "@/store";

export interface Order {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    fullName?: string;
    customerPhones?: Array<{
      id: string;
      phoneNumber: string;
      isMain: boolean;
    }>;
  };
  orderType: "PRODUCT" | "CUSTOM";
  status: string;
  totalAmount: string;
  shippingCost: string;
  isFreeShipping: boolean;
  customDescription?: string;
  deliveryAddress?: {
    city?: string;
    district?: string;
    addressLine?: string;
    postalCode?: string;
  };
  _count?: {
    items: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OrderFilters {
  searchTerm: string;
  statusFilter: string;
  typeFilter: string;
  dateFrom?: string;
  dateTo?: string;
  priceRange?: string;
  freeShipping?: string;
}

export interface OrderPagination {
  current_page: number;
  per_page: number;
  total_pages: number;
  total_items: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface UseOrdersReturn {
  orders: Order[];
  pagination: OrderPagination;
  loading: boolean;
  error: string | null;
  fetchOrders: () => Promise<void>;
  clearError: () => void;
  setPage: (page: number) => void;
}

interface OrdersState {
  orders: Order[];
  pagination: OrderPagination;
  loading: boolean;
  error: string | null;
  filterKey: string;
}

type OrdersAction =
  | { type: "FETCH_START"; filterKey: string }
  | { type: "FETCH_SUCCESS"; orders: Order[]; pagination?: OrderPagination }
  | { type: "FETCH_ERROR"; error: string }
  | { type: "CLEAR_ERROR" }
  | { type: "SET_PAGE"; page: number };

const initialPagination: OrderPagination = {
  current_page: 1,
  per_page: 20,
  total_pages: 1,
  total_items: 0,
  has_next: false,
  has_prev: false,
};

function ordersReducer(state: OrdersState, action: OrdersAction): OrdersState {
  switch (action.type) {
    case "FETCH_START":
      return {
        ...state,
        loading: true,
        error: null,
        filterKey: action.filterKey,
        pagination:
          action.filterKey === state.filterKey
            ? state.pagination
            : { ...state.pagination, current_page: 1 },
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        orders: action.orders,
        pagination: action.pagination ?? state.pagination,
        loading: false,
      };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.error };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    case "SET_PAGE":
      return {
        ...state,
        pagination: { ...state.pagination, current_page: action.page },
      };
    default:
      return state;
  }
}

export function useOrders(filters: OrderFilters): UseOrdersReturn {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(
    filters.searchTerm
  );
  const filterKey = [
    debouncedSearchTerm,
    filters.statusFilter,
    filters.typeFilter,
    filters.dateFrom ?? "",
    filters.dateTo ?? "",
    filters.priceRange ?? "",
    filters.freeShipping ?? "",
  ].join("|");

  const [state, dispatch] = useReducer(ordersReducer, {
    orders: [],
    pagination: initialPagination,
    loading: false,
    error: null,
    filterKey,
  });
  const { orders, pagination, loading, error } = state;

  const requestControllerRef = useRef<AbortController | null>(null);
  const hasFilterChanged = filterKey !== state.filterKey;
  const queryPagination = hasFilterChanged
    ? { ...pagination, current_page: 1 }
    : pagination;

  // Get auth token from Redux store
  const token = useSelector((state: RootState) => state.auth.token);

  // Debounce search to avoid flooding API while typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(filters.searchTerm);
    }, 350);

    return () => clearTimeout(timer);
  }, [filters.searchTerm]);

  // Build query parameters from filters
  const buildQueryParams = useCallback(
    (page?: number, limit?: number): string => {
      const params = new URLSearchParams();

      const search = debouncedSearchTerm?.trim();
      if (search) params.set("search", search);

      if (filters.statusFilter && filters.statusFilter !== "all") {
        params.set("status", filters.statusFilter);
      }

      if (filters.typeFilter && filters.typeFilter !== "all") {
        const normalizedOrderType =
          filters.typeFilter === "product"
            ? "PRODUCT"
            : filters.typeFilter === "custom"
            ? "CUSTOM"
            : filters.typeFilter;
        params.set("orderType", normalizedOrderType);
      }

      if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.set("dateTo", filters.dateTo);
      if (filters.priceRange) params.set("priceRange", filters.priceRange);

      if (filters.freeShipping === "free") {
        params.set("freeShipping", "true");
      } else if (filters.freeShipping === "paid") {
        params.set("freeShipping", "false");
      }

      // Add pagination parameters
      params.set("page", (page || queryPagination.current_page).toString());
      params.set("limit", (limit || queryPagination.per_page).toString());

      return params.toString();
    },
    [
      debouncedSearchTerm,
      filters.statusFilter,
      filters.typeFilter,
      filters.dateFrom,
      filters.dateTo,
      filters.priceRange,
      filters.freeShipping,
      queryPagination.current_page,
      queryPagination.per_page,
    ]
  );

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    if (requestControllerRef.current) {
      requestControllerRef.current.abort();
    }

    const controller = new AbortController();
    requestControllerRef.current = controller;

    dispatch({ type: "FETCH_START", filterKey });

    try {
      const authHeaders: Record<string, string> = token
        ? { Authorization: `Bearer ${token}` }
        : {};
      const queryParams = buildQueryParams();
      const url = `/api/admin/orders${queryParams ? `?${queryParams}` : ""}`;

      const response = await fetch(url, {
        headers: authHeaders,
        signal: controller.signal,
      });

      const data = await response.json();

      if (data.success) {
        dispatch({
          type: "FETCH_SUCCESS",
          orders: data.data?.items || [],
          pagination: data.data?.pagination,
        });
      } else {
        dispatch({
          type: "FETCH_ERROR",
          error: data.message || "Không thể tải danh sách đơn hàng",
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      dispatch({
        type: "FETCH_ERROR",
        error: "Lỗi kết nối. Vui lòng thử lại.",
      });
    }
  }, [token, buildQueryParams, filterKey]);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  // Set page
  const setPage = useCallback((page: number) => {
    dispatch({ type: "SET_PAGE", page });
  }, []);

  // Fetch orders when filters or pagination changes
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Cleanup pending request on unmount
  useEffect(() => {
    const controller = requestControllerRef.current;
    return () => {
      if (controller) {
        controller.abort();
      }
    };
  }, []);

  return {
    orders,
    pagination: queryPagination,
    loading,
    error,
    fetchOrders,
    clearError,
    setPage,
  };
}
