import { ConfirmModal } from "@/components/admin/ConfirmModal";
import type { Product } from "@/types";

interface ConfirmModalState {
  show: boolean;
  product: Product | null;
  action: "toggle" | "delete";
}

interface ProductConfirmModalProps {
  confirmModal: ConfirmModalState;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ProductConfirmModal({
  confirmModal,
  onCancel,
  onConfirm,
}: ProductConfirmModalProps) {
  if (!confirmModal.show || !confirmModal.product) return null;

  const { product, action } = confirmModal;

  return (
    <ConfirmModal
      show={confirmModal.show}
      action={action}
      title={action === "delete" ? "Xác nhận xóa sản phẩm" : "Xác nhận thay đổi trạng thái"}
      subtitle="Thao tác này sẽ ảnh hưởng đến sản phẩm"
      confirmLabel={action === "delete" ? "Xóa sản phẩm" : "Xác nhận"}
      cancelLabel="Hủy bỏ"
      onCancel={onCancel}
      onConfirm={onConfirm}
    >
      <p className="text-gray-300 mb-3">
        {action === "delete" ? (
          <>
            Bạn có chắc chắn muốn xóa sản phẩm{" "}
            <strong>&ldquo;{product.name}&rdquo;</strong>?
          </>
        ) : (
          <>
            Bạn có chắc chắn muốn {product.isActive ? "tắt" : "bật"} sản phẩm{" "}
            <strong>&ldquo;{product.name}&rdquo;</strong>?
          </>
        )}
      </p>

      <div
        className={`border rounded-lg p-3 ${
          action === "delete" ? "bg-red-900 border-red-600" : "bg-yellow-900 border-yellow-600"
        }`}
      >
        <p className="text-sm text-white">
          {action === "delete" ? (
            <>
              <strong>⚠️ Cảnh báo:</strong> Xóa sản phẩm sẽ loại bỏ hoàn toàn khỏi hệ thống.
              Thao tác này không thể hoàn tác.
            </>
          ) : (
            <>
              <strong>ℹ️ Lưu ý:</strong> Thay đổi trạng thái sẽ ảnh hưởng đến việc hiển thị
              sản phẩm cho khách hàng.
            </>
          )}
        </p>
      </div>
    </ConfirmModal>
  );
}
