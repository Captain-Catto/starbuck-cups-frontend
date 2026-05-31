"use client";

import { useState, useEffect, useCallback, useReducer } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import type { RootState } from "@/store";

export interface CustomerAdmin {
  id: string;
  messengerId?: string | null;
  zaloId?: string | null;
  fullName?: string;
  notes?: string | null;
  isVip?: boolean;
  createdAt: string;
  updatedAt: string;
  createdByAdminId: string;
  lastOrderDate?: string;
  totalSpent?: number;
  customerPhones?: Array<{
    id: string;
    phoneNumber: string;
    isMain: boolean;
  }>;
  addresses?: Array<{
    id: string;
    customerId: string;
    addressLine: string;
    ward?: string | null;
    district?: string | null;
    city: string;
    postalCode?: string | null;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
  orders?: Array<{
    createdAt: string;
  }>;
  createdByAdmin: {
    username: string;
    email: string;
  };
  _count?: {
    orders: number;
  };
}

interface ConfirmModal {
  show: boolean;
  customer: CustomerAdmin | null;
  action: "delete";
}

interface CustomersState {
  customers: CustomerAdmin[];
  loading: boolean;
  actionLoading: string | null;
}

type CustomersAction =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: CustomerAdmin[] }
  | { type: "FETCH_ERROR" }
  | { type: "ACTION_START"; payload: string }
  | { type: "ACTION_FINISH" };

const initialCustomersState: CustomersState = {
  customers: [],
  loading: true,
  actionLoading: null,
};

function customersReducer(
  state: CustomersState,
  action: CustomersAction
): CustomersState {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return { ...state, customers: action.payload, loading: false };
    case "FETCH_ERROR":
      return { ...state, loading: false };
    case "ACTION_START":
      return { ...state, actionLoading: action.payload };
    case "ACTION_FINISH":
      return { ...state, actionLoading: null };
    default:
      return state;
  }
}

export function useAdminCustomers(
  search = "",
  vipStatus = "all",
  dateFrom = "",
  dateTo = ""
) {
  const token = useSelector((state: RootState) => state.auth.token);

  const [{ customers, loading, actionLoading }, dispatchState] = useReducer(
    customersReducer,
    initialCustomersState
  );
  const [confirmModal, setConfirmModal] = useState<ConfirmModal>({
    show: false,
    customer: null,
    action: "delete",
  });

  const getAuthHeaders = useCallback((): Record<string, string> => {
    const baseHeaders = { "Content-Type": "application/json" };
    return token
      ? { ...baseHeaders, Authorization: `Bearer ${token}` }
      : baseHeaders;
  }, [token]);

  const fetchCustomers = useCallback(async () => {
    try {
      dispatchState({ type: "FETCH_START" });
      const params = new URLSearchParams({ page: "1", limit: "50" });
      if (search) params.set("search", search);
      if (vipStatus !== "all") params.set("vipStatus", vipStatus);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);

      const response = await fetch(`/api/admin/customers?${params}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error("Failed to fetch customers");

      const data = await response.json();
      if (data.success) {
        dispatchState({
          type: "FETCH_SUCCESS",
          payload: data.data.items || [],
        });
      } else {
        throw new Error(data.message || "Failed to fetch customers");
      }
    } catch {
      toast.error("Lỗi khi tải danh sách khách hàng");
      dispatchState({ type: "FETCH_ERROR" });
    }
  }, [getAuthHeaders, search, vipStatus, dateFrom, dateTo]);

  const handleDelete = (customer: CustomerAdmin) => {
    setConfirmModal({ show: true, customer, action: "delete" });
  };

  const performDelete = async (customer: CustomerAdmin) => {
    dispatchState({ type: "ACTION_START", payload: `delete-${customer.id}` });
    try {
      const response = await fetch(`/api/admin/customers/${customer.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error("Failed to delete customer");

      const data = await response.json();
      if (data.success) {
        toast.success("Xóa khách hàng thành công");
        await fetchCustomers();
      } else {
        throw new Error(data.message || "Failed to delete customer");
      }
    } catch {
      toast.error("Lỗi khi xóa khách hàng");
    } finally {
      dispatchState({ type: "ACTION_FINISH" });
    }
  };

  useEffect(() => {
    if (token) fetchCustomers();
  }, [fetchCustomers, token]);

  return {
    customers,
    loading,
    actionLoading,
    confirmModal,
    handleDelete,
    performDelete,
    fetchCustomers,
    setConfirmModal,
  };
}
