"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store";
import { toast } from "sonner";

export interface Address {
  addressLine: string;
  district: string;
  city: string;
  postalCode: string;
}

export interface CustomerFormData {
  messengerId: string;
  zaloId: string;
  fullName: string;
  phone: string;
  notes: string;
  isVip: boolean;
  address: Address;
}

export interface ValidationErrors {
  [key: string]: string;
}

export interface UseCustomerFormOptions {
  initialData?: Partial<CustomerFormData>;
  isEditing?: boolean;
  customerId?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export interface UseCustomerFormReturn {
  formData: CustomerFormData;
  errors: ValidationErrors;
  loading: boolean;
  isSubmitting: boolean;
  updateField: (
    field: keyof CustomerFormData | string,
    value: string | string[] | boolean
  ) => void;
  updateAddress: (field: keyof Address, value: string) => void;
  validateForm: () => boolean;
  submitForm: () => Promise<void>;
  resetForm: () => void;
}

export function useCustomerForm(
  options: UseCustomerFormOptions = {}
): UseCustomerFormReturn {
  const {
    initialData,
    isEditing = false,
    customerId,
    onSuccess,
    onError,
  } = options;

  const router = useRouter();

  // Get token from Redux store
  const { token } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState<CustomerFormData>({
    messengerId: initialData?.messengerId || "",
    zaloId: initialData?.zaloId || "",
    fullName: initialData?.fullName || "",
    phone: initialData?.phone || "",
    notes: initialData?.notes || "",
    isVip: initialData?.isVip || false,
    address: initialData?.address || {
      addressLine: "",
      district: "",
      city: "",
      postalCode: "",
    },
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = useCallback(
    (
      field: keyof CustomerFormData | string,
      value: string | string[] | boolean
    ) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: "",
        }));
      }
    },
    [errors]
  );

  const updateAddress = useCallback(
    (field: keyof Address, value: string) => {
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value,
        },
      }));

      const addressField = `address.${field}`;
      if (errors[addressField]) {
        setErrors((prev) => ({
          ...prev,
          [addressField]: "",
        }));
      }
    },
    [errors]
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Họ tên là bắt buộc";
    }

    if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    if (!formData.address.addressLine.trim()) {
      newErrors["address.addressLine"] = "Địa chỉ là bắt buộc";
    }

    if (!formData.address.district.trim()) {
      newErrors["address.district"] = "Quận/Huyện là bắt buộc";
    }

    if (!formData.address.city.trim()) {
      newErrors["address.city"] = "Thành phố là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const submitForm = useCallback(async () => {
    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    try {
      setIsSubmitting(true);

      const url =
        isEditing && customerId
          ? `/api/admin/customers/${customerId}`
          : "/api/admin/customers";

      const method = isEditing ? "PUT" : "POST";

      interface CustomerPayload {
        messengerId: string | null;
        zaloId: string | null;
        fullName: string;
        phone: string;
        notes: string | null;
        isVip: boolean;
        address?: {
          addressLine: string;
          district: string | null;
          city: string;
          postalCode: string | null;
          isDefault: boolean;
        };
      }

      const payload: CustomerPayload = {
        messengerId: formData.messengerId.trim() || null,
        zaloId: formData.zaloId.trim() || null,
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        notes: formData.notes.trim() || null,
        isVip: formData.isVip,
      };

      // Only include address if required fields are provided
      if (formData.address.addressLine.trim() && formData.address.city.trim()) {
        payload.address = {
          addressLine: formData.address.addressLine.trim(),
          district: formData.address.district.trim() || null,
          city: formData.address.city.trim(),
          postalCode: formData.address.postalCode.trim() || null,
          isDefault: true,
        };
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("Customer form submission response:", data);

      if (!response.ok || !data.success) {
        const errorMsg =
          data.message ||
          (isEditing
            ? "Không thể cập nhật khách hàng"
            : "Không thể tạo khách hàng");
        throw new Error(errorMsg);
      }

      const successMsg = isEditing
        ? "Cập nhật khách hàng thành công!"
        : "Tạo khách hàng thành công!";

      toast.success(successMsg);

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/admin/customers");
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Có lỗi xảy ra";
      toast.error(errorMsg);

      if (onError) {
        onError(errorMsg);
      }

      console.error("Error submitting customer form:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    formData,
    isEditing,
    customerId,
    validateForm,
    onSuccess,
    onError,
    router,
    token,
  ]);

  const resetForm = useCallback(() => {
    setFormData({
      messengerId: initialData?.messengerId || "",
      zaloId: initialData?.zaloId || "",
      fullName: initialData?.fullName || "",
      phone: initialData?.phone || "",
      notes: initialData?.notes || "",
      isVip: initialData?.isVip || false,
      address: initialData?.address || {
        addressLine: "",
        district: "",
        city: "",
        postalCode: "",
      },
    });
    setErrors({});
    setIsSubmitting(false);
  }, [initialData]);

  return {
    formData,
    errors,
    loading,
    isSubmitting,
    updateField,
    updateAddress,
    validateForm,
    submitForm,
    resetForm,
  };
}
