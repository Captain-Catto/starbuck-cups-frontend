"use client";

import dynamic from "next/dynamic";
import { X } from "lucide-react";
import type { Category } from "@/types";
import { LoadingSpinner } from "@/components/LoadingSpinner";

// Dynamic import for RichTextEditor to reduce initial bundle
const RichTextEditor = dynamic(() => import("@/components/ui/RichTextEditor"), {
  ssr: false,
  loading: () => <div className="w-full h-[200px] border rounded-md flex items-center justify-center"><LoadingSpinner /></div>
});

interface CategoryFormData {
  name: string;
  description: string;
  isActive: boolean;
}

interface CategoryFormErrors {
  name?: string;
  description?: string;
  isActive?: string;
}

interface CategoryFormModalProps {
  showModal: boolean;
  editingCategory: Category | null;
  formData: CategoryFormData;
  formErrors: CategoryFormErrors;
  actionLoading: string | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFormDataChange: (data: CategoryFormData) => void;
}

export function CategoryFormModal({
  showModal,
  editingCategory,
  formData,
  formErrors,
  actionLoading,
  onClose,
  onSubmit,
  onFormDataChange,
}: CategoryFormModalProps) {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto my-8">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">
            {editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6">
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Tên danh mục *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  onFormDataChange({ ...formData, name: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-gray-700 text-white placeholder-gray-400 ${
                  formErrors.name ? "border-red-500" : "border-gray-600"
                }`}
                placeholder="Vd: Ly giữ nhiệt, Cốc sứ..."
              />
              {formErrors.name && (
                <p className="text-red-400 text-sm mt-1">{formErrors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Mô tả
              </label>
              <RichTextEditor
                value={formData.description || ""}
                onChange={(htmlContent) =>
                  onFormDataChange({ ...formData, description: htmlContent })
                }
                placeholder="Nhập mô tả chi tiết về danh mục..."
                height={200}
              />
              {formErrors.description && (
                <p className="text-red-400 text-sm mt-1">
                  {formErrors.description}
                </p>
              )}
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  onFormDataChange({ ...formData, isActive: e.target.checked })
                }
                className="rounded border-gray-600 text-green-600 focus:ring-gray-500"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-white">
                Kích hoạt ngay
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-white border border-gray-600 rounded-lg hover:bg-gray-700"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={actionLoading === "submit"}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 disabled:opacity-50 flex items-center gap-2"
            >
              {actionLoading === "submit" && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {editingCategory ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
