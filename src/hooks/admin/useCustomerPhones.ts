"use client";

import { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import type { RootState } from "@/store";

export interface CustomerPhone {
  id: string;
  customerId: string;
  phoneNumber: string;
  isMain: boolean;
  label?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePhoneData {
  phoneNumber: string;
  label?: string;
  isMain?: boolean;
}

export interface UpdatePhoneData {
  phoneNumber?: string;
  label?: string;
  isMain?: boolean;
}

export function useCustomerPhones(customerId: string) {
  const [phones, setPhones] = useState<CustomerPhone[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { token } = useSelector((state: RootState) => state.auth);

  // Fetch phones for customer
  const fetchPhones = useCallback(async () => {
    if (!token || !customerId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/customers/${customerId}/phones`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch phones");
      }

      setPhones(data.data || []);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch phones";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [customerId, token]);

  // Create new phone
  const createPhone = useCallback(
    async (phoneData: CreatePhoneData) => {
      if (!token || !customerId) return false;

      try {
        const response = await fetch(
          `/api/admin/customers/${customerId}/phones`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(phoneData),
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to create phone");
        }

        await fetchPhones(); // Refresh list
        toast.success("Số điện thoại đã được thêm thành công");
        return true;
      } catch (error) {
        let errorMessage = "Có lỗi xảy ra khi thêm số điện thoại";

        if (error instanceof Error) {
          if (error.message.includes("already exists")) {
            errorMessage = "Số điện thoại này đã tồn tại cho khách hàng";
          } else if (error.message.includes("Invalid phone")) {
            errorMessage = "Số điện thoại không hợp lệ";
          } else {
            errorMessage = error.message;
          }
        }

        toast.error(errorMessage);
        return false;
      }
    },
    [customerId, token, fetchPhones]
  );

  // Update phone
  const updatePhone = useCallback(
    async (phoneId: string, phoneData: UpdatePhoneData) => {
      if (!token) return false;

      try {
        const response = await fetch(`/api/admin/phones/${phoneId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(phoneData),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to update phone");
        }

        await fetchPhones(); // Refresh list
        toast.success("Số điện thoại đã được cập nhật");
        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to update phone";
        toast.error(errorMessage);
        return false;
      }
    },
    [token, fetchPhones]
  );

  // Delete phone
  const deletePhone = useCallback(
    async (phoneId: string) => {
      if (!token) return false;

      try {
        const response = await fetch(`/api/admin/phones/${phoneId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to delete phone");
        }

        await fetchPhones(); // Refresh list
        toast.success("Số điện thoại đã được xóa");
        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to delete phone";
        toast.error(errorMessage);
        return false;
      }
    },
    [token, fetchPhones]
  );

  // Set phone as main
  const setMainPhone = useCallback(
    async (phoneId: string) => {
      if (!token) return false;

      try {
        const response = await fetch(
          `/api/admin/phones/${phoneId}/set-main`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to set main phone");
        }

        await fetchPhones(); // Refresh list
        toast.success("Đã đặt làm số điện thoại chính");
        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to set main phone";
        toast.error(errorMessage);
        return false;
      }
    },
    [token, fetchPhones]
  );

  return {
    phones,
    loading,
    error,
    fetchPhones,
    createPhone,
    updatePhone,
    deletePhone,
    setMainPhone,
  };
}
