"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type { PaginationMeta } from "@/types";

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

export function useCustomers(
  options: UseCustomersOptions = {}
): UseCustomersReturn {
  const { initialPage = 1, initialLimit = 10, autoFetch = true } = options;

  const [customers, setCustomers] = useState<CustomerAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta>({
    current_page: initialPage,
    has_next: false,
    has_prev: false,
    per_page: initialLimit,
    total_items: 0,
    total_pages: 0,
  });
  const [currentSearchTerm, setCurrentSearchTerm] = useState<string>("");

  const getAuthHeaders = (): Record<string, string> => {
    if (typeof window === "undefined") return {};
    const token = localStorage.getItem("admin_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchCustomers = useCallback(
    async (
      searchTerm?: string,
      vipStatus?: string,
      dateFrom?: string,
      dateTo?: string
    ) => {
      try {
        setLoading(true);
        setError(null);

        const search =
          searchTerm !== undefined ? searchTerm : currentSearchTerm;
        setCurrentSearchTerm(search);

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
          setCustomers(data.data.items || []);
          if (data.data?.pagination) {
            setPagination(data.data.pagination);
          }
        } else {
          const errorMsg = data.message || "Không thể tải danh sách khách hàng";
          setError(errorMsg);
          toast.error(errorMsg);
        }
      } catch (err) {
        const errorMsg = "Có lỗi xảy ra khi tải danh sách khách hàng";
        setError(errorMsg);
        toast.error(errorMsg);

      } finally {
        setLoading(false);
      }
    },
    [pagination.current_page, pagination.per_page, currentSearchTerm]
  );

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, current_page: page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setPagination((prev) => ({ ...prev, per_page: limit, current_page: 1 }));
  }, []);

  const refetch = useCallback(() => {
    return fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    if (autoFetch) {
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
