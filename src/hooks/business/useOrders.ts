"use client";


import { useReducer, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import type { RootState } from "@/store";

export interface OrderItem {
  id: string;
  productId?: string;
  product?: {
    id: string;
    name: string;
    imageUrl?: string;
  };
  quantity: number;
  price: number;
  customizations?: string;
}

export interface Order {
  id: string;
  customerId: string;
  orderNumber: string;
  status: "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  totalAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    fullName?: string;
    phone?: string;
    messengerId: string;
  };
  orderItems: OrderItem[];
  shippingAddress?: {
    addressLine: string;
    district?: string;
    city: string;
    postalCode?: string;
  };
}

export interface OrderFilters {
  status?: string;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface OrderPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UseOrdersOptions {
  initialPage?: number;
  initialLimit?: number;
  initialFilters?: OrderFilters;
  autoFetch?: boolean;
}

export interface UseOrdersReturn {
  orders: Order[];
  pagination: OrderPagination;
  filters: OrderFilters;
  loading: boolean;
  error: string | null;
  fetchOrders: () => Promise<void>;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setFilters: (filters: Partial<OrderFilters>) => void;
  clearFilters: () => void;
  refetch: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order["status"]) => Promise<void>;
}

interface OrdersState {
  orders: Order[];
  pagination: OrderPagination;
  filters: OrderFilters;
  loading: boolean;
  error: string | null;
}

type OrdersAction =
  | { type: "FETCH_START" }
  | {
      type: "FETCH_SUCCESS";
      orders: Order[];
      pagination?: Partial<OrderPagination>;
    }
  | { type: "FETCH_ERROR"; error: string }
  | { type: "SET_PAGE"; page: number }
  | { type: "SET_LIMIT"; limit: number }
  | { type: "SET_FILTERS"; filters: Partial<OrderFilters> }
  | { type: "CLEAR_FILTERS" }
  | { type: "UPDATE_STATUS"; orderId: string; status: Order["status"] };

function ordersReducer(state: OrdersState, action: OrdersAction): OrdersState {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return {
        ...state,
        orders: action.orders,
        pagination: action.pagination
          ? { ...state.pagination, ...action.pagination }
          : state.pagination,
        loading: false,
      };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.error };
    case "SET_PAGE":
      return {
        ...state,
        pagination: { ...state.pagination, page: action.page },
      };
    case "SET_LIMIT":
      return {
        ...state,
        pagination: { ...state.pagination, limit: action.limit, page: 1 },
      };
    case "SET_FILTERS":
      return {
        ...state,
        filters: { ...state.filters, ...action.filters },
        pagination: { ...state.pagination, page: 1 },
      };
    case "CLEAR_FILTERS":
      return {
        ...state,
        filters: {},
        pagination: { ...state.pagination, page: 1 },
      };
    case "UPDATE_STATUS":
      return {
        ...state,
        orders: state.orders.map((order) =>
          order.id === action.orderId ? { ...order, status: action.status } : order
        ),
      };
    default:
      return state;
  }
}

export function useOrders(options: UseOrdersOptions = {}): UseOrdersReturn {
  const {
    initialPage = 1,
    initialLimit = 10,
    initialFilters = {},
    autoFetch = true,
  // react-doctor-disable-next-line react-doctor/no-event-handler -- initialization fetch re-runs on pagination/filter change, not a user event
  } = options;

  const [state, dispatch] = useReducer(ordersReducer, {
    orders: [],
    pagination: {
      page: initialPage,
      limit: initialLimit,
      total: 0,
      totalPages: 0,
    },
    filters: initialFilters,
    loading: true,
    error: null,
  });
  const { orders, pagination, filters, loading, error } = state;

  const token = useSelector((state: RootState) => state.auth.token);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  const fetchOrders = useCallback(async () => {
    try {
      dispatch({ type: "FETCH_START" });

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...Object.entries(filters).reduce((acc, [key, value]) => {
          if (value) acc[key] = value;
          return acc;
        }, {} as Record<string, string>),
      });

      const response = await fetch(`/api/admin/orders?${params}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        dispatch({
          type: "FETCH_SUCCESS",
          orders: data.data.items || [],
          pagination: data.data?.pagination
            ? {
            total: data.data.pagination.total_items || 0,
            totalPages: data.data.pagination.total_pages || 0,
              }
            : undefined,
        });
      } else {
        const errorMsg = data.message || "Không thể tải danh sách đơn hàng";
        dispatch({ type: "FETCH_ERROR", error: errorMsg });
        toast.error(errorMsg);
      }
    } catch {
      const errorMsg = "Có lỗi xảy ra khi tải danh sách đơn hàng";
      dispatch({ type: "FETCH_ERROR", error: errorMsg });
      toast.error(errorMsg);
    }
  }, [pagination.page, pagination.limit, filters, getAuthHeaders]);

  const setPage = useCallback((page: number) => {
    dispatch({ type: "SET_PAGE", page });
  }, []);

  const setLimit = useCallback((limit: number) => {
    dispatch({ type: "SET_LIMIT", limit });
  }, []);

  const setFilters = useCallback((newFilters: Partial<OrderFilters>) => {
    dispatch({ type: "SET_FILTERS", filters: newFilters });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: "CLEAR_FILTERS" });
  }, []);

  const refetch = useCallback(() => {
    return fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = useCallback(async (orderId: string, status: Order["status"]) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        dispatch({ type: "UPDATE_STATUS", orderId, status });
        toast.success("Cập nhật trạng thái đơn hàng thành công");
      } else {
        throw new Error(data.message || "Không thể cập nhật trạng thái đơn hàng");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Có lỗi xảy ra khi cập nhật trạng thái";
      toast.error(errorMsg);
      throw err;
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    if (autoFetch) {
      // react-doctor-disable-next-line react-doctor/no-pass-data-to-parent -- initialization fetch, data flows down via hook return value
      fetchOrders();
    }
  }, [pagination.page, pagination.limit, filters, autoFetch, fetchOrders]);

  return {
    orders,
    pagination,
    filters,
    loading,
    error,
    fetchOrders,
    setPage,
    setLimit,
    setFilters,
    clearFilters,
    refetch,
    updateOrderStatus,
  };
}
