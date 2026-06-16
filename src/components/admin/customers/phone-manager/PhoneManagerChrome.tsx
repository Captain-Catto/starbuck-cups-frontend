import { Phone, Plus, X, Edit } from "lucide-react";

export function PhoneManagerLoading() {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-600 rounded w-1/4"></div>
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-600 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PhoneManagerError({ error }: { error: string }) {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Phone className="size-5 text-white" />
        <h3 className="text-lg font-semibold text-white">Số điện thoại</h3>
      </div>
      <div className="p-4 bg-red-900/20 border border-red-600 rounded-lg">
        <p className="text-red-400">{error}</p>
      </div>
    </div>
  );
}

export function PhoneManagerHeader({
  count,
  isEditing,
  onStartEditing,
  onShowAddForm,
  onDone,
}: {
  count: number;
  isEditing: boolean;
  onStartEditing: () => void;
  onShowAddForm: () => void;
  onDone: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-semibold text-white">
        Danh sách số điện thoại ({count})
      </h3>
      <div className="flex items-center gap-2">
        {!isEditing ? (
          <button
            type="button"
            onClick={onStartEditing}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            title="Chỉnh sửa"
          >
            <Edit className="size-4" />
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onShowAddForm}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
            >
              <Plus className="size-4" />
              Thêm số điện thoại
            </button>
            <button
              type="button"
              onClick={onDone}
              className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
            >
              <X className="size-4" />
              Xong
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function DeletePhoneModal({
  phoneId,
  onCancel,
  onConfirm,
}: {
  phoneId: string | null;
  onCancel: () => void;
  onConfirm: (phoneId: string) => void;
}) {
  if (!phoneId) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-zinc-950 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-2 text-white">Xác nhận xóa</h3>
        <p className="text-gray-300 mb-4">
          Bạn có chắc chắn muốn xóa số điện thoại này? Hành động này không thể
          hoàn tác.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => onConfirm(phoneId)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}
