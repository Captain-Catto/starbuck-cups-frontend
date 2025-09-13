"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface Address {
  addressLine: string;
  district: string;
  city: string;
  postalCode: string;
}

interface CustomerFormData {
  messengerId: string;
  zaloId: string;
  fullName: string;
  phone: string;
  notes: string;
  address: Address;
}

interface ValidationErrors {
  [key: string]: string;
}

interface CustomerFormProps {
  initialData?: Partial<CustomerFormData>;
  isEditing?: boolean;
  customerId?: string;
}

export function CustomerForm({
  initialData,
  isEditing = false,
  customerId,
}: CustomerFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState<CustomerFormData>({
    messengerId: initialData?.messengerId || "",
    zaloId: initialData?.zaloId || "",
    fullName: initialData?.fullName || "",
    phone: initialData?.phone || "",
    notes: initialData?.notes || "",
    address: initialData?.address || {
      addressLine: "",
      district: "",
      city: "",
      postalCode: "",
    },
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    setErrors({});
    const newErrors: ValidationErrors = {};

    // Required fields
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Tên khách hàng là bắt buộc";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Số điện thoại là bắt buộc";
    } else if (!/^0\d{9}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    // Validate messenger/zalo ID
    if (!formData.messengerId.trim() && !formData.zaloId.trim()) {
      newErrors.social = "Phải có ít nhất một Messenger ID hoặc Zalo ID";
    }

    // Validate address
    if (!formData.address.addressLine.trim()) {
      newErrors.addressLine = "Địa chỉ là bắt buộc";
    }
    if (!formData.address.district.trim()) {
      newErrors.district = "Quận/Huyện là bắt buộc";
    }
    if (!formData.address.city.trim()) {
      newErrors.city = "Tỉnh/Thành phố là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const customerData = {
        messengerId: formData.messengerId || null,
        zaloId: formData.zaloId || null,
        fullName: formData.fullName,
        phone: formData.phone,
        notes: formData.notes || null,
        address: formData.address,
      };

      const url = isEditing ? `/api/customers/${customerId}` : "/api/customers";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customerData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Có lỗi xảy ra khi lưu khách hàng");
      }

      router.push("/admin/customers");
    } catch (err) {
      setErrors({
        general:
          err instanceof Error
            ? err.message
            : "Có lỗi xảy ra khi lưu khách hàng",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto bg-white rounded-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditing ? "Chỉnh sửa khách hàng" : "Thêm khách hàng mới"}
        </h2>
      </div>

      {errors.general && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{errors.general}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Thông tin cơ bản
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.fullName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nhập họ và tên khách hàng"
                required
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="0901234567"
                required
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Social Media IDs */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Liên hệ mạng xã hội
          </h3>
          {errors.social && (
            <p className="mb-4 text-sm text-red-600">{errors.social}</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Messenger ID
              </label>
              <input
                type="text"
                value={formData.messengerId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    messengerId: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Nhập Messenger ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zalo ID
              </label>
              <input
                type="text"
                value={formData.zaloId}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, zaloId: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Nhập Zalo ID"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Địa chỉ</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa chỉ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.address.addressLine}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    address: { ...prev.address, addressLine: e.target.value },
                  }))
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.addressLine ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Số nhà, tên đường"
                required
              />
              {errors.addressLine && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.addressLine}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quận/Huyện <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.address.district}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: { ...prev.address, district: e.target.value },
                    }))
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.district ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Quận/Huyện"
                  required
                />
                {errors.district && (
                  <p className="mt-1 text-sm text-red-600">{errors.district}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tỉnh/Thành phố <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.address.city}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: { ...prev.address, city: e.target.value },
                    }))
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.city ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Tỉnh/Thành phố"
                  required
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã bưu điện
                </label>
                <input
                  type="text"
                  value={formData.address.postalCode}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: { ...prev.address, postalCode: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Mã bưu điện"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ghi chú
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, notes: e.target.value }))
            }
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Thêm ghi chú về khách hàng (tùy chọn)"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={() => router.push("/admin/customers")}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading
              ? "Đang lưu..."
              : isEditing
              ? "Cập nhật"
              : "Thêm khách hàng"}
          </button>
        </div>
      </form>
    </div>
  );
}
