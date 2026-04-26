import { Minus, Plus, X, Package, Trash2 } from "lucide-react";
import OptimizedImage from "@/components/OptimizedImage";
import { getProductSnapshotImageUrl } from "@/lib/utils/image";
import type { OrderDetailFullData, EditableOrderData } from "@/hooks/admin/useOrderDetailEdit";

interface Category { name?: string }
interface Color { name?: string }

interface OrderItemsListProps {
  order: OrderDetailFullData;
  isEditing: boolean;
  editData: EditableOrderData;
  onUpdateQuantity: (index: number, quantity: number) => void;
  onUpdatePrice: (index: number, unitPrice: number) => void;
  onRemoveItem: (index: number) => void;
  formatCurrency: (amount: string | number) => string;
}

export function OrderItemsList({
  order,
  isEditing,
  editData,
  onUpdateQuantity,
  onUpdatePrice,
  onRemoveItem,
  formatCurrency,
}: OrderItemsListProps) {
  if (order.orderType === "CUSTOM") {
    return (
      <div className="bg-gray-700 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Package className="w-5 h-5 text-gray-300" />
          <h4 className="font-medium text-white">Đơn hàng tùy chỉnh</h4>
        </div>
        <p className="text-gray-300">{order.customDescription || "Không có mô tả"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Existing items — matched by productId, not position */}
      {order.items?.map((item) => {
        const editItem = editData.items?.find((ei) => ei.productId === item.productId);
        const editItemIndex =
          editData.items?.findIndex((ei) => ei.productId === item.productId) ?? -1;

        if (isEditing && editData.items && !editItem) return null;

        const imageUrl = getProductSnapshotImageUrl(item.productSnapshot);
        const displayQty = editItem?.quantity ?? item.quantity;
        const displayPrice = editItem?.unitPrice ?? item.productSnapshot.unitPrice;

        return (
          <div key={item.id} className="flex items-start gap-4 p-4 border border-gray-700 rounded-lg">
            {imageUrl && (
              <OptimizedImage
                src={imageUrl}
                alt={item.productSnapshot.name}
                width={64}
                height={64}
                className="object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-white">{item.productSnapshot.name}</h4>
                  <div className="text-sm text-gray-300 space-y-1">
                    <div>
                      <span className="font-medium">Màu sắc: </span>
                      {/* @ts-expect-error - productSnapshot has colors array at runtime */}
                      {item.productSnapshot.colors?.map((c: Color) => c.name).join(" - ") || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">Dung tích: </span>
                      {item.productSnapshot.capacity?.name || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">Danh mục: </span>
                      {/* @ts-expect-error - productSnapshot has categories array at runtime */}
                      {item.productSnapshot.categories?.map((c: Category) => c.name).join(" - ") || "N/A"}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdateQuantity(editItemIndex, displayQty - 1)}
                        className="p-1 text-gray-400 hover:text-gray-700"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        value={displayQty}
                        onChange={(e) => onUpdateQuantity(editItemIndex, parseInt(e.target.value) || 1)}
                        min="1"
                        className="w-16 px-2 py-1 border border-gray-600 bg-gray-700 text-white rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => onUpdateQuantity(editItemIndex, displayQty + 1)}
                        className="p-1 text-gray-400 hover:text-gray-700"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onRemoveItem(editItemIndex)}
                        className="p-1 text-red-500 hover:text-red-700 ml-2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="font-medium text-gray-400">
                        {formatCurrency(item.productSnapshot.unitPrice)}
                      </div>
                      <div className="text-sm text-gray-400">x {item.quantity}</div>
                    </div>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Giá sản phẩm (VND)
                      </label>
                      <input
                        type="number"
                        value={displayPrice}
                        onChange={(e) => onUpdatePrice(editItemIndex, parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        min="0"
                        step="1000"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Thành tiền
                      </label>
                      <div className="px-3 py-2 bg-gray-700 border border-gray-700 rounded text-sm font-medium text-white">
                        {formatCurrency(displayQty * displayPrice)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-2 flex items-center justify-end">
                <div className="font-medium text-white">
                  {formatCurrency(displayQty * displayPrice)}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Newly added items (not in original order) */}
      {isEditing &&
        editData.items
          ?.filter((ei) => !order.items?.some((oi) => oi.productId === ei.productId))
          .map((newItem, idx) => (
            <div
              key={`new-${newItem.productId}-${idx}`}
              className="flex items-start gap-4 p-4 border border-gray-700 rounded-lg bg-gray-700"
            >
              <div className="w-16 h-16 bg-gray-600 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-medium text-white">
                      Sản phẩm mới (ID: {newItem.productId})
                    </h4>
                    <p className="text-sm text-green-600 font-medium">Mới thêm vào đơn hàng</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">Số lượng:</span>
                    <input
                      type="number"
                      min="1"
                      value={newItem.quantity}
                      onChange={(e) => {
                        const idx = editData.items?.findIndex(
                          (item) => item.productId === newItem.productId
                        ) ?? -1;
                        if (idx >= 0) onUpdateQuantity(idx, parseInt(e.target.value) || 1);
                      }}
                      className="w-20 px-2 py-1 text-sm border border-gray-600 bg-gray-700 text-white rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-300">Đơn giá</p>
                      <p className="text-lg font-semibold text-white">
                        {formatCurrency(newItem.unitPrice || 0)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-300">Tổng</p>
                      <p className="text-lg font-semibold text-white">
                        {formatCurrency((newItem.quantity || 1) * (newItem.unitPrice || 0))}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const idx = editData.items?.findIndex(
                          (item) => item.productId === newItem.productId
                        ) ?? -1;
                        if (idx >= 0) onRemoveItem(idx);
                      }}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full"
                      title="Xóa sản phẩm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
    </div>
  );
}
