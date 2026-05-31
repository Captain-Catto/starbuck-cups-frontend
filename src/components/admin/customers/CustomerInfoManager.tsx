"use client";

import { memo, useCallback, useState, type ReactNode } from "react";
import { toast } from "sonner";
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

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const MESSAGE_ICON = <MessageSquare className="size-5 text-gray-400" />;
const SHIELD_ICON = <Shield className="size-5 text-gray-400" />;
const CALENDAR_ICON = <Calendar className="size-5 text-gray-400" />;
const CLOCK_ICON = <Clock className="size-5 text-gray-400" />;

const InfoRow = memo(function InfoRow({
  icon,
  value,
  label,
  valueClassName = "text-white",
}: {
  icon: ReactNode;
  value: string;
  label: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <div>
        <div className={`text-sm font-medium ${valueClassName}`}>{value}</div>
        <div className="text-sm text-gray-400">{label}</div>
      </div>
    </div>
  );
});

const CustomerHeader = memo(function CustomerHeader({
  customer,
  isEditing,
  onEdit,
  onSave,
  onCancel,
}: {
  customer: Customer;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-center gap-4">
        <div className="size-16 bg-green-100 rounded-full flex items-center justify-center">
          <User className="size-8 text-green-600" />
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
            type="button"
            onClick={onEdit}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            title="Chỉnh sửa"
          >
            <Edit2 className="size-4" />
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onSave}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm cursor-pointer"
            >
              <Check className="size-4" />
              Lưu
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm cursor-pointer"
            >
              <X className="size-4" />
              Hủy
            </button>
          </>
        )}
      </div>
    </div>
  );
});

const CustomerEditForm = memo(function CustomerEditForm({
  formData,
  onFieldChange,
}: {
  formData: CustomerFormData;
  onFieldChange: (field: keyof CustomerFormData, value: string | boolean) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Thông tin liên hệ</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="customerinfomanager-fullname">
                Họ và tên *
              </label>
              <input
                aria-label="Nhập họ và tên"
                type="text"
                id="customerinfomanager-fullname"
                value={formData.fullName}
                onChange={(e) => onFieldChange("fullName", e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                placeholder="Nhập họ và tên"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="customerinfomanager-messenger">
                Messenger ID
              </label>
              <input
                aria-label="Nhập Messenger ID"
                type="text"
                id="customerinfomanager-messenger"
                value={formData.messengerId}
                onChange={(e) => onFieldChange("messengerId", e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                placeholder="Nhập Messenger ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="customerinfomanager-zalo">
                Zalo ID
              </label>
              <input
                aria-label="Nhập Zalo ID"
                type="text"
                id="customerinfomanager-zalo"
                value={formData.zaloId}
                onChange={(e) => onFieldChange("zaloId", e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                placeholder="Nhập Zalo ID"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                aria-label="vip status"
                type="checkbox"
                id="vip-status"
                checked={formData.isVip}
                onChange={(e) => onFieldChange("isVip", e.target.checked)}
                className="rounded border-gray-600"
              />
              <label htmlFor="vip-status" className="text-sm text-gray-300">
                Khách hàng VIP
              </label>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Ghi chú</h3>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="customerinfomanager-notes">
              Ghi chú khách hàng
            </label>
            <textarea
              aria-label="Nhập ghi chú về khách hàng"
              id="customerinfomanager-notes"
              value={formData.notes}
              onChange={(e) => onFieldChange("notes", e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              placeholder="Nhập ghi chú về khách hàng"
              rows={6}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

const ReadOnlyCustomerInfo = memo(function ReadOnlyCustomerInfo({ customer }: { customer: Customer }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Thông tin liên hệ</h3>
        <div className="space-y-3">
          {customer.messengerId && (
            <InfoRow icon={MESSAGE_ICON} value={customer.messengerId} label="Messenger ID" />
          )}
          {customer.zaloId && (
            <InfoRow icon={MESSAGE_ICON} value={customer.zaloId} label="Zalo ID" />
          )}
          <InfoRow
            icon={SHIELD_ICON}
            value={customer.isVip ? "Khách hàng VIP" : "Khách hàng thường"}
            label="Phân loại"
            valueClassName={customer.isVip ? "text-yellow-400" : "text-white"}
          />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Thông tin hệ thống</h3>
        <div className="space-y-3">
          <InfoRow icon={CALENDAR_ICON} value={formatDate(customer.createdAt)} label="Ngày tạo" />
          <InfoRow icon={CLOCK_ICON} value={formatDate(customer.updatedAt)} label="Cập nhật cuối" />
          <InfoRow icon={SHIELD_ICON} value={customer.createdByAdmin.username} label="Được tạo bởi" />
        </div>
      </div>
    </div>
  );
});

const CustomerNotes = memo(function CustomerNotes({ notes }: { notes?: string | null }) {
  if (!notes) return null;
  return (
    <div className="mt-6 pt-6 border-t border-gray-600">
      <h4 className="font-medium text-white mb-2">Ghi chú</h4>
      <p className="text-sm text-gray-300">{notes}</p>
    </div>
  );
});

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

  const token = useAppSelector((state) => state.auth.token);

  const handleFieldChange = useCallback((
    field: keyof CustomerFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleEdit = useCallback(() => setIsEditing(true), []);

  const cancelEdit = useCallback(() => {
    setIsEditing(false);
    setFormData({
      fullName: customer.fullName || "",
      messengerId: customer.messengerId || "",
      zaloId: customer.zaloId || "",
      notes: customer.notes || "",
      isVip: customer.isVip || false,
    });
  }, [customer]);

  const handleUpdate = useCallback(async () => {
    if (!token || !formData.fullName.trim()) return;
    try {
      const response = await fetch(getApiUrl(`admin/customers/${customer.id}`), {
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
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update customer");
      }
      onCustomerUpdate?.();
      setIsEditing(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Có lỗi xảy ra khi cập nhật thông tin khách hàng"
      );
    }
  }, [token, formData, customer.id, onCustomerUpdate]);

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <CustomerHeader
        customer={customer}
        isEditing={isEditing}
        onEdit={handleEdit}
        onSave={handleUpdate}
        onCancel={cancelEdit}
      />
      {isEditing ? (
        <CustomerEditForm formData={formData} onFieldChange={handleFieldChange} />
      ) : (
        <ReadOnlyCustomerInfo customer={customer} />
      )}
      {!isEditing && <CustomerNotes notes={customer.notes} />}
    </div>
  );
}
