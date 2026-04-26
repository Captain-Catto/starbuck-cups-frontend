import type { OrderDetailFullData, EditableOrderData } from "@/hooks/admin/useOrderDetailEdit";

interface OrderTotalsProps {
  order: OrderDetailFullData;
  isEditing: boolean;
  editData: EditableOrderData;
  onUpdateEditData: (field: keyof EditableOrderData, value: string | number) => void;
  onSetEditData: React.Dispatch<React.SetStateAction<EditableOrderData>>;
  calculateUpdatedTotal: () => number;
  isFreeShipping: (order: OrderDetailFullData) => boolean;
  formatCurrency: (amount: string | number) => string;
}

export function OrderTotals({
  order,
  isEditing,
  editData,
  onUpdateEditData,
  onSetEditData,
  calculateUpdatedTotal,
  isFreeShipping,
  formatCurrency,
}: OrderTotalsProps) {
  const inputClass =
    "w-24 px-2 py-1 border border-gray-600 bg-gray-700 text-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500";

  return (
    <div className="mt-6 pt-6 border-t border-gray-700">
      <div className="space-y-2">
        {/* Subtotal */}
        <div className="flex justify-between">
          <span className="text-gray-300">Tạm tính:</span>
          {isEditing && order.orderType === "CUSTOM" ? (
            <input
              type="number"
              value={editData.totalAmount || 0}
              onChange={(e) =>
                onSetEditData((prev) => ({ ...prev, totalAmount: e.target.value }))
              }
              className="text-right font-medium border border-gray-600 bg-gray-700 text-white rounded px-2 py-1 w-32"
              placeholder="Nhập giá tùy chỉnh"
            />
          ) : (
            <span className="font-medium text-white">
              {formatCurrency(order.totalAmount)}
            </span>
          )}
        </div>

        {/* Shipping */}
        <div className="flex justify-between">
          <span className="text-gray-300">Phí vận chuyển:</span>
          {isEditing ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Gốc:</span>
                <input
                  type="number"
                  value={editData.originalShippingCost}
                  onChange={(e) => onUpdateEditData("originalShippingCost", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Giảm:</span>
                <input
                  type="number"
                  value={editData.shippingDiscount}
                  onChange={(e) => onUpdateEditData("shippingDiscount", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Thực:</span>
                <input
                  type="number"
                  value={editData.shippingCost}
                  onChange={(e) => onUpdateEditData("shippingCost", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          ) : (
            <span className="font-medium text-white">
              {isFreeShipping(order) ? (
                <span>
                  <span className="text-green-600">Miễn phí</span>
                  <span className="text-gray-400 text-sm ml-2">
                    (Giảm: {formatCurrency(order.originalShippingCost)})
                  </span>
                </span>
              ) : (
                formatCurrency(order.shippingCost)
              )}
            </span>
          )}
        </div>

        {/* Grand total */}
        <div className="flex justify-between text-lg font-semibold border-t border-gray-700 pt-2 text-white">
          <span>Tổng cộng:</span>
          <span>
            {isEditing
              ? formatCurrency(
                  calculateUpdatedTotal() +
                    Number(editData.shippingCost || order.shippingCost || 0)
                )
              : formatCurrency(
                  Number(order.totalAmount || 0) +
                    (isFreeShipping(order) ? 0 : Number(order.shippingCost || 0))
                )}
          </span>
        </div>
      </div>
    </div>
  );
}
