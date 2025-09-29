"use client";

import React from "react";
import {
  useCustomerForm,
  type CustomerFormData,
} from "@/hooks/business/useCustomerForm";
import { useRouter } from "next/navigation";

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
  const { formData, errors, isSubmitting, updateField, submitForm } =
    useCustomerForm({
      initialData,
      isEditing,
      customerId,
    });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitForm();
  };

  return (
    <div className="mx-auto bg-gray-800 rounded-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">
          {isEditing ? "Chỉnh sửa khách hàng" : "Thêm khách hàng mới"}
        </h2>
      </div>

      {errors.general && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg">
          <p className="text-red-400">{errors.general}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Thông tin cơ bản
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Họ và tên <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => updateField("fullName", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400 ${
                  errors.fullName ? "border-red-500" : "border-gray-600"
                }`}
                placeholder="Nhập họ và tên khách hàng"
                required
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-400">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Số điện thoại <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400 ${
                  errors.phone ? "border-red-500" : "border-gray-600"
                }`}
                placeholder="0901234567"
                required
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-400">{errors.phone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Social Media IDs */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Liên hệ mạng xã hội
          </h3>
          {errors.social && (
            <p className="mb-4 text-sm text-red-400">{errors.social}</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Messenger ID
              </label>
              <input
                type="text"
                value={formData.messengerId}
                onChange={(e) => updateField("messengerId", e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
                placeholder="Nhập Messenger ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Zalo ID
              </label>
              <input
                type="text"
                value={formData.zaloId}
                onChange={(e) => updateField("zaloId", e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
                placeholder="Nhập Zalo ID"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Ghi chú
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
            placeholder="Thêm ghi chú về khách hàng (tùy chọn)"
          />
        </div>

        {/* VIP Status */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Phân loại khách hàng
          </h3>
          <div className="flex items-center">
            <input
              id="isVip"
              type="checkbox"
              checked={formData.isVip}
              onChange={(e) => updateField("isVip", e.target.checked)}
              className="w-4 h-4 text-yellow-600 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500 focus:ring-2"
            />
            <label
              htmlFor="isVip"
              className="ml-2 text-sm font-medium text-gray-300"
            >
              Khách hàng VIP
            </label>
          </div>
          <p className="mt-2 text-sm text-gray-400">
            Khách VIP sẽ được ưu tiên xử lý và có thể nhận được ưu đãi đặc biệt
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={() => router.push("/admin/customers")}
            className="flex-1 px-4 py-2 border border-gray-600 rounded-lg text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting
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
