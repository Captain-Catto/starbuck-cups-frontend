import { Save } from "lucide-react";
import type { OrderDetailFullData } from "@/hooks/admin/useOrderDetailEdit";

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Chờ xử lý", color: "bg-yellow-100 text-yellow-800" },
  CONFIRMED: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-800" },
  PROCESSING: { label: "Đang xử lý", color: "bg-purple-100 text-purple-800" },
  SHIPPED: { label: "Đang giao", color: "bg-orange-100 text-orange-800" },
  DELIVERED: { label: "Đã giao", color: "bg-green-100 text-green-800" },
  CANCELLED: { label: "Đã hủy", color: "bg-red-100 text-red-800" },
  pending: { label: "Chờ xử lý", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-800" },
  processing: { label: "Đang xử lý", color: "bg-purple-100 text-purple-800" },
  shipped: { label: "Đang giao", color: "bg-orange-100 text-orange-800" },
  delivered: { label: "Đã giao", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-800" },
};

interface OrderDetailHeaderProps {
  order: OrderDetailFullData;
  isEditing: boolean;
  saving: boolean;
  onSave: () => void;
  isFreeShipping: (order: OrderDetailFullData) => boolean;
  formatCurrency: (amount: string | number) => string;
}

export function OrderDetailHeader({
  order,
  isEditing,
  saving,
  onSave,
  isFreeShipping,
  formatCurrency,
}: OrderDetailHeaderProps) {
  return (
    <>
      {isEditing && (
        <div className="flex justify-end mb-4">
          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      )}

      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Đơn hàng #{order.orderNumber}
          </h2>
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                statusConfig[order.status]?.color || "bg-gray-100 text-gray-800"
              }`}
            >
              {statusConfig[order.status]?.label || order.status}
            </span>
            <span className="text-gray-400">
              {order.orderType === "CUSTOM" ? "Đơn tùy chỉnh" : "Đơn sản phẩm"}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">
            {formatCurrency(
              Number(order.totalAmount) +
                (isFreeShipping(order) ? 0 : Number(order.shippingCost))
            )}
          </div>
          <div className="text-sm text-gray-400">
            {isFreeShipping(order)
              ? `Miễn phí vận chuyển (Giảm: ${formatCurrency(order.originalShippingCost)})`
              : `+ ${formatCurrency(order.shippingCost)} ship`}
          </div>
        </div>
      </div>
    </>
  );
}
