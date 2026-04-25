import { ConfirmModal } from "@/components/admin/ConfirmModal";
import type { CustomerAdmin } from "@/hooks/admin/useCustomers";

interface ConfirmModalState {
  show: boolean;
  customer: CustomerAdmin | null;
  action: "delete";
}

interface CustomerConfirmModalProps {
  confirmModal: ConfirmModalState;
  onCancel: () => void;
  onConfirm: () => void;
}

export function CustomerConfirmModal({
  confirmModal,
  onCancel,
  onConfirm,
}: CustomerConfirmModalProps) {
  if (!confirmModal.show || !confirmModal.customer) return null;

  const { customer } = confirmModal;

  return (
    <ConfirmModal
      show={confirmModal.show}
      action="delete"
      title="Xác nhận xóa khách hàng"
      subtitle="Thao tác này không thể hoàn tác"
      confirmLabel="Xóa khách hàng"
      cancelLabel="Hủy bỏ"
      onCancel={onCancel}
      onConfirm={onConfirm}
    >
      <p className="text-gray-300 mb-3">
        Bạn có chắc chắn muốn xóa khách hàng{" "}
        <strong>&ldquo;{customer.fullName || customer.messengerId}&rdquo;</strong>?
      </p>

      <div className="border rounded-lg p-3 bg-red-900 border-red-600">
        <p className="text-sm text-white">
          <strong>⚠️ Cảnh báo:</strong> Xóa khách hàng sẽ xóa toàn bộ thông tin,
          địa chỉ và lịch sử liên quan. Thao tác này không thể hoàn tác.
        </p>
      </div>
    </ConfirmModal>
  );
}
