import { X, Check } from "lucide-react";
import type { Color } from "@/types";

interface ColorFormData {
  name: string;
  hexCode: string;
  isActive: boolean;
}

interface ColorFormErrors {
  name?: string;
  hexCode?: string;
  isActive?: string;
}

interface ColorFormModalProps {
  showModal: boolean;
  editingColor: Color | null;
  formData: ColorFormData;
  formErrors: ColorFormErrors;
  actionLoading: string | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFormDataChange: (data: ColorFormData) => void;
}

export function ColorFormModal({
  showModal,
  editingColor,
  formData,
  formErrors,
  actionLoading,
  onClose,
  onSubmit,
  onFormDataChange,
}: ColorFormModalProps) {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-25"
          onClick={onClose}
        />

        <div className="relative bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">
              {editingColor ? "Cập nhật màu sắc" : "Thêm màu mới"}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Color Name */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Tên màu *
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
                placeholder="Nhập tên màu..."
              />
              {formErrors.name && (
                <p className="mt-1 text-sm text-red-400">{formErrors.name}</p>
              )}
            </div>

            {/* Color Code */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Mã màu *
              </label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={
                    formData.hexCode.length === 7 ? formData.hexCode : "#000000"
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    // Đảm bảo format #RRGGBB (6 ký tự hex)
                    if (value && /^#[0-9A-F]{6}$/i.test(value)) {
                      onFormDataChange({
                        ...formData,
                        hexCode: value.toUpperCase(),
                      });
                    }
                  }}
                  className="w-12 h-10 border border-gray-600 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.hexCode}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Tự động thêm # nếu chưa có
                    const formattedValue =
                      value && !value.startsWith("#") ? "#" + value : value;
                    // Chuyển thành uppercase và giới hạn độ dài
                    const upperValue = formattedValue.toUpperCase();
                    if (upperValue.length <= 7) {
                      onFormDataChange({ ...formData, hexCode: upperValue });
                    }
                  }}
                  onBlur={(e) => {
                    const value = e.target.value;
                    // Nếu thiếu ký tự, pad với 0
                    if (value.startsWith("#") && value.length < 7) {
                      const hexPart = value.slice(1);
                      const paddedHex = hexPart.padEnd(6, "0");
                      onFormDataChange({
                        ...formData,
                        hexCode: "#" + paddedHex,
                      });
                    }
                  }}
                  className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 font-mono bg-gray-700 text-white placeholder-gray-400 ${
                    formErrors.hexCode ? "border-red-500" : "border-gray-600"
                  }`}
                  placeholder="#000000"
                  maxLength={7}
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">
                Định dạng: #RRGGBB (ví dụ: #FF0000 cho màu đỏ)
              </p>
              {formErrors.hexCode && (
                <p className="mt-1 text-sm text-red-400">
                  {formErrors.hexCode}
                </p>
              )}
            </div>

            {/* Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  onFormDataChange({ ...formData, isActive: e.target.checked })
                }
                className="w-4 h-4 text-gray-300 border-gray-600 rounded focus:ring-gray-500"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-white">
                Hiển thị màu này
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={actionLoading === "save"}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {actionLoading === "save" ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    {editingColor ? "Cập nhật" : "Tạo màu"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
