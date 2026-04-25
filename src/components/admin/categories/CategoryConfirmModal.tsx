import { ConfirmModal } from "@/components/admin/ConfirmModal";
import type { Category } from "@/types";

interface CategoryWithCount extends Category {
  _count?: { products: number };
}

interface ConfirmModalState {
  show: boolean;
  category: CategoryWithCount | null;
  action: "toggle" | "delete";
}

interface CategoryConfirmModalProps {
  confirmModal: ConfirmModalState;
  onCancel: () => void;
  onConfirm: () => void;
}

export function CategoryConfirmModal({
  confirmModal,
  onCancel,
  onConfirm,
}: CategoryConfirmModalProps) {
  if (!confirmModal.show || !confirmModal.category) return null;

  const { category, action } = confirmModal;

  return (
    <ConfirmModal
      show={confirmModal.show}
      action={action}
      title={action === "delete" ? "Xác nhận xóa danh mục" : "Xác nhận tắt danh mục"}
      subtitle="Thao tác này sẽ ảnh hưởng đến sản phẩm"
      confirmLabel={action === "delete" ? "Thử xóa (sẽ thất bại)" : "Tắt danh mục"}
      cancelLabel="Hủy bỏ"
      onCancel={onCancel}
      onConfirm={onConfirm}
    >
      <p className="text-gray-300 mb-3">
        Danh mục <strong>&ldquo;{category.name}&rdquo;</strong> đang được sử dụng trong{" "}
        <strong>{category._count?.products || 0} sản phẩm</strong>.
      </p>

      <div
        className={`border rounded-lg p-3 ${
          action === "delete" ? "bg-red-900 border-red-600" : "bg-yellow-900 border-yellow-600"
        }`}
      >
        <p className="text-sm text-white">
          {action === "delete" ? (
            <>
              <strong>⚠️ Cảnh báo:</strong> Không thể xóa danh mục đang được sử dụng. Hệ thống
              sẽ từ chối thao tác này để bảo vệ dữ liệu. Bạn có thể tắt danh mục thay vì xóa.
            </>
          ) : (
            <>
              <strong>ℹ️ Lưu ý:</strong> Tắt danh mục sẽ ẩn nó khỏi danh sách công khai nhưng
              các sản phẩm vẫn giữ danh mục này.
            </>
          )}
        </p>
      </div>
    </ConfirmModal>
  );
}
