import { ConfirmModal } from "@/components/admin/ConfirmModal";
import type { Color } from "@/types";

interface ColorWithCount extends Color {
  _count?: { productColors: number };
}

interface ConfirmModalState {
  show: boolean;
  color: ColorWithCount | null;
  action: "toggle" | "delete";
}

interface ColorConfirmModalProps {
  confirmModal: ConfirmModalState;
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
  const productCount = color._count?.productColors || 0;
  const showConfirm = action === "toggle" || productCount === 0;

  return (
    <ConfirmModal
      show={confirmModal.show}
      action={action}
      title={action === "delete" ? "Xác nhận xóa màu" : "Xác nhận tắt màu"}
      subtitle="Màu đang được sử dụng bởi sản phẩm"
      showConfirmButton={showConfirm}
      confirmLabel={action === "delete" ? "Xác nhận xóa" : "Xác nhận tắt"}
      cancelLabel="Hủy"
      onCancel={onCancel}
      onConfirm={onConfirm}
    >
      <div className="flex items-center gap-3 mb-4 p-3 bg-gray-700 rounded-lg">
        <div
          className="size-8 rounded border-2 border-gray-600 flex-shrink-0"
          style={{ backgroundColor: color.hexCode }}
        />
        <div>
          <div className="font-medium text-white">{color.name}</div>
          <div className="text-sm text-gray-400">{color.hexCode}</div>
          {color.slug && <div className="text-xs text-gray-500">slug: {color.slug}</div>}
        </div>
      </div>

      <p className="text-gray-300 mb-3">
        Màu <strong>&ldquo;{color.name}&rdquo;</strong> đang được sử dụng trong{" "}
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
                ⚠️ Không thể xóa màu đang được sử dụng!
              </h4>
              <p className="text-sm text-gray-300">
                Bạn cần xóa hoặc thay đổi màu của tất cả sản phẩm trước khi có thể xóa màu này.
              </p>
            </>
          ) : (
            <>
              <h4 className="font-medium text-yellow-200 mb-2">Khi tắt màu này:</h4>
              <ul className="text-sm text-yellow-300 space-y-1">
                <li>• Các sản phẩm hiện tại vẫn giữ màu này</li>
                <li>• Màu sẽ không hiển thị khi tạo sản phẩm mới</li>
                <li>• Bạn có thể kích hoạt lại bất cứ lúc nào</li>
              </ul>
            </>
          )}
        </div>
      )}

      {action === "delete" && productCount === 0 && (
        <div className="border rounded-lg p-3 bg-red-900 border-red-600">
          <h4 className="font-medium text-red-200 mb-2">⚠️ Xác nhận xóa màu</h4>
          <p className="text-sm text-red-300">
            Màu này sẽ bị xóa vĩnh viễn và không thể khôi phục. Bạn có chắc chắn muốn xóa?
          </p>
        </div>
      )}
    </ConfirmModal>
  );
}
