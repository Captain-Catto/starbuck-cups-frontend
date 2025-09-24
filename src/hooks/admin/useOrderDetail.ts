import { useState, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

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
    phone?: string;
    email?: string;
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

  // Get auth token from Redux store
  const token = useSelector((state: RootState) => state.auth.token);

  // Fetch order detail
  const fetchOrder = useCallback(async () => {
    if (!orderId || !token) return;

    setLoading(true);
    setError(null);
    try {
      const authHeaders: Record<string, string> = {
        Authorization: `Bearer ${token}`,
      };
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        headers: {
          ...authHeaders,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("Order detail response:", data);

      if (data.success) {
        setOrder(data.data);
      } else {
        setError(data.message || "Không thể tải thông tin đơn hàng");
      }
    } catch (error) {
      console.error("Error fetching order detail:", error);
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
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
        console.log("Update status response:", data);

        if (data.success) {
          setOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
          // Refresh order data to get latest info
          await fetchOrder();
          return true;
        } else {
          setError(data.message || "Không thể cập nhật trạng thái đơn hàng");
          return false;
        }
      } catch (error) {
        console.error("Error updating order status:", error);
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

  // Auto fetch order on mount and when orderId/token changes
  useEffect(() => {
    if (orderId && token) {
      fetchOrder();
    }
  }, [orderId, token, fetchOrder]);

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
