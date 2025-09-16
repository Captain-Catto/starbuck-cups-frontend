"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export interface Customer {
  id: string;
  messengerId: string;
  fullName?: string;
  phone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
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
}

export interface CustomerPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UseCustomersOptions {
  initialPage?: number;
  initialLimit?: number;
  autoFetch?: boolean;
}

export interface UseCustomersReturn {
  customers: Customer[];
  pagination: CustomerPagination;
  loading: boolean;
  error: string | null;
  fetchCustomers: (searchTerm?: string) => Promise<void>;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  refetch: () => Promise<void>;
}

export function useCustomers(options: UseCustomersOptions = {}): UseCustomersReturn {
  const {
    initialPage = 1,
    initialLimit = 10,
    autoFetch = true,
  } = options;

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<CustomerPagination>({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
  });
  const [currentSearchTerm, setCurrentSearchTerm] = useState<string>("");

  const getAuthHeaders = (): Record<string, string> => {
    if (typeof window === "undefined") return {};
    const token = localStorage.getItem("admin_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchCustomers = useCallback(async (searchTerm?: string) => {
    try {
      setLoading(true);
      setError(null);

      const search = searchTerm !== undefined ? searchTerm : currentSearchTerm;
      setCurrentSearchTerm(search);

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
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
          setPagination(prev => ({
            ...prev,
            total: data.data.pagination.total_items || 0,
            totalPages: data.data.pagination.total_pages || 0,
          }));
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
      console.error("Error fetching customers:", err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, currentSearchTerm]);

  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  const refetch = useCallback(() => {
    return fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    if (autoFetch) {
      fetchCustomers();
    }
  }, [pagination.page, pagination.limit]);

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