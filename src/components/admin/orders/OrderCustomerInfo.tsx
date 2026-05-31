import { User, MapPin, Calendar, FileText } from "lucide-react";
import type { OrderDetailFullData, EditableOrderData } from "@/hooks/admin/useOrderDetailEdit";

interface OrderCustomerInfoProps {
  order: OrderDetailFullData;
  isEditing: boolean;
  editData: EditableOrderData;
  onUpdateAddress: (field: string, value: string) => void;
  onUpdateEditData: (field: keyof EditableOrderData, value: string | number) => void;
  formatDate: (dateString: string) => string;
}

export function OrderCustomerInfo({
  order,
  isEditing,
  editData,
  onUpdateAddress,
  onUpdateEditData,
  formatDate,
}: OrderCustomerInfoProps) {
  const inputClass =
    "w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <User className="size-5 text-gray-400" />
            <h3 className="font-medium text-white">Thông tin khách hàng</h3>
          </div>
          <div className="space-y-1">
            <div className="font-medium text-white">
              {order.customer.fullName || "Khách hàng"}
            </div>
            <div className="text-gray-300">
              {order.customer.customerPhones?.find((p) => p.isMain)?.phoneNumber ||
                order.customer.customerPhones?.[0]?.phoneNumber ||
                "Chưa có số điện thoại"}
            </div>
            {order.customer.email && (
              <div className="text-gray-300">{order.customer.email}</div>
            )}
          </div>
        </div>

        {/* Delivery address */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="size-5 text-gray-400" />
            <h3 className="font-medium text-white">Địa chỉ giao hàng</h3>
          </div>
          {isEditing ? (
            <div className="space-y-2">
              <input aria-label="Địa chỉ"
                type="text"
                placeholder="Địa chỉ"
                value={editData.deliveryAddress?.addressLine || ""}
                onChange={(e) => onUpdateAddress("addressLine", e.target.value)}
                className={inputClass}
              />
              <input aria-label="Quận/Huyện"
                type="text"
                placeholder="Quận/Huyện"
                value={editData.deliveryAddress?.district || ""}
                onChange={(e) => onUpdateAddress("district", e.target.value)}
                className={inputClass}
              />
              <input aria-label="Thành phố"
                type="text"
                placeholder="Thành phố"
                value={editData.deliveryAddress?.city || ""}
                onChange={(e) => onUpdateAddress("city", e.target.value)}
                className={inputClass}
              />
              <input aria-label="Mã bưu điện"
                type="text"
                placeholder="Mã bưu điện"
                value={editData.deliveryAddress?.postalCode || ""}
                onChange={(e) => onUpdateAddress("postalCode", e.target.value)}
                className={inputClass}
              />
            </div>
          ) : order.deliveryAddress ? (
            <div className="space-y-1">
              <div className="font-medium text-white">
                {order.deliveryAddress.addressLine || "Chưa có địa chỉ"}
              </div>
              <div className="text-gray-300">
                {[order.deliveryAddress.district, order.deliveryAddress.city]
                  .filter(Boolean)
                  .join(", ")}
              </div>
              {order.deliveryAddress.postalCode && (
                <div className="text-gray-300">{order.deliveryAddress.postalCode}</div>
              )}
            </div>
          ) : (
            <div className="text-gray-400">Chưa có địa chỉ giao hàng</div>
          )}
        </div>

        {/* Timeline */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="size-5 text-gray-400" />
            <h3 className="font-medium text-white">Thời gian</h3>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-300">
              <span>Tạo:</span> {formatDate(order.createdAt)}
            </div>
            {order.confirmedAt && (
              <div className="text-sm text-gray-300">
                <span>Xác nhận:</span> {formatDate(order.confirmedAt)}
              </div>
            )}
            {order.completedAt && (
              <div className="text-sm text-gray-300">
                <span>Hoàn thành:</span> {formatDate(order.completedAt)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      {(order.notes || isEditing) && (
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="size-5 text-gray-400" />
            <h3 className="font-medium text-white">Ghi chú</h3>
          </div>
          {isEditing ? (
            <textarea aria-label="Nhập ghi chú..."
              placeholder="Nhập ghi chú..."
              value={editData.notes || ""}
              onChange={(e) => onUpdateEditData("notes", e.target.value)}
              rows={3}
              className={inputClass}
            />
          ) : (
            <p className="text-gray-300">{order.notes}</p>
          )}
        </div>
      )}
    </>
  );
}
