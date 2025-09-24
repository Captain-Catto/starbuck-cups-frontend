import { ShoppingCart, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { RecentOrder } from "@/lib/api/dashboard";

interface RecentOrdersProps {
  orders: RecentOrder[];
  loading: boolean;
}

export function RecentOrders({ orders, loading }: RecentOrdersProps) {
  const router = useRouter();

  // Format currency
  const formatCurrency = (amount: number | undefined | null) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  // Format relative time
  const formatRelativeTime = (dateString: string | undefined | null) => {
    if (!dateString) return "Không rõ thời gian";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Thời gian không hợp lệ";

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} giây trước`;
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-gray-700 text-gray-300";
      case "confirmed":
        return "bg-gray-600 text-gray-200";
      case "processing":
        return "bg-gray-700 text-gray-300";
      case "shipping":
        return "bg-gray-600 text-gray-200";
      case "delivered":
        return "bg-gray-600 text-gray-200";
      case "cancelled":
        return "bg-gray-800 text-gray-400";
      default:
        return "bg-gray-800 text-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận";
      case "confirmed":
        return "Đã xác nhận";
      case "processing":
        return "Đang xử lý";
      case "shipping":
        return "Đang giao";
      case "delivered":
        return "Đã giao";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Đơn hàng gần đây</h3>
          <button
            onClick={() => router.push("/admin/orders")}
            className="text-sm text-gray-300 hover:text-white font-medium"
          >
            Xem tất cả
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg animate-pulse border border-gray-600"
                >
                  <div className="flex-1">
                    <div className="h-4 bg-gray-600 rounded w-24 mb-2"></div>
                    <div className="h-3 bg-gray-600 rounded w-32 mb-1"></div>
                    <div className="h-5 bg-gray-600 rounded w-20 mb-1"></div>
                    <div className="h-3 bg-gray-600 rounded w-40"></div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 bg-gray-600 rounded w-20 mb-1"></div>
                    <div className="h-3 bg-gray-600 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : orders && orders.length > 0 ? (
            orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600 hover:border-gray-500 transition-all"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium text-white">
                      #{order.id}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mb-1">
                    {order.customerName}
                  </p>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {order.orderType === "product"
                      ? order.productName
                      : "Đơn hàng tùy chỉnh"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">
                    {formatCurrency(order.totalAmount)}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatRelativeTime(order.createdAt)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-600" />
              <p>Chưa có đơn hàng nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
