import { AlertTriangle } from "lucide-react";
import type { Color } from "@/types";

interface ColorWithCount extends Color {
  _count?: {
    productColors: number;
  };
}

interface ConfirmModal {
  show: boolean;
  color: ColorWithCount | null;
  action: "toggle" | "delete";
}

interface ColorConfirmModalProps {
  confirmModal: ConfirmModal;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ColorConfirmModal({
  confirmModal,
  onCancel,
  onConfirm,
}: ColorConfirmModalProps) {
  if (!confirmModal.show || !confirmModal.color) return null;

  const { color, action } = confirmModal;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                action === "delete" ? "bg-gray-100" : "bg-yellow-100"
              }`}
            >
              <AlertTriangle
                className={`w-5 h-5 ${
                  action === "delete" ? "text-gray-300" : "text-yellow-600"
                }`}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {action === "delete" ? "Xác nhận xóa màu" : "Xác nhận tắt màu"}
              </h3>
              <p className="text-sm text-gray-500">
                Màu đang được sử dụng bởi sản phẩm
              </p>
            </div>
          </div>

          {/* Color info */}
          <div className="flex items-center gap-3 mb-4 p-3 bg-gray-700 rounded-lg">
            <div
              className="w-8 h-8 rounded border-2 border-gray-600"
              style={{ backgroundColor: color.hexCode }}
            />
            <div>
              <div className="font-medium text-white">{color.name}</div>
              <div className="text-sm text-gray-400">{color.hexCode}</div>
              {color.slug && (
                <div className="text-xs text-gray-500">slug: {color.slug}</div>
              )}
            </div>
          </div>

          {/* Warning message */}
          <div className="mb-6">
            <p className="text-gray-300 mb-3">
              Màu <strong>&ldquo;{color.name}&rdquo;</strong> đang được sử dụng
              trong <strong>{color._count?.productColors || 0} sản phẩm</strong>
              .
            </p>

            {(color._count?.productColors || 0) > 0 && (
              <div
                className={`border rounded-lg p-3 ${
                  action === "delete"
                    ? "bg-gray-700 border-red-600"
                    : "bg-yellow-900 border-yellow-600"
                }`}
              >
                {action === "delete" ? (
                  <>
                    <h4 className="font-medium text-gray-200 mb-2">
                      ⚠️ Không thể xóa màu đang được sử dụng!
                    </h4>
                    <p className="text-sm text-gray-300">
                      Bạn cần xóa hoặc thay đổi màu của tất cả sản phẩm trước
                      khi có thể xóa màu này.
                    </p>
                  </>
                ) : (
                  <>
                    <h4 className="font-medium text-yellow-200 mb-2">
                      Khi tắt màu này:
                    </h4>
                    <ul className="text-sm text-yellow-300 space-y-1">
                      <li>• Các sản phẩm hiện tại vẫn giữ màu này</li>
                      <li>• Màu sẽ không hiển thị khi tạo sản phẩm mới</li>
                      <li>• Bạn có thể kích hoạt lại bất cứ lúc nào</li>
                    </ul>
                  </>
                )}
              </div>
            )}

            {/* Show confirmation message for deletable colors */}
            {action === "delete" &&
              (color._count?.productColors || 0) === 0 && (
                <div className="border rounded-lg p-3 bg-red-900 border-red-600">
                  <h4 className="font-medium text-red-200 mb-2">
                    ⚠️ Xác nhận xóa màu
                  </h4>
                  <p className="text-sm text-red-300">
                    Màu này sẽ bị xóa vĩnh viễn và không thể khôi phục. Bạn có
                    chắc chắn muốn xóa?
                  </p>
                </div>
              )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              {action === "delete" ? "Hủy" : "Hủy"}
            </button>

            {/* Toggle action */}
            {action === "toggle" && (
              <button
                onClick={onConfirm}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
              >
                Xác nhận tắt
              </button>
            )}

            {/* Delete action - only show confirm button if color is not in use */}
            {action === "delete" &&
              (color._count?.productColors || 0) === 0 && (
                <button
                  onClick={onConfirm}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
                >
                  Xác nhận xóa
                </button>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
