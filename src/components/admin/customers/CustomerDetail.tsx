"use client";

import { useReducer, useEffect, useCallback, useRef } from "react";
import { useAppSelector } from "@/store";
import { OrderHistory } from "./OrderHistory";
import { PhoneManager } from "./PhoneManager";
import { AddressManager } from "./AddressManager";
import { CustomerInfoManager } from "./CustomerInfoManager";

interface Customer {
  id: string;
  messengerId?: string | null;
  zaloId?: string | null;
  fullName: string;
  notes?: string | null;
  isVip?: boolean;
  createdAt: string;
  updatedAt: string;
  createdByAdminId: string;
  createdByAdmin: {
    username: string;
    email: string;
  };
  addresses: Array<{
    id: string;
    customerId: string;
    addressLine: string;
    district?: string | null;
    city: string;
    postalCode?: string | null;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
  orders?: Array<{
    id: string;
    createdAt: string;
    status?: string;
    totalAmount?: number;
  }>;
  _count?: {
    orders: number;
  };
}

interface CustomerState {
  customer: Customer | null;
  loading: boolean;
  error: string | null;
}

type CustomerAction =
  | { type: "RESET"; customerId: string }
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: Customer }
  | { type: "FETCH_ERROR"; payload: string }
  | { type: "SET_LOADING"; payload: boolean };

const initialCustomerState: CustomerState = {
  customer: null,
  loading: true,
  error: null,
};

function customerReducer(state: CustomerState, action: CustomerAction): CustomerState {
  switch (action.type) {
    case "RESET":
      return {
        customer: null,
        loading: true,
        error: null,
      };
    case "FETCH_START":
      return {
        ...state,
        loading: true,
        error: null,
      };
    case "FETCH_SUCCESS":
      return {
        customer: action.payload,
        loading: false,
        error: null,
      };
    case "FETCH_ERROR":
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
}

interface CustomerDetailProps {
  customerId: string;
}

export function CustomerDetail({ customerId }: CustomerDetailProps) {
  const [state, dispatch] = useReducer(customerReducer, initialCustomerState);
  const { customer, loading, error } = state;

  const prevCustomerIdRef = useRef(customerId);
  if (customerId !== prevCustomerIdRef.current) {
    prevCustomerIdRef.current = customerId;
    dispatch({ type: "RESET", customerId });
  }

  // Get auth state from Redux store
  const token = useAppSelector((state) => state.auth.token);
  const sessionChecked = useAppSelector((state) => state.auth.sessionChecked);

  const fetchCustomer = useCallback(async () => {
    if (!token) return;
    try {
      dispatch({ type: "FETCH_START" });

      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const response = await fetch(`/api/admin/customers/${customerId}`, {
        headers,
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch customer");
      }

      dispatch({ type: "FETCH_SUCCESS", payload: data.data });
    } catch (error) {
      dispatch({
        type: "FETCH_ERROR",
        payload: error instanceof Error ? error.message : "Failed to fetch customer",
      });
    }
  }, [customerId, token]);

  useEffect(() => {
    if (sessionChecked) {
      if (token) {
        fetchCustomer();
      } else {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    }
  }, [sessionChecked, token, fetchCustomer]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-600 rounded w-1/4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-600 rounded w-3/4"></div>
              <div className="h-4 bg-gray-600 rounded w-1/2"></div>
              <div className="h-4 bg-gray-600 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="text-center text-red-400">
          <div className="text-lg font-medium mb-2 text-white">
            Lỗi khi tải thông tin khách hàng
          </div>
          <div className="text-sm">{error}</div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="text-center text-gray-400">
          Không tìm thấy thông tin khách hàng
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Customer Overview */}
      <CustomerInfoManager
        customer={customer}
        onCustomerUpdate={fetchCustomer}
      />

      {/* Phone Numbers */}
      <PhoneManager customerId={customerId} />

      {/* Addresses */}
      <AddressManager customerId={customerId} />

      {/* Order Statistics */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Thống kê đơn hàng
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {customer._count?.orders || 0}
            </div>
            <div className="text-sm text-gray-400">Tổng đơn hàng</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {customer.orders?.length || 0}
            </div>
            <div className="text-sm text-gray-400">Đơn hàng gần đây</div>
          </div>
        </div>

        {customer.notes && (
          <div className="mt-4 pt-4 border-t border-gray-600">
            <h4 className="font-medium text-white mb-2">Ghi chú</h4>
            <p className="text-sm text-gray-300">{customer.notes}</p>
          </div>
        )}
      </div>

      {/* Order History Section */}
      <OrderHistory customerId={customerId} itemsPerPage={6} />
    </div>
  );
}
