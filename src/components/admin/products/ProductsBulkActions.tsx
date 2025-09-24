interface ProductsBulkActionsProps {
  selectedCount: number;
  onBulkAction: (action: "activate" | "deactivate" | "delete") => void;
}

export function ProductsBulkActions({
  selectedCount,
  onBulkAction,
}: ProductsBulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-300">
          Đã chọn {selectedCount} sản phẩm
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => onBulkAction("activate")}
            className="px-3 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Kích hoạt
          </button>
          <button
            onClick={() => onBulkAction("deactivate")}
            className="px-3 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Vô hiệu hóa
          </button>
          <button
            onClick={() => onBulkAction("delete")}
            className="px-3 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}