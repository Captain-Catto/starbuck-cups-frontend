"use client";

import { useReducer, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import type { PaginationMeta } from "@/types";
import type { RootState } from "@/store";

export interface CustomerAdmin {
  id: string;
  messengerId: string;
  fullName?: string;
  phone?: string;
  notes?: string;
  isVip?: boolean;
  createdAt: string;
  updatedAt: string;
  lastOrderDate?: string;
  totalSpent?: number;
  createdByAdmin: {
    id: string;
    username: string;
  };
  addresses: Array<{
    id: string;
    addressLine: string;
    district?: string;
    city: string;
    postalCode?: string;
    isDefault: boolean;
  }>;
  orders: Array<{
    createdAt: string;
  }>;
  _count: {
    orders: number;
  };
}

export interface UseCustomersOptions {
  initialPage?: number;
  initialLimit?: number;
  autoFetch?: boolean;
  vipStatus?: string;
}

export interface UseCustomersReturn {
  customers: CustomerAdmin[];
  pagination: PaginationMeta;
  loading: boolean;
  error: string | null;
  fetchCustomers: (
    searchTerm?: string,
    vipStatus?: string,
    dateFrom?: string,
    dateTo?: string
  ) => Promise<void>;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  refetch: () => Promise<void>;
}

interface CustomersState {
  customers: CustomerAdmin[];
  pagination: PaginationMeta;
  loading: boolean;
  error: string | null;
  currentSearchTerm: string;
}

type CustomersAction =
  | { type: "FETCH_START"; searchTerm: string }
  | {
      type: "FETCH_SUCCESS";
      customers: CustomerAdmin[];
      pagination?: PaginationMeta;
    }
  | { type: "FETCH_ERROR"; error: string }
  | { type: "SET_PAGE"; page: number }
  | { type: "SET_LIMIT"; limit: number };

function customersReducer(
  state: CustomersState,
  action: CustomersAction
): CustomersState {
  switch (action.type) {
    case "FETCH_START":
      return {
        ...state,
        loading: true,
        error: null,
        currentSearchTerm: action.searchTerm,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        customers: action.customers,
        pagination: action.pagination ?? state.pagination,
        loading: false,
      };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.error };
    case "SET_PAGE":
      return {
        ...state,
        pagination: { ...state.pagination, current_page: action.page },
      };
    case "SET_LIMIT":
      return {
        ...state,
        pagination: {
          ...state.pagination,
          per_page: action.limit,
          current_page: 1,
        },
      };
    default:
      return state;
  }
}

export function useCustomers(
  options: UseCustomersOptions = {}
): UseCustomersReturn {
  // react-doctor-disable-next-line react-doctor/no-event-handler -- initialization fetch controlled by autoFetch option, not a user event
  const { initialPage = 1, initialLimit = 10, autoFetch = true } = options;

  const [state, dispatch] = useReducer(customersReducer, {
    customers: [],
    pagination: {
      current_page: initialPage,
      has_next: false,
      has_prev: false,
      per_page: initialLimit,
      total_items: 0,
      total_pages: 0,
    },
    loading: true,
    error: null,
    currentSearchTerm: "",
  });
  const { customers, pagination, loading, error, currentSearchTerm } = state;

  const token = useSelector((state: RootState) => state.auth.token);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  const fetchCustomers = useCallback(
    async (
      searchTerm?: string,
      vipStatus?: string,
      dateFrom?: string,
      dateTo?: string
    ) => {
      try {
        const search =
          searchTerm !== undefined ? searchTerm : currentSearchTerm;
        dispatch({ type: "FETCH_START", searchTerm: search });

        const params = new URLSearchParams({
          page: pagination.current_page.toString(),
          limit: pagination.per_page.toString(),
          ...(search && { search }),
          ...(vipStatus && vipStatus !== "all" && { vipStatus }),
          ...(dateFrom && { dateFrom }),
          ...(dateTo && { dateTo }),
        });

        const response = await fetch(`/api/admin/customers?${params}`, {
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          dispatch({
            type: "FETCH_SUCCESS",
            customers: data.data.items || [],
            pagination: data.data?.pagination,
          });
        } else {
          const errorMsg = data.message || "Không thể tải danh sách khách hàng";
          dispatch({ type: "FETCH_ERROR", error: errorMsg });
          toast.error(errorMsg);
        }
      } catch {
        const errorMsg = "Có lỗi xảy ra khi tải danh sách khách hàng";
        dispatch({ type: "FETCH_ERROR", error: errorMsg });
        toast.error(errorMsg);
      }
    },
    [pagination.current_page, pagination.per_page, currentSearchTerm, getAuthHeaders]
  );

  const setPage = useCallback((page: number) => {
    dispatch({ type: "SET_PAGE", page });
  }, []);

  const setLimit = useCallback((limit: number) => {
    dispatch({ type: "SET_LIMIT", limit });
  }, []);

  const refetch = useCallback(() => {
    return fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    if (autoFetch) {
      // react-doctor-disable-next-line react-doctor/no-pass-data-to-parent -- initialization fetch, data flows down via hook return value
      fetchCustomers();
    }
  }, [pagination.current_page, pagination.per_page, autoFetch, fetchCustomers]);

  return {
    customers,
    pagination,
    loading,
    error,
    fetchCustomers,
    setPage,
    setLimit,
    refetch,
  };
}
