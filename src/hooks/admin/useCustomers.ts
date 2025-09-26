"use client";

import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import type { RootState } from "@/store";

export interface CustomerAdmin {
  id: string;
  messengerId?: string | null;
  zaloId?: string | null;
  fullName?: string;
  phone?: string;
  notes?: string | null;
  isVip?: boolean;
  createdAt: string;
  updatedAt: string;
  createdByAdminId: string;
  lastOrderDate?: string;
  totalSpent?: number;
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

export function useAdminCustomers() {
  // Get auth token from Redux store
  const token = useSelector((state: RootState) => state.auth.token);

  const [customers, setCustomers] = useState<CustomerAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
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

  const fetchCustomers = useCallback(
    async (params?: Record<string, string>) => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams({
          page: "1",
          limit: "50",
          ...params,
        });

        const response = await fetch(`/api/admin/customers?${queryParams}`, {
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch customers");
        }

        const data = await response.json();
        console.log("Fetched customers:", data);
        if (data.success) {
          setCustomers(data.data.items || []);
        } else {
          throw new Error(data.message || "Failed to fetch customers");
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
        toast.error("Lỗi khi tải danh sách khách hàng");
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  const handleDelete = async (customer: CustomerAdmin) => {
    // Luôn hiển thị confirmation modal
    setConfirmModal({
      show: true,
      customer,
      action: "delete",
    });
  };

  const performDelete = async (customer: CustomerAdmin) => {
    setActionLoading(`delete-${customer.id}`);
    try {
      const response = await fetch(`/api/admin/customers/${customer.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to delete customer");
      }

      const data = await response.json();
      if (data.success) {
        toast.success("Xóa khách hàng thành công");
        await fetchCustomers();
      } else {
        throw new Error(data.message || "Failed to delete customer");
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast.error("Lỗi khi xóa khách hàng");
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCustomers();
    }
  }, [fetchCustomers, token]);

  return {
    // Data
    customers,

    // State
    loading,
    actionLoading,
    confirmModal,

    // Actions
    handleDelete,
    performDelete,
    fetchCustomers,
    setConfirmModal,
  };
}
