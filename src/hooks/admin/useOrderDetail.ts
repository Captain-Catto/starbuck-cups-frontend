import { useState, useCallback, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { invalidateOrderDependentCaches } from "@/lib/adminCacheInvalidation";
export interface OrderDetailData {
  id: string;
  orderNumber: string;
  status: string;
  orderType: string;
  totalAmount: string;
  shippingCost: string;
  isFreeShipping: boolean;
  customDescription?: string;
  customer: {
    id: string;
    fullName?: string;
    email?: string;
    customerPhones?: Array<{
      id: string;
      phoneNumber: string;
      isMain: boolean;
    }>;
  };
  deliveryAddress?: {
    city?: string;
    district?: string;
    addressLine?: string;
    postalCode?: string;
  };
  items?: Array<{
    id: string;
    productId?: string;
    quantity: number;
    price: string;
    product?: {
      name: string;
      imageUrl?: string;
    };
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface UseOrderDetailReturn {
  order: OrderDetailData | null;
  loading: boolean;
  updating: boolean;
  error: string | null;
  fetchOrder: () => Promise<void>;
  updateStatus: (newStatus: string) => Promise<boolean>;
  clearError: () => void;
}

export function useOrderDetail(orderId: string): UseOrderDetailReturn {
  const [order, setOrder] = useState<OrderDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchControllerRef = useRef<AbortController | null>(null);
  const token = useSelector((state: RootState) => state.auth.token);

  const fetchOrder = useCallback(async () => {
    if (!orderId || !token) return;

    if (fetchControllerRef.current) {
      fetchControllerRef.current.abort();
    }
    const controller = new AbortController();
    fetchControllerRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      const data = await response.json();

      if (data.success) {
        setOrder(data.data);
      } else {
        setError(data.message || "Không thể tải thông tin đơn hàng");
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [orderId, token]);

  // Update order status
  const updateStatus = useCallback(
    async (newStatus: string): Promise<boolean> => {
      if (!orderId || !token || !order) return false;

      setUpdating(true);
      setError(null);
      try {
        const authHeaders: Record<string, string> = {
          Authorization: `Bearer ${token}`,
        };
        const response = await fetch(`/api/admin/orders/${orderId}/status`, {
          method: "PATCH",
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        });

        const data = await response.json();

        if (data.success) {
          invalidateOrderDependentCaches();
          setOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
          // Refresh order data to get latest info
          await fetchOrder();
          return true;
        } else {
          setError(data.message || "Không thể cập nhật trạng thái đơn hàng");
          return false;
        }
      } catch {
        setError("Lỗi kết nối. Vui lòng thử lại.");
        return false;
      } finally {
        setUpdating(false);
      }
    },
    [orderId, token, order, fetchOrder]
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (orderId && token) {
      fetchOrder();
    }
  }, [orderId, token, fetchOrder]);

  useEffect(() => {
    return () => {
      fetchControllerRef.current?.abort();
    };
  }, []);

  return {
    order,
    loading,
    updating,
    error,
    fetchOrder,
    updateStatus,
    clearError,
  };
}

