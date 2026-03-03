"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

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

export function useOrders(options: UseOrdersOptions = {}): UseOrdersReturn {
  const {
    initialPage = 1,
    initialLimit = 10,
    initialFilters = {},
    autoFetch = true,
  } = options;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<OrderPagination>({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFiltersState] = useState<OrderFilters>(initialFilters);

  const getAuthHeaders = (): Record<string, string> => {
    if (typeof window === "undefined") return {};
    const token = localStorage.getItem("admin_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

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
        setOrders(data.data.items || []);
        if (data.data?.pagination) {
          setPagination(prev => ({
            ...prev,
            total: data.data.pagination.total_items || 0,
            totalPages: data.data.pagination.total_pages || 0,
          }));
        }
      } else {
        const errorMsg = data.message || "Không thể tải danh sách đơn hàng";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      const errorMsg = "Có lỗi xảy ra khi tải danh sách đơn hàng";
      setError(errorMsg);
      toast.error(errorMsg);

    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  const setFilters = useCallback((newFilters: Partial<OrderFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({});
    setPagination(prev => ({ ...prev, page: 1 }));
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
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.id === orderId ? { ...order, status } : order
          )
        );
        toast.success("Cập nhật trạng thái đơn hàng thành công");
      } else {
        throw new Error(data.message || "Không thể cập nhật trạng thái đơn hàng");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Có lỗi xảy ra khi cập nhật trạng thái";
      toast.error(errorMsg);
      throw err;
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
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