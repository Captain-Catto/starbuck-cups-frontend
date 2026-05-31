import { useCallback, useEffect, useReducer, useRef } from "react";
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

interface OrderDetailState {
  order: OrderDetailData | null;
  loading: boolean;
  updating: boolean;
  error: string | null;
}

type OrderDetailAction =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: OrderDetailData }
  | { type: "FETCH_ERROR"; payload: string }
  | { type: "UPDATE_START" }
  | { type: "UPDATE_SUCCESS"; status: string }
  | { type: "UPDATE_ERROR"; payload: string }
  | { type: "UPDATE_FINISH" }
  | { type: "CLEAR_ERROR" };

const initialOrderDetailState: OrderDetailState = {
  order: null,
  loading: true,
  updating: false,
  error: null,
};

function orderDetailReducer(
  state: OrderDetailState,
  action: OrderDetailAction
): OrderDetailState {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return { ...state, order: action.payload, loading: false, error: null };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };
    case "UPDATE_START":
      return { ...state, updating: true, error: null };
    case "UPDATE_SUCCESS":
      return {
        ...state,
        order: state.order ? { ...state.order, status: action.status } : null,
      };
    case "UPDATE_ERROR":
      return { ...state, error: action.payload };
    case "UPDATE_FINISH":
      return { ...state, updating: false };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
}

export function useOrderDetail(orderId: string): UseOrderDetailReturn {
  const [{ order, loading, updating, error }, dispatch] = useReducer(
    orderDetailReducer,
    initialOrderDetailState
  );

  const fetchControllerRef = useRef<AbortController | null>(null);
  const token = useSelector((state: RootState) => state.auth.token);

  const fetchOrder = useCallback(async () => {
    if (!orderId || !token) return;

    if (fetchControllerRef.current) {
      fetchControllerRef.current.abort();
    }
    const controller = new AbortController();
    fetchControllerRef.current = controller;

    dispatch({ type: "FETCH_START" });
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
        dispatch({ type: "FETCH_SUCCESS", payload: data.data });
      } else {
        dispatch({
          type: "FETCH_ERROR",
          payload: data.message || "Không thể tải thông tin đơn hàng",
        });
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      dispatch({
        type: "FETCH_ERROR",
        payload: "Lỗi kết nối. Vui lòng thử lại.",
      });
    }
  }, [orderId, token]);

  const updateStatus = useCallback(
    async (newStatus: string): Promise<boolean> => {
      if (!orderId || !token || !order) return false;

      dispatch({ type: "UPDATE_START" });
      try {
        const response = await fetch(`/api/admin/orders/${orderId}/status`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        });

        const data = await response.json();

        if (data.success) {
          invalidateOrderDependentCaches();
          dispatch({ type: "UPDATE_SUCCESS", status: newStatus });
          await fetchOrder();
          return true;
        }

        dispatch({
          type: "UPDATE_ERROR",
          payload: data.message || "Không thể cập nhật trạng thái đơn hàng",
        });
        return false;
      } catch {
        dispatch({
          type: "UPDATE_ERROR",
          payload: "Lỗi kết nối. Vui lòng thử lại.",
        });
        return false;
      } finally {
        dispatch({ type: "UPDATE_FINISH" });
      }
    },
    [orderId, token, order, fetchOrder]
  );

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  useEffect(() => {
    // react-doctor-disable-next-line react-doctor/no-event-handler -- initialization fetch triggered by auth token and order ID availability
    if (orderId && token) {
      fetchOrder();
    }
  }, [orderId, token, fetchOrder]);

  useEffect(() => {
    const controller = fetchControllerRef.current;
    return () => {
      controller?.abort();
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
