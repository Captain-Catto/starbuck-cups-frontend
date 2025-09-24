"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppSelector } from "@/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, MapPin, Calendar, DollarSign } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";

interface ProductSnapshot {
  unitPrice?: number;
  price?: number;
  name: string;
  capacity?: {
    name: string;
  };
}

interface OrderItem {
  id: string;
  quantity: number;
  productSnapshot: ProductSnapshot;
  product: {
    name: string;
    slug: string;
    capacity: {
      name: string;
    };
  };
}

interface DeliveryAddress {
  addressLine?: string;
  address?: string;
  district?: string;
  city?: string;
  postalCode?: string;
}

interface Order {
  id: string;
  orderNumber?: string;
  status: string;
  orderType: string;
  totalAmount: number;
  notes?: string;
  createdAt: string;
  items: OrderItem[];
  deliveryAddress?: DeliveryAddress;
}

interface OrderHistoryData {
  items: Order[];
  customer: {
    id: string;
    name: string;
  };
  pagination: {
    current_page: number;
    per_page: number;
    total_pages: number;
    total_items: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

interface OrderHistoryProps {
  customerId: string;
  itemsPerPage?: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusColor = (status: string) => {
  switch (status?.toUpperCase()) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "PROCESSING":
      return "bg-blue-100 text-blue-800";
    case "SHIPPED":
      return "bg-purple-100 text-purple-800";
    case "DELIVERED":
      return "bg-green-100 text-green-800";
    case "CANCELLED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusText = (status: string) => {
  switch (status?.toUpperCase()) {
    case "PENDING":
      return "Chờ xử lý";
    case "PROCESSING":
      return "Đang xử lý";
    case "CONFIRMED":
      return "Đã xác nhận";
    case "SHIPPED":
      return "Đã giao vận";
    case "DELIVERED":
      return "Đã giao";
    case "CANCELLED":
      return "Đã hủy";
    default:
      return status;
  }
};

export function OrderHistory({
  customerId,
  itemsPerPage = 5,
}: OrderHistoryProps) {
  const [data, setData] = useState<OrderHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Get token from Redux store
  const { token } = useAppSelector((state) => state.auth);

  const fetchOrders = useCallback(
    async (page: number) => {
      try {
        setLoading(true);
        setError(null);

        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch(
          `/api/admin/customers/${customerId}/orders?page=${page}&limit=${itemsPerPage}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }

        const result = await response.json();
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    },
    [customerId, itemsPerPage, token]
  );

  useEffect(() => {
    if (token && customerId) {
      fetchOrders(currentPage);
    }
  }, [customerId, currentPage, token, itemsPerPage, fetchOrders]);

  const goToPage = (page: number) => {
    if (page >= 1 && data && page <= data.pagination.total_pages) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử đơn hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử đơn hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500 py-8">
            <div className="text-lg font-medium mb-2">
              Lỗi khi tải lịch sử đơn hàng
            </div>
            <div className="text-sm">{error}</div>
            <button
              onClick={() => fetchOrders(currentPage)}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Thử lại
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.items.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử đơn hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            Chưa có đơn hàng nào
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lịch sử đơn hàng</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.items.map((order) => (
            <div
              key={order.id}
              className="p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-700"
            >
              {/* Order Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="font-medium text-white text-sm">
                      #{order.orderNumber || order.id.substring(0, 8)}
                    </div>
                    <div className="text-xs text-gray-400 flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {getStatusText(order.status)}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-1 mb-2">
                {order.items.map((item) => {
                  const unitPrice =
                    item.productSnapshot?.unitPrice ||
                    item.productSnapshot?.price ||
                    0;
                  const subtotal = unitPrice * item.quantity;
                  return (
                    <div
                      key={item.id}
                      className="flex justify-between items-center text-xs"
                    >
                      <div className="text-gray-300">
                        <span className="font-medium">{item.product.name}</span>
                        {item.product.capacity && (
                          <span className="text-gray-500 ml-1">
                            ({item.product.capacity.name})
                          </span>
                        )}
                        <span className="text-gray-500 ml-1">
                          x{item.quantity}
                        </span>
                      </div>
                      <div className="text-white font-medium text-xs">
                        {formatCurrency(subtotal)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Delivery Address */}
              {order.deliveryAddress && (
                <div className="flex items-start space-x-1 mb-2 text-xs text-gray-400">
                  <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <div className="truncate">
                    <div className="truncate">
                      {order.deliveryAddress.addressLine ||
                        order.deliveryAddress.address}
                    </div>
                    {order.deliveryAddress.district &&
                      order.deliveryAddress.city && (
                        <div className="truncate">
                          {[
                            order.deliveryAddress.district,
                            order.deliveryAddress.city,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </div>
                      )}
                  </div>
                </div>
              )}

              {/* Order Total */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-600">
                <div className="flex items-center space-x-1 text-xs text-gray-400">
                  <DollarSign className="h-3 w-3" />
                  <span>Tổng:</span>
                </div>
                <div className="font-bold text-green-400 text-sm">
                  {formatCurrency(order.totalAmount)}
                </div>
              </div>

              {/* Notes */}
              {order.notes && (
                <div className="mt-2 pt-2 border-t border-gray-600">
                  <div className="text-xs text-gray-400">
                    <strong>Ghi chú:</strong> {order.notes}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pagination */}
        {data.pagination.total_pages > 1 && (
          <div className="mt-6 pt-4 border-t border-gray-700">
            <Pagination data={data.pagination} onPageChange={goToPage} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
