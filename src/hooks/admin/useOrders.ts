import { useState, useCallback, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
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

export function useOrders(filters: OrderFilters): UseOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<OrderPagination>({
    current_page: 1,
    per_page: 20,
    total_pages: 1,
    total_items: 0,
    has_next: false,
    has_prev: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(
    filters.searchTerm
  );
  const requestControllerRef = useRef<AbortController | null>(null);

  // Get auth token from Redux store
  const token = useSelector((state: RootState) => state.auth.token);

  // Debounce search to avoid flooding API while typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(filters.searchTerm);
    }, 350);

    return () => clearTimeout(timer);
  }, [filters.searchTerm]);

  // Reset to first page when filters change
  useEffect(() => {
    setPagination((prev) =>
      prev.current_page === 1 ? prev : { ...prev, current_page: 1 }
    );
  }, [
    debouncedSearchTerm,
    filters.statusFilter,
    filters.typeFilter,
    filters.dateFrom,
    filters.dateTo,
    filters.priceRange,
    filters.freeShipping,
  ]);

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
      params.set("page", (page || pagination.current_page).toString());
      params.set("limit", (limit || pagination.per_page).toString());

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
      pagination.current_page,
      pagination.per_page,
    ]
  );

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    if (requestControllerRef.current) {
      requestControllerRef.current.abort();
    }

    const controller = new AbortController();
    requestControllerRef.current = controller;

    setLoading(true);
    setError(null);

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
        setOrders(data.data?.items || []);

        if (data.data?.pagination) {
          setPagination(data.data.pagination);
        }
      } else {
        setError(data.message || "Không thể tải danh sách đơn hàng");
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [token, buildQueryParams]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Set page
  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, current_page: page }));
  }, []);

  // Fetch orders when filters or pagination changes
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Cleanup pending request on unmount
  useEffect(() => {
    return () => {
      if (requestControllerRef.current) {
        requestControllerRef.current.abort();
      }
    };
  }, []);

  return {
    orders,
    pagination,
    loading,
    error,
    fetchOrders,
    clearError,
    setPage,
  };
}
