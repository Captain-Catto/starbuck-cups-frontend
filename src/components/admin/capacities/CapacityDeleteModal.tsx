import { Trash2 } from "lucide-react";

interface CapacityDeleteModalProps {
  showModal: boolean;
  deleteName: string;
  actionLoading: string | null;
  deleteId: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function CapacityDeleteModal({
  showModal,
  deleteName,
  actionLoading,
  deleteId,
  onConfirm,
  onCancel,
}: CapacityDeleteModalProps) {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-white" />
            </div>
          </div>

          <h3 className="text-lg font-semibold text-white text-center mb-2">
            Xác nhận xóa dung tích
          </h3>

          <p className="text-gray-300 text-center mb-6">
            Bạn có chắc chắn muốn xóa dung tích{" "}
            <span className="font-semibold text-white">
              &quot;{deleteName}&quot;
            </span>
            ?
            <br />
            <span className="text-sm text-gray-400">
              Hành động này không thể hoàn tác.
            </span>
          </p>

          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={actionLoading === deleteId}
              className="px-4 py-2 text-white border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              disabled={actionLoading === deleteId}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              {actionLoading === deleteId && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
