import { X } from "lucide-react";
import type { Capacity } from "@/types";

interface CapacityFormData {
  name: string;
  volumeMl: number;
  isActive: boolean;
}

interface CapacityFormErrors {
  name?: string;
  volumeMl?: string;
  isActive?: string;
}

interface CapacityFormModalProps {
  showModal: boolean;
  editingCapacity: Capacity | null;
  formData: CapacityFormData;
  formErrors: CapacityFormErrors;
  actionLoading: string | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFormDataChange: (data: CapacityFormData) => void;
}

export function CapacityFormModal({
  showModal,
  editingCapacity,
  formData,
  formErrors,
  actionLoading,
  onClose,
  onSubmit,
  onFormDataChange,
}: CapacityFormModalProps) {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">
            {editingCapacity ? "Chỉnh sửa dung tích" : "Thêm dung tích mới"}
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
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Tên dung tích *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  onFormDataChange({ ...formData, name: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-gray-700 text-white ${
                  formErrors.name ? "border-red-500" : "border-gray-600"
                }`}
                placeholder="Vd: Size L, Size XL..."
              />
              {formErrors.name && (
                <p className="text-red-400 text-sm mt-1">
                  {formErrors.name}
                </p>
              )}
            </div>

            {/* Volume */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Dung tích (ml) *
              </label>
              <input
                type="number"
                value={formData.volumeMl}
                onChange={(e) =>
                  onFormDataChange({
                    ...formData,
                    volumeMl: parseInt(e.target.value) || 0,
                  })
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-gray-700 text-white ${
                  formErrors.volumeMl ? "border-red-500" : "border-gray-600"
                }`}
                placeholder="473"
                min="1"
                max="10000"
              />
              {formErrors.volumeMl && (
                <p className="text-red-400 text-sm mt-1">
                  {formErrors.volumeMl}
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
                className="rounded border-gray-600 text-green-600 focus:ring-gray-500 bg-gray-700"
              />
              <label
                htmlFor="isActive"
                className="ml-2 text-sm text-gray-300"
              >
                Kích hoạt ngay
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={actionLoading === "submit"}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              {actionLoading === "submit" && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {editingCapacity ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}