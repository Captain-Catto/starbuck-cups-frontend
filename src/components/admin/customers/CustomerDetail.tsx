"use client";

import { useState, useEffect } from "react";
import { useAppSelector } from "@/store";
import { OrderHistory } from "./OrderHistory";
import { PhoneManager } from "./PhoneManager";
import { AddressManager } from "./AddressManager";
import { CustomerInfoManager } from "./CustomerInfoManager";

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
}

export function CustomerDetail({ customerId }: CustomerDetailProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Get auth state from Redux store
  const { token, isAuthenticated, sessionChecked } = useAppSelector(
    (state) => state.auth
  );

  // Debug auth state
  useEffect(() => {

  }, [token, isAuthenticated, sessionChecked]);

  useEffect(() => {
    // Only fetch when session has been checked and we have a token
    if (!sessionChecked) {

      return;
    }

    if (!token) {

      setError("Authentication required");
      setLoading(false);
      return;
    }

    const fetchCustomer = async () => {
      try {
        setLoading(true);
        setError(null);

        // Debug: Check if token exists

        // Include authorization header with Redux token
        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };

        if (token) {
          headers.Authorization = `Bearer ${token}`;

        } else {

        }

        const response = await fetch(`/api/admin/customers/${customerId}`, {
          headers,
        });
        const data = await response.json();


        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch customer");
        }

        setCustomer(data.data);
      } catch (error) {

        setError(
          error instanceof Error ? error.message : "Failed to fetch customer"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId, token, sessionChecked, refreshTrigger]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-600 rounded w-1/4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-600 rounded w-3/4"></div>
              <div className="h-4 bg-gray-600 rounded w-1/2"></div>
              <div className="h-4 bg-gray-600 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="text-center text-red-400">
          <div className="text-lg font-medium mb-2 text-white">
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
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="text-center text-gray-400">
          Không tìm thấy thông tin khách hàng
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Customer Overview */}
      <CustomerInfoManager
        customer={customer}
        onCustomerUpdate={() => setRefreshTrigger((prev) => prev + 1)}
      />

      {/* Phone Numbers */}
      <PhoneManager customerId={customerId} />

      {/* Addresses */}
      <AddressManager customerId={customerId} />

      {/* Order Statistics */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Thống kê đơn hàng
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {customer._count?.orders || 0}
            </div>
            <div className="text-sm text-gray-400">Tổng đơn hàng</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {customer.orders?.length || 0}
            </div>
            <div className="text-sm text-gray-400">Đơn hàng gần đây</div>
          </div>
        </div>

        {customer.notes && (
          <div className="mt-4 pt-4 border-t border-gray-600">
            <h4 className="font-medium text-white mb-2">Ghi chú</h4>
            <p className="text-sm text-gray-300">{customer.notes}</p>
          </div>
        )}
      </div>

      {/* Order History Section */}
      <OrderHistory customerId={customerId} itemsPerPage={6} />
    </div>
  );
}
