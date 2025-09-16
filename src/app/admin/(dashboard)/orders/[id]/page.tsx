"use client";

import { useState, use, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  Edit,
  Truck,
  Package,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { OrderDetail } from "@/components/admin/orders/OrderDetail";

interface OrderData {
  id: string;
  status: string;
  orderType: string;
}

interface OrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { id } = use(params);

  // Fetch order data
  const fetchOrder = useCallback(async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`/api/admin/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.success) {
        setOrder(data.data);
      }
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Update order status
  const updateStatus = async (newStatus: string) => {
    if (!order) return;

    setUpdating(true);
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`/api/admin/orders/${id}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        setOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
        // Refresh the order detail component
        await fetchOrder();
      } else {
        alert(`Lỗi: ${data.message}`);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Có lỗi xảy ra khi cập nhật trạng thái");
    } finally {
      setUpdating(false);
    }
  };

  // Get available actions based on current status
  const getAvailableActions = () => {
    if (!order) return [];

    const actions = [];
    const status = order.status.toUpperCase();

    switch (status) {
      case "PENDING":
        actions.push(
          {
            label: "Xác nhận đơn hàng",
            status: "CONFIRMED",
            color: "green",
            icon: CheckCircle,
          },
          {
            label: "Hủy đơn hàng",
            status: "CANCELLED",
            color: "red",
            icon: XCircle,
          }
        );
        break;
      case "CONFIRMED":
        actions.push(
          {
            label: "Bắt đầu xử lý",
            status: "PROCESSING",
            color: "blue",
            icon: Package,
          },
          {
            label: "Hủy đơn hàng",
            status: "CANCELLED",
            color: "red",
            icon: XCircle,
          }
        );
        break;
      case "PROCESSING":
        actions.push(
          {
            label: "Giao hàng",
            status: "SHIPPED",
            color: "orange",
            icon: Truck,
          },
          {
            label: "Hủy đơn hàng",
            status: "CANCELLED",
            color: "red",
            icon: XCircle,
          }
        );
        break;
      case "SHIPPED":
        actions.push({
          label: "Hoàn thành giao hàng",
          status: "DELIVERED",
          color: "green",
          icon: CheckCircle,
        });
        break;
    }

    return actions;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/orders"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Chi tiết đơn hàng #{id}
            </h1>
            <p className="text-gray-600 mt-1">
              Xem và quản lý thông tin đơn hàng
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            disabled={loading || updating}
          >
            <Edit className="w-4 h-4" />
            {isEditing ? "Hủy chỉnh sửa" : "Chỉnh sửa"}
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      {order && getAvailableActions().length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">
              Hành động nhanh:
            </span>
            {getAvailableActions().map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.status}
                  onClick={() => updateStatus(action.status)}
                  disabled={updating}
                  className={`flex items-center gap-2 px-3 py-1 text-sm text-${action.color}-600 bg-${action.color}-50 rounded-lg hover:bg-${action.color}-100 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Icon className="w-4 h-4" />
                  {updating ? "Đang cập nhật..." : action.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Order Detail */}
      <OrderDetail orderId={id} isEditing={isEditing} />
    </div>
  );
}
