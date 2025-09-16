"use client";

import { useState, useEffect } from "react";
import { useAppSelector } from "@/store";
import { CustomerForm } from "./CustomerForm";
import {
  User,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Shield,
  MessageSquare,
} from "lucide-react";

interface Customer {
  id: string;
  messengerId?: string | null;
  zaloId?: string | null;
  fullName: string;
  phone: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  createdByAdminId: string;
  createdByAdmin: {
    username: string;
    email: string;
  };
  addresses: Array<{
    id: string;
    customerId: string;
    addressLine: string;
    district?: string | null;
    city: string;
    postalCode?: string | null;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
  orders?: Array<{
    id: string;
    createdAt: string;
    status?: string;
    totalAmount?: number;
  }>;
  _count?: {
    orders: number;
  };
}

interface CustomerDetailProps {
  customerId: string;
  isEditing: boolean;
}

export function CustomerDetail({ customerId, isEditing }: CustomerDetailProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get auth state from Redux store
  const { token, isAuthenticated, sessionChecked } = useAppSelector(
    (state) => state.auth
  );

  // Debug auth state
  useEffect(() => {
    console.log("CustomerDetail - Auth state:", {
      token: token ? `${token.substring(0, 20)}...` : "null",
      isAuthenticated,
      sessionChecked,
    });
  }, [token, isAuthenticated, sessionChecked]);

  useEffect(() => {
    // Only fetch when session has been checked and we have a token
    if (!sessionChecked) {
      console.log("CustomerDetail - Session not yet checked, waiting...");
      return;
    }

    if (!token) {
      console.log("CustomerDetail - No token available after session check");
      setError("Authentication required");
      setLoading(false);
      return;
    }

    const fetchCustomer = async () => {
      try {
        setLoading(true);
        setError(null);

        // Debug: Check if token exists
        console.log("CustomerDetail - Redux token:", token);

        // Include authorization header with Redux token
        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };

        if (token) {
          headers.Authorization = `Bearer ${token}`;
          console.log("CustomerDetail - Sending headers:", headers);
        } else {
          console.warn("CustomerDetail - No token found in Redux store");
        }

        const response = await fetch(`/api/admin/customers/${customerId}`, {
          headers,
        });
        const data = await response.json();

        console.log("CustomerDetail - Response status:", response.status);
        console.log("CustomerDetail - Response data:", data);

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch customer");
        }

        setCustomer(data.data);
      } catch (error) {
        console.error("Error fetching customer:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch customer"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId, token, sessionChecked]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center text-red-500">
          <div className="text-lg font-medium mb-2">
            Lỗi khi tải thông tin khách hàng
          </div>
          <div className="text-sm">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          Không tìm thấy thông tin khách hàng
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <CustomerForm
          initialData={{
            messengerId: customer.messengerId || "",
            zaloId: customer.zaloId || "",
            fullName: customer.fullName,
            phone: customer.phone,
            notes: customer.notes || "",
            address: customer.addresses[0]
              ? {
                  addressLine: customer.addresses[0].addressLine,
                  district: customer.addresses[0].district || "",
                  city: customer.addresses[0].city,
                  postalCode: customer.addresses[0].postalCode || "",
                }
              : {
                  addressLine: "",
                  district: "",
                  city: "",
                  postalCode: "",
                },
          }}
          isEditing={true}
          customerId={customerId}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Customer Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {customer.fullName || "Chưa có tên"}
              </h2>
              <p className="text-gray-600">ID: {customer.id}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  Hoạt động
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Thông tin liên hệ
            </h3>
            <div className="space-y-3">
              {customer.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {customer.phone}
                    </div>
                    <div className="text-sm text-gray-500">Số điện thoại</div>
                  </div>
                </div>
              )}

              {customer.messengerId && (
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {customer.messengerId}
                    </div>
                    <div className="text-sm text-gray-500">Messenger ID</div>
                  </div>
                </div>
              )}

              {customer.zaloId && (
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {customer.zaloId}
                    </div>
                    <div className="text-sm text-gray-500">Zalo ID</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* System Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Thông tin hệ thống
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatDate(customer.createdAt)}
                  </div>
                  <div className="text-sm text-gray-500">Ngày tạo</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatDate(customer.updatedAt)}
                  </div>
                  <div className="text-sm text-gray-500">Cập nhật cuối</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {customer.createdByAdmin.username}
                  </div>
                  <div className="text-sm text-gray-500">Được tạo bởi</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Addresses */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Địa chỉ giao hàng ({customer.addresses.length})
        </h3>

        {customer.addresses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customer.addresses.map((address) => (
              <div
                key={address.id}
                className={`p-4 rounded-lg border-2 ${
                  address.isDefault
                    ? "border-green-200 bg-green-50"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900">
                      {address.isDefault ? "Địa chỉ chính" : "Địa chỉ phụ"}
                    </span>
                  </div>
                  {address.isDefault && (
                    <span className="px-2 py-1 text-xs bg-green-600 text-white rounded-full">
                      Mặc định
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-700">
                  <div>{address.addressLine}</div>
                  <div>
                    {[address.district, address.city]
                      .filter(Boolean)
                      .join(", ")}
                  </div>
                  {address.postalCode && (
                    <div className="text-gray-500">
                      Mã bưu điện: {address.postalCode}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-8">
            Chưa có địa chỉ nào được thêm
          </div>
        )}
      </div>

      {/* Order Statistics */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Thống kê đơn hàng
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {customer._count?.orders || 0}
            </div>
            <div className="text-sm text-gray-500">Tổng đơn hàng</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {customer.orders?.length || 0}
            </div>
            <div className="text-sm text-gray-500">Đơn hàng gần đây</div>
          </div>
        </div>

        {customer.notes && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Ghi chú</h4>
            <p className="text-sm text-gray-700">{customer.notes}</p>
          </div>
        )}
      </div>

      {/* Order History Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Lịch sử đơn hàng
        </h3>
        <div className="text-gray-500 text-center py-8">
          Chưa có đơn hàng nào
        </div>
      </div>
    </div>
  );
}
