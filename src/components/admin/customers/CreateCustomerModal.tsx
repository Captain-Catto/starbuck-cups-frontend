"use client";

import { useState } from "react";
import { X, User, MapPin, Save } from "lucide-react";
import { toast } from "sonner";

interface CreateCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerCreated: () => void;
}

export default function CreateCustomerModal({
  isOpen,
  onClose,
  onCustomerCreated,
}: CreateCustomerModalProps) {
  const [loading, setLoading] = useState(false);
  const [customerData, setCustomerData] = useState({
    messengerId: "",
    zaloId: "",
    fullName: "",
    phone: "",
    notes: "",
    address: {
      addressLine: "",
      district: "",
      city: "",
      postalCode: "",
      isDefault: true,
    },
  });

  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem("admin_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !customerData.fullName ||
      !customerData.phone ||
      !customerData.address.addressLine ||
      !customerData.address.city
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    if (!customerData.messengerId && !customerData.zaloId) {
      toast.error("Vui lòng điền ít nhất một trong Messenger ID hoặc Zalo ID");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        messengerId: customerData.messengerId || undefined,
        zaloId: customerData.zaloId || undefined,
        fullName: customerData.fullName,
        phone: customerData.phone,
        notes: customerData.notes || undefined,
        address: {
          addressLine: customerData.address.addressLine,
          district: customerData.address.district || undefined,
          city: customerData.address.city,
          postalCode: customerData.address.postalCode || undefined,
          isDefault: true,
        },
      };

      console.log("Creating customer with payload:", payload);

      const response = await fetch("/api/admin/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("Create customer response:", data);

      if (data.success) {
        toast.success("Tạo khách hàng thành công!");
        onCustomerCreated();
        resetForm();
      } else {
        toast.error(data.message || "Có lỗi xảy ra khi tạo khách hàng");
      }
    } catch (error) {
      console.error("Error creating customer:", error);
      toast.error("Có lỗi xảy ra khi tạo khách hàng");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCustomerData({
      messengerId: "",
      zaloId: "",
      fullName: "",
      phone: "",
      notes: "",
      address: {
        addressLine: "",
        district: "",
        city: "",
        postalCode: "",
        isDefault: true,
      },
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold">Thêm khách hàng mới</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {/* Customer Info */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-4 h-4" />
              Thông tin khách hàng
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Messenger ID
                </label>
                <input
                  type="text"
                  value={customerData.messengerId}
                  onChange={(e) =>
                    setCustomerData({
                      ...customerData,
                      messengerId: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Messenger ID của khách hàng"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zalo ID
                </label>
                <input
                  type="text"
                  value={customerData.zaloId}
                  onChange={(e) =>
                    setCustomerData({ ...customerData, zaloId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Zalo ID của khách hàng"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerData.fullName}
                  onChange={(e) =>
                    setCustomerData({
                      ...customerData,
                      fullName: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Nhập họ và tên"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={customerData.phone}
                  onChange={(e) =>
                    setCustomerData({ ...customerData, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Nhập số điện thoại"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú
                </label>
                <textarea
                  value={customerData.notes}
                  onChange={(e) =>
                    setCustomerData({ ...customerData, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  rows={3}
                  placeholder="Ghi chú thêm về khách hàng..."
                />
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Lưu ý:</strong> Cần điền ít nhất một trong Messenger ID
                hoặc Zalo ID
              </p>
            </div>
          </div>

          {/* Address Info */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Địa chỉ khách hàng
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ chi tiết <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerData.address.addressLine}
                  onChange={(e) =>
                    setCustomerData({
                      ...customerData,
                      address: {
                        ...customerData.address,
                        addressLine: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Số nhà, tên đường, phường/xã..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quận/Huyện
                </label>
                <input
                  type="text"
                  value={customerData.address.district}
                  onChange={(e) =>
                    setCustomerData({
                      ...customerData,
                      address: {
                        ...customerData.address,
                        district: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Quận/Huyện"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tỉnh/Thành phố <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerData.address.city}
                  onChange={(e) =>
                    setCustomerData({
                      ...customerData,
                      address: {
                        ...customerData.address,
                        city: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Tỉnh/Thành phố"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã bưu điện
                </label>
                <input
                  type="text"
                  value={customerData.address.postalCode}
                  onChange={(e) =>
                    setCustomerData({
                      ...customerData,
                      address: {
                        ...customerData.address,
                        postalCode: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Mã bưu điện"
                />
              </div>
            </div>
          </div>
        </form>

        <div className="border-t p-6">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <Save className="w-4 h-4" />
              Tạo khách hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
