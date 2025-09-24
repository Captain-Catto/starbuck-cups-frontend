import { useState, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

export interface Order {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    fullName?: string;
    phone?: string;
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
  const [loading, setLoading] = useState(false); // Bắt đầu với false
  const [error, setError] = useState<string | null>(null);

  // Get auth token from Redux store
  const token = useSelector((state: RootState) => state.auth.token);

  // Build query parameters from filters
  const buildQueryParams = useCallback(
    (filters: OrderFilters, page?: number, limit?: number): string => {
      const params = new URLSearchParams();

      if (filters.searchTerm) params.set("search", filters.searchTerm);
      if (filters.statusFilter) params.set("status", filters.statusFilter);
      if (filters.typeFilter) params.set("orderType", filters.typeFilter);
      if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.set("dateTo", filters.dateTo);
      if (filters.priceRange) params.set("priceRange", filters.priceRange);
      if (filters.freeShipping)
        params.set("freeShipping", filters.freeShipping);

      // Add pagination parameters
      params.set("page", (page || pagination.current_page).toString());
      params.set("limit", (limit || pagination.per_page).toString());

      return params.toString();
    },
    [pagination.current_page, pagination.per_page]
  );

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const authHeaders: Record<string, string> = token
        ? { Authorization: `Bearer ${token}` }
        : {};
      const queryParams = buildQueryParams(filters);
      const url = `/api/admin/orders${queryParams ? `?${queryParams}` : ""}`;

      const response = await fetch(url, {
        headers: authHeaders,
      });

      const data = await response.json();
      console.log("Orders response:", data);

      if (data.success) {
        // API response structure: {success: true, data: {items: [...], pagination: {...}}}
        setOrders(data.data?.items || []);

        // Update pagination state
        if (data.data?.pagination) {
          setPagination(data.data.pagination);
        }
      } else {
        setError(data.message || "Không thể tải danh sách đơn hàng");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      // Đảm bảo skeleton hiển thị ít nhất 500ms để UX tốt hơn
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  }, [token, filters, buildQueryParams]);

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
