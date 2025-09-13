"use client";

import { useState, useEffect } from "react";
import { User, Package, MapPin, Calendar, Clock, DollarSign, Truck, FileText } from "lucide-react";

interface OrderDetailData {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    fullName?: string;
    phone?: string;
    email?: string;
  };
  orderType: "custom" | "product";
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  totalAmount: number;
  shippingCost: number;
  isFreeShipping: boolean;
  customDescription?: string;
  deliveryAddress?: {
    id: string;
    label: string;
    streetAddress: string;
    ward?: string;
    district: string;
    city: string;
  };
  notes?: string;
  items?: Array<{
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    requestedColor?: string;
    productSnapshot: {
      name: string;
      displayColor: string;
      capacity: string;
      category: string;
      images: string[];
    };
  }>;
  statusHistory: Array<{
    status: string;
    timestamp: string;
    note?: string;
    updatedBy?: string;
  }>;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  completedAt?: string;
}

interface OrderDetailProps {
  orderId: string;
  isEditing: boolean;
}

const statusConfig = {
  pending: { label: "Chờ xử lý", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-800" },
  processing: { label: "Đang xử lý", color: "bg-purple-100 text-purple-800" },
  shipped: { label: "Đang giao", color: "bg-orange-100 text-orange-800" },
  delivered: { label: "Đã giao", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-800" }
};

export function OrderDetail({ orderId, isEditing }: OrderDetailProps) {
  const [order, setOrder] = useState<OrderDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock order data - replace with actual API call
    const mockOrder: OrderDetailData = {
      id: orderId,
      orderNumber: "ORD-20240115-0001",
      customer: {
        id: "cust1",
        fullName: "Nguyễn Văn An",
        phone: "0901234567",
        email: "nguyenvanan@gmail.com"
      },
      orderType: "product",
      status: "confirmed",
      totalAmount: 450000,
      shippingCost: 30000,
      isFreeShipping: false,
      deliveryAddress: {
        id: "addr1",
        label: "Địa chỉ chính",
        streetAddress: "123 Nguyễn Trãi",
        ward: "Phường 2",
        district: "Quận 5",
        city: "TP.HCM"
      },
      notes: "Khách hàng yêu cầu giao vào buổi sáng",
      items: [
        {
          id: "item1",
          productId: "prod1",
          productName: "Ly Starbucks Classic",
          quantity: 2,
          unitPrice: 150000,
          requestedColor: "Đỏ",
          productSnapshot: {
            name: "Ly Starbucks Classic",
            displayColor: "Trắng",
            capacity: "450ml",
            category: "Tumblers",
            images: ["/images/cup1.jpg"]
          }
        },
        {
          id: "item2",
          productId: "prod2",
          productName: "Ly Starbucks Premium",
          quantity: 1,
          unitPrice: 150000,
          productSnapshot: {
            name: "Ly Starbucks Premium",
            displayColor: "Đen",
            capacity: "500ml",
            category: "Tumblers",
            images: ["/images/cup2.jpg"]
          }
        }
      ],
      statusHistory: [
        {
          status: "pending",
          timestamp: "2024-01-15T08:30:00Z",
          note: "Đơn hàng được tạo",
          updatedBy: "admin"
        },
        {
          status: "confirmed",
          timestamp: "2024-01-15T09:15:00Z",
          note: "Đã xác nhận và kiểm tra tồn kho",
          updatedBy: "admin"
        }
      ],
      createdAt: "2024-01-15T08:30:00Z",
      updatedAt: "2024-01-15T09:15:00Z",
      confirmedAt: "2024-01-15T09:15:00Z"
    };

    setTimeout(() => {
      setOrder(mockOrder);
      setLoading(false);
    }, 500);
  }, [orderId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND"
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          Không tìm thấy thông tin đơn hàng
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Order Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Đơn hàng {order.orderNumber}
            </h2>
            <div className="flex items-center gap-4 mt-2">
              <span
                className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  statusConfig[order.status].color
                }`}
              >
                {statusConfig[order.status].label}
              </span>
              <span className="text-sm text-gray-500">
                {order.orderType === "custom" ? "Đơn tùy chỉnh" : "Đơn sản phẩm"}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(order.totalAmount + order.shippingCost)}
            </div>
            <div className="text-sm text-gray-500">
              {order.isFreeShipping ? "Miễn phí vận chuyển" : `+ ${formatCurrency(order.shippingCost)} ship`}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Customer Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <User className="w-5 h-5" />
              Khách hàng
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">{order.customer.fullName || "Chưa có tên"}</span>
              </div>
              <div className="text-gray-600">{order.customer.phone}</div>
              {order.customer.email && (
                <div className="text-gray-600">{order.customer.email}</div>
              )}
            </div>
          </div>

          {/* Delivery Address */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Địa chỉ giao hàng
            </h3>
            {order.deliveryAddress ? (
              <div className="text-sm">
                <div className="font-medium">{order.deliveryAddress.label}</div>
                <div className="text-gray-700">{order.deliveryAddress.streetAddress}</div>
                <div className="text-gray-600">
                  {[order.deliveryAddress.ward, order.deliveryAddress.district, order.deliveryAddress.city]
                    .filter(Boolean)
                    .join(", ")}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">Chưa có địa chỉ giao hàng</div>
            )}
          </div>

          {/* Order Dates */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Thời gian
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Tạo:</span> {formatDate(order.createdAt)}
              </div>
              {order.confirmedAt && (
                <div>
                  <span className="text-gray-600">Xác nhận:</span> {formatDate(order.confirmedAt)}
                </div>
              )}
              {order.completedAt && (
                <div>
                  <span className="text-gray-600">Hoàn thành:</span> {formatDate(order.completedAt)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Chi tiết đơn hàng
        </h3>

        {order.orderType === "custom" ? (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Mô tả tùy chỉnh</h4>
            <p className="text-gray-700">
              {order.customDescription || "Không có mô tả"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {order.items?.map((item, index) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{item.productName}</h4>
                        <div className="text-sm text-gray-600">
                          {item.productSnapshot.displayColor} • {item.productSnapshot.capacity} • {item.productSnapshot.category}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Số lượng:</span>
                        <div className="font-medium">{item.quantity}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Đơn giá:</span>
                        <div className="font-medium">{formatCurrency(item.unitPrice)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Màu yêu cầu:</span>
                        <div className="font-medium">
                          {item.requestedColor || item.productSnapshot.displayColor}
                          {item.requestedColor && item.requestedColor !== item.productSnapshot.displayColor && (
                            <span className="text-blue-600"> (Khác màu gốc)</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Thành tiền:</span>
                        <div className="font-semibold text-lg">
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Order Summary */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-end">
                <div className="w-full md:w-1/3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tổng sản phẩm:</span>
                    <span className="font-medium">{formatCurrency(order.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí vận chuyển:</span>
                    <span className="font-medium">
                      {order.isFreeShipping ? "Miễn phí" : formatCurrency(order.shippingCost)}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Tổng cộng:</span>
                      <span>{formatCurrency(order.totalAmount + order.shippingCost)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Ghi chú
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700">{order.notes}</p>
          </div>
        </div>
      )}

      {/* Status History */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Lịch sử trạng thái
        </h3>
        
        <div className="space-y-4">
          {order.statusHistory.map((history, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      statusConfig[history.status as keyof typeof statusConfig]?.color || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {statusConfig[history.status as keyof typeof statusConfig]?.label || history.status}
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatDate(history.timestamp)}
                  </span>
                  {history.updatedBy && (
                    <span className="text-sm text-gray-500">
                      bởi {history.updatedBy}
                    </span>
                  )}
                </div>
                {history.note && (
                  <p className="text-sm text-gray-700 mt-1">{history.note}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}