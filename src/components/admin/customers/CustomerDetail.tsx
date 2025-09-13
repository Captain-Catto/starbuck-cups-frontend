"use client";

import { useState, useEffect } from "react";
import { CustomerForm } from "./CustomerForm";
import { User, Phone, Mail, MapPin, Calendar, Clock, Shield } from "lucide-react";

interface Customer {
  id: string;
  fullName?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdByAdmin: {
    id: string;
    username: string;
    email: string;
  };
  addresses: Array<{
    id: string;
    label: string;
    streetAddress: string;
    ward?: string;
    district: string;
    city: string;
    postalCode?: string;
    isDefault: boolean;
  }>;
  socialAccounts: Array<{
    id: string;
    platform: "facebook" | "zalo";
    accountIdentifier: string;
    displayName?: string;
  }>;
}

interface CustomerDetailProps {
  customerId: string;
  isEditing: boolean;
}

export function CustomerDetail({ customerId, isEditing }: CustomerDetailProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock customer data - replace with actual API call
    const mockCustomer: Customer = {
      id: customerId,
      fullName: "Nguyễn Văn An",
      phone: "0901234567",
      email: "nguyenvanan@gmail.com",
      isActive: true,
      createdAt: "2024-01-15T08:30:00Z",
      updatedAt: "2024-01-20T14:15:00Z",
      createdByAdmin: {
        id: "admin1",
        username: "admin",
        email: "admin@starbucks.com"
      },
      addresses: [
        {
          id: "addr1",
          label: "Địa chỉ chính",
          streetAddress: "123 Nguyễn Trãi",
          ward: "Phường 2",
          district: "Quận 5",
          city: "TP.HCM",
          postalCode: "70000",
          isDefault: true
        },
        {
          id: "addr2", 
          label: "Văn phòng",
          streetAddress: "456 Lê Lợi",
          ward: "Phường Bến Nghé",
          district: "Quận 1",
          city: "TP.HCM",
          postalCode: "70000",
          isDefault: false
        }
      ],
      socialAccounts: [
        {
          id: "social1",
          platform: "facebook",
          accountIdentifier: "nguyenvanan",
          displayName: "Nguyễn Văn An"
        },
        {
          id: "social2",
          platform: "zalo",
          accountIdentifier: "0901234567",
          displayName: "An Nguyễn"
        }
      ]
    };

    setTimeout(() => {
      setCustomer(mockCustomer);
      setLoading(false);
    }, 500);
  }, [customerId]);

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
            fullName: customer.fullName,
            phone: customer.phone || "",
            email: customer.email || "",
            addresses: customer.addresses.map(addr => ({
              id: addr.id,
              label: addr.label,
              streetAddress: addr.streetAddress,
              ward: addr.ward || "",
              district: addr.district,
              city: addr.city,
              postalCode: addr.postalCode || "",
              isDefault: addr.isDefault
            })),
            socialAccounts: customer.socialAccounts.map(social => ({
              id: social.id,
              platform: social.platform,
              accountIdentifier: social.accountIdentifier,
              displayName: social.displayName || ""
            }))
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
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    customer.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {customer.isActive ? "Hoạt động" : "Không hoạt động"}
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
              
              {customer.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {customer.email}
                    </div>
                    <div className="text-sm text-gray-500">Email</div>
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
                      {address.label}
                    </span>
                  </div>
                  {address.isDefault && (
                    <span className="px-2 py-1 text-xs bg-green-600 text-white rounded-full">
                      Mặc định
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-700">
                  <div>{address.streetAddress}</div>
                  <div>
                    {[address.ward, address.district, address.city]
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

      {/* Social Accounts */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Tài khoản mạng xã hội ({customer.socialAccounts.length})
        </h3>
        
        {customer.socialAccounts.length > 0 ? (
          <div className="space-y-3">
            {customer.socialAccounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-gray-200">
                  {account.platform === "facebook" ? (
                    <div className="w-5 h-5 bg-blue-600 rounded"></div>
                  ) : (
                    <div className="w-5 h-5 bg-blue-400 rounded"></div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {account.displayName || account.accountIdentifier}
                  </div>
                  <div className="text-sm text-gray-500">
                    {account.platform === "facebook" ? "Facebook" : "Zalo"} • {account.accountIdentifier}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-8">
            Chưa có tài khoản mạng xã hội nào
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