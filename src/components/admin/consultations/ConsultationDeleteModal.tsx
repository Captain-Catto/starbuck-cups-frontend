import { Trash2 } from "lucide-react";

interface ConsultationDeleteModalProps {
  isOpen: boolean;
  actionLoading: string | null;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export function ConsultationDeleteModal({
  isOpen,
  actionLoading,
  onConfirm,
  onCancel,
}: ConsultationDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-md w-full p-6 border border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-900 rounded-full flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Xác nhận xóa</h3>
            <p className="text-sm text-gray-400">
              Hành động này không thể hoàn tác
            </p>
          </div>
        </div>

        <p className="text-gray-300 mb-6">
          Bạn có chắc chắn muốn xóa consultation này? Tất cả thông tin liên quan
          sẽ bị xóa vĩnh viễn.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={actionLoading === "delete"}
            className="px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={actionLoading === "delete"}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
          >
            {actionLoading === "delete" && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <Trash2 className="w-4 h-4" />
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}