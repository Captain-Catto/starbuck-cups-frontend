import { Package } from "lucide-react";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import type { Capacity } from "@/types";

interface CapacityWithCount extends Capacity {
  _count?: { products: number };
}

interface ConfirmModalState {
  show: boolean;
  capacity: CapacityWithCount | null;
  action: "delete" | "toggle";
}

interface CapacityConfirmModalProps {
  confirmModal: ConfirmModalState;
  onCancel: () => void;
  onConfirm: () => void;
}

export function CapacityConfirmModal({
  confirmModal,
  onCancel,
  onConfirm,
}: CapacityConfirmModalProps) {
  if (!confirmModal.show || !confirmModal.capacity) return null;

  const { capacity, action } = confirmModal;
  const productCount = capacity._count?.products || 0;
  const showConfirm = action === "toggle" || productCount === 0;

  return (
    <ConfirmModal
      show={confirmModal.show}
      action={action}
      title={action === "delete" ? "Xác nhận xóa dung tích" : "Xác nhận tắt dung tích"}
      subtitle="Dung tích đang được sử dụng bởi sản phẩm"
      showConfirmButton={showConfirm}
      confirmLabel={action === "delete" ? "Xác nhận xóa" : "Xác nhận tắt"}
      cancelLabel="Hủy"
      onCancel={onCancel}
      onConfirm={onConfirm}
    >
      <div className="flex items-center gap-3 mb-4 p-3 bg-gray-700 rounded-lg">
        <div className="p-2 bg-blue-600 rounded-lg">
          <Package className="size-6 text-white" />
        </div>
        <div>
          <div className="font-medium text-white">{capacity.name}</div>
          <div className="text-sm text-gray-400">{capacity.volumeMl}ml</div>
        </div>
      </div>

      <p className="text-gray-300 mb-3">
        Dung tích <strong>&ldquo;{capacity.name}&rdquo;</strong> đang được sử dụng trong{" "}
        <strong>{productCount} sản phẩm</strong>.
      </p>

      {productCount > 0 && (
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
                ⚠️ Không thể xóa dung tích đang được sử dụng!
              </h4>
              <p className="text-sm text-gray-300">
                Bạn cần xóa hoặc thay đổi dung tích của tất cả sản phẩm trước khi có thể xóa dung tích này.
              </p>
            </>
          ) : (
            <>
              <h4 className="font-medium text-yellow-200 mb-2">Khi tắt dung tích này:</h4>
              <ul className="text-sm text-yellow-300 space-y-1">
                <li>• Các sản phẩm hiện tại vẫn giữ dung tích này</li>
                <li>• Dung tích sẽ không hiển thị khi tạo sản phẩm mới</li>
                <li>• Bạn có thể kích hoạt lại bất cứ lúc nào</li>
              </ul>
            </>
          )}
        </div>
      )}

      {action === "toggle" && productCount === 0 && (
        <div className="border rounded-lg p-3 bg-yellow-900 border-yellow-600">
          <h4 className="font-medium text-yellow-200 mb-2">⚠️ Xác nhận tắt dung tích</h4>
          <p className="text-sm text-yellow-300">
            Dung tích này sẽ bị tắt và không hiển thị khi tạo sản phẩm mới. Bạn có chắc chắn muốn tắt?
          </p>
        </div>
      )}
    </ConfirmModal>
  );
}
