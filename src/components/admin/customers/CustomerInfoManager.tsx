"use client";

import { useState } from "react";
import {
  User,
  MessageSquare,
  Shield,
  Calendar,
  Clock,
  Edit2,
  Check,
  X,
} from "lucide-react";
import { useAppSelector } from "@/store";
import { getApiUrl } from "@/lib/api-config";

interface Customer {
  id: string;
  messengerId?: string | null;
  zaloId?: string | null;
  fullName: string;
  notes?: string | null;
  isVip?: boolean;
  createdAt: string;
  updatedAt: string;
  createdByAdminId: string;
  createdByAdmin: {
    username: string;
    email: string;
  };
}

interface CustomerInfoManagerProps {
  customer: Customer;
  onCustomerUpdate?: () => void;
}

interface CustomerFormData {
  fullName: string;
  messengerId: string;
  zaloId: string;
  notes: string;
  isVip: boolean;
}

export function CustomerInfoManager({
  customer,
  onCustomerUpdate,
}: CustomerInfoManagerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<CustomerFormData>({
    fullName: customer.fullName || "",
    messengerId: customer.messengerId || "",
    zaloId: customer.zaloId || "",
    notes: customer.notes || "",
    isVip: customer.isVip || false,
  });

  const { token } = useAppSelector((state) => state.auth);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleUpdate = async () => {
    if (!token || !formData.fullName.trim()) return;

    try {
      const response = await fetch(
        getApiUrl(`admin/customers/${customer.id}`),
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: formData.fullName.trim(),
            messengerId: formData.messengerId.trim() || undefined,
            zaloId: formData.zaloId.trim() || undefined,
            notes: formData.notes.trim() || undefined,
            isVip: formData.isVip,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update customer");
      }

      onCustomerUpdate?.();
      setIsEditing(false);
    } catch (error) {

      alert(
        error instanceof Error ? error.message : "Failed to update customer"
      );
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setFormData({
      fullName: customer.fullName || "",
      messengerId: customer.messengerId || "",
      zaloId: customer.zaloId || "",
      notes: customer.notes || "",
      isVip: customer.isVip || false,
    });
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              {customer.fullName || "Chưa có tên"}
            </h2>
            <p className="text-gray-400">ID: {customer.id}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                Hoạt động
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              title="Chỉnh sửa"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button
                onClick={handleUpdate}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                <Check className="w-4 h-4" />
                Lưu
              </button>
              <button
                onClick={cancelEdit}
                className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
              >
                <X className="w-4 h-4" />
                Hủy
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Editable Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Thông tin liên hệ
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="Nhập họ và tên"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Messenger ID
                  </label>
                  <input
                    type="text"
                    value={formData.messengerId}
                    onChange={(e) =>
                      setFormData({ ...formData, messengerId: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="Nhập Messenger ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Zalo ID
                  </label>
                  <input
                    type="text"
                    value={formData.zaloId}
                    onChange={(e) =>
                      setFormData({ ...formData, zaloId: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="Nhập Zalo ID"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="vip-status"
                    checked={formData.isVip}
                    onChange={(e) =>
                      setFormData({ ...formData, isVip: e.target.checked })
                    }
                    className="rounded border-gray-600"
                  />
                  <label htmlFor="vip-status" className="text-sm text-gray-300">
                    Khách hàng VIP
                  </label>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Ghi chú</h3>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Ghi chú khách hàng
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="Nhập ghi chú về khách hàng"
                  rows={6}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Thông tin liên hệ
            </h3>
            <div className="space-y-3">
              {customer.messengerId && (
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-white">
                      {customer.messengerId}
                    </div>
                    <div className="text-sm text-gray-400">Messenger ID</div>
                  </div>
                </div>
              )}

              {customer.zaloId && (
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-white">
                      {customer.zaloId}
                    </div>
                    <div className="text-sm text-gray-400">Zalo ID</div>
                  </div>
                </div>
              )}

              {/* VIP Status */}
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <div>
                  <div
                    className={`text-sm font-medium ${
                      customer.isVip ? "text-yellow-400" : "text-white"
                    }`}
                  >
                    {customer.isVip ? "Khách hàng VIP" : "Khách hàng thường"}
                  </div>
                  <div className="text-sm text-gray-400">Phân loại</div>
                </div>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Thông tin hệ thống
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm font-medium text-white">
                    {formatDate(customer.createdAt)}
                  </div>
                  <div className="text-sm text-gray-400">Ngày tạo</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm font-medium text-white">
                    {formatDate(customer.updatedAt)}
                  </div>
                  <div className="text-sm text-gray-400">Cập nhật cuối</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm font-medium text-white">
                    {customer.createdByAdmin.username}
                  </div>
                  <div className="text-sm text-gray-400">Được tạo bởi</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notes Section - visible when not editing and notes exist */}
      {!isEditing && customer.notes && (
        <div className="mt-6 pt-6 border-t border-gray-600">
          <h4 className="font-medium text-white mb-2">Ghi chú</h4>
          <p className="text-sm text-gray-300">{customer.notes}</p>
        </div>
      )}
    </div>
  );
}
