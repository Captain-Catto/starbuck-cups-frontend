"use client";

import { useState, useEffect, useCallback, useReducer } from "react";
import { useAppSelector } from "@/store";
import { toast } from "sonner";

import { Address } from "@/components/admin/customers/AddressCard";
import { AddressFormData } from "@/components/admin/customers/AddressForm";

interface AddressState {
  addresses: Address[];
  loading: boolean;
}

type AddressAction =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: Address[] }
  | { type: "FETCH_ERROR" }
  | { type: "SET_ADDRESSES"; payload: Address[] };

const initialAddressState: AddressState = {
  addresses: [],
  loading: true,
};

function addressReducer(
  state: AddressState,
  action: AddressAction
): AddressState {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return { addresses: action.payload, loading: false };
    case "FETCH_ERROR":
      return { addresses: [], loading: false };
    case "SET_ADDRESSES":
      return { ...state, addresses: action.payload };
    default:
      return state;
  }
}

export function useAddressManager(customerId: string) {
  const [{ addresses, loading }, dispatchAddresses] = useReducer(
    addressReducer,
    initialAddressState
  );

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    addressId: string | null;
  }>({
    show: false,
    addressId: null,
  });
  const [formData, setFormData] = useState<AddressFormData>({
    streetAddress: "",
    ward: "",
    district: "",
    city: "",
    postalCode: "",
    isDefault: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get token from Redux store
  const { token } = useAppSelector((state) => state.auth);

  const fetchAddresses = useCallback(async () => {
    try {
      dispatchAddresses({ type: "FETCH_START" });

      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(`/api/admin/customers/${customerId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch customer data");
      }

      const result = await response.json();
      if (result.success && result.data.addresses) {
        dispatchAddresses({
          type: "FETCH_SUCCESS",
          payload: result.data.addresses,
        });
      } else {
        dispatchAddresses({ type: "FETCH_SUCCESS", payload: [] });
      }
    } catch {
      dispatchAddresses({ type: "FETCH_ERROR" });
    }
  }, [customerId, token]);

  useEffect(() => {
    // react-doctor-disable-next-line react-doctor/no-event-handler -- initialization fetch triggered by auth token and customer ID availability
    if (customerId && token) {
      fetchAddresses();
    }
  }, [customerId, token, fetchAddresses]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.streetAddress.trim()) {
      newErrors.streetAddress = "Địa chỉ là bắt buộc";
    }
    if (!formData.district.trim()) {
      newErrors.district = "Quận/Huyện là bắt buộc";
    }
    if (!formData.city.trim()) {
      newErrors.city = "Tỉnh/Thành phố là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStartAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setIsEditing(true);
    setFormData({
      streetAddress: "",
      ward: "",
      district: "",
      city: "",
      postalCode: "",
      isDefault: addresses.length === 0, // First address is default
    });
    setErrors({});
  };

  const handleStartEdit = (address: Address) => {
    setEditingId(address.id);
    setIsAdding(false);
    setIsEditing(true);
    setFormData({
      streetAddress: address.addressLine || address.streetAddress || "",
      ward: address.ward || "",
      district: address.district || "",
      city: address.city || "",
      postalCode: address.postalCode || "",
      isDefault: address.isDefault,
    });
    setErrors({});
  };

  const handleSave = async () => {
    if (!validateForm() || !token) {
      return;
    }

    // Map frontend format to backend format
    const backendData = {
      addressLine: formData.streetAddress,
      ward: formData.ward,
      district: formData.district,
      city: formData.city,
      postalCode: formData.postalCode,
      isDefault: formData.isDefault,
    };

    try {
      if (isAdding) {
        // Create new address
        const response = await fetch(
          `/api/admin/customers/${customerId}/addresses`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(backendData),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error("Failed to create address");
        }

        if (result.success) {
          // Refresh addresses
          await fetchAddresses();
          setIsAdding(false);
          toast.success("Đã tạo địa chỉ mới thành công");
        }
      } else if (editingId) {
        // Update existing address
        const response = await fetch(
          `/api/admin/customers/${customerId}/addresses/${editingId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(backendData),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update address");
        }

        const result = await response.json();
        if (result.success) {
          // Refresh addresses
          await fetchAddresses();
          setEditingId(null);
          toast.success("Đã cập nhật địa chỉ thành công");
        }
      }

      // Reset form
      setIsEditing(false);
      setFormData({
        streetAddress: "",
        ward: "",
        district: "",
        city: "",
        postalCode: "",
        isDefault: false,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Có lỗi xảy ra khi lưu địa chỉ"
      );
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      streetAddress: "",
      ward: "",
      district: "",
      city: "",
      postalCode: "",
      isDefault: false,
    });
    setErrors({});
  };

  const handleDelete = async (addressId: string) => {
    if (!token) return;

    const addressToDelete = addresses.find((addr) => addr.id === addressId);
    if (!addressToDelete) return;

    if (addresses.length === 1) {
      toast.error("Không thể xóa địa chỉ cuối cùng");
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/customers/${customerId}/addresses/${addressId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete address");
      }

      const result = await response.json();
      if (result.success) {
        // Refresh addresses
        await fetchAddresses();
        setDeleteConfirm({ show: false, addressId: null });
        toast.success("Đã xóa địa chỉ thành công");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Có lỗi xảy ra khi xóa địa chỉ"
      );
    }
  };

  const showDeleteConfirm = (addressId: string) => {
    setDeleteConfirm({ show: true, addressId });
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, addressId: null });
  };

  const handleSetDefault = async (addressId: string) => {
    if (!token) return;

    setActionLoading(`default-${addressId}`);

    // Store original state for potential rollback
    const originalAddresses = [...addresses];

    // Optimistic update: Set the selected address as default and others as non-default
    const optimisticAddresses = addresses.map((addr) => ({
      ...addr,
      isDefault: addr.id === addressId,
    }));
    dispatchAddresses({ type: "SET_ADDRESSES", payload: optimisticAddresses });

    try {
      const response = await fetch(
        `/api/admin/customers/${customerId}/addresses/${addressId}/set-default`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to set default address");
      }

      const result = await response.json();
      if (result.success) {
        // Success - the optimistic update was correct, no need to fetch again
        toast.success("Đã đặt làm địa chỉ mặc định thành công");
      } else {
        // API returned success: false, rollback
        dispatchAddresses({ type: "SET_ADDRESSES", payload: originalAddresses });
        toast.error("Có lỗi xảy ra khi đặt địa chỉ mặc định");
      }
    } catch (error) {
      // Network error, rollback to original state
      dispatchAddresses({ type: "SET_ADDRESSES", payload: originalAddresses });
      toast.error(
        error instanceof Error ? error.message : "Có lỗi xảy ra khi đặt địa chỉ mặc định"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleFieldChange = <K extends keyof AddressFormData>(
    key: K,
    value: AddressFormData[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return {
    addresses,
    loading,
    actionLoading,
    isEditing,
    setIsEditing,
    editingId,
    setEditingId,
    isAdding,
    setIsAdding,
    deleteConfirm,
    formData,
    errors,
    handleStartAdd,
    handleStartEdit,
    handleSave,
    handleCancel,
    handleDelete,
    showDeleteConfirm,
    cancelDelete,
    handleSetDefault,
    handleFieldChange,
  };
}
