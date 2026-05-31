"use client";

import { useState, type FormEvent } from "react";
import { useSelector } from "react-redux";
import { X, User, MapPin, Save } from "lucide-react";
import { toast } from "sonner";
import type { RootState } from "@/store";

interface CreateCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerCreated: () => void;
}

interface CustomerData {
  messengerId: string;
  zaloId: string;
  fullName: string;
  phone: string;
  notes: string;
  address: {
    addressLine: string;
    district: string;
    city: string;
    postalCode: string;
    isDefault: boolean;
  };
}

type CustomerField = keyof Omit<CustomerData, "address">;
type AddressField = keyof CustomerData["address"];

const createInitialCustomerData = (): CustomerData => ({
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

function ModalHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-center justify-between p-6 border-b">
      <h3 className="text-lg font-semibold">Thêm khách hàng mới</h3>
      <button
        type="button"
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 cursor-pointer"
      >
        <X className="size-6" />
      </button>
    </div>
  );
}

function CustomerInfoFields({
  customerData,
  onFieldChange,
}: {
  customerData: CustomerData;
  onFieldChange: (field: CustomerField, value: string) => void;
}) {
  return (
    <div className="mb-6">
      <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
        <User className="size-4" />
        Thông tin khách hàng
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            className="block text-sm font-medium text-gray-700 mb-2"
            htmlFor="createcustomermodal-messenger-id-c-a-kh-ch-h-ng"
          >
            Messenger ID
          </label>
          <input
            aria-label="Messenger ID của khách hàng"
            type="text"
            value={customerData.messengerId}
            onChange={(e) => onFieldChange("messengerId", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Messenger ID của khách hàng"
            id="createcustomermodal-messenger-id-c-a-kh-ch-h-ng"
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium text-gray-700 mb-2"
            htmlFor="createcustomermodal-zalo-id-c-a-kh-ch-h-ng"
          >
            Zalo ID
          </label>
          <input
            aria-label="Zalo ID của khách hàng"
            type="text"
            value={customerData.zaloId}
            onChange={(e) => onFieldChange("zaloId", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Zalo ID của khách hàng"
            id="createcustomermodal-zalo-id-c-a-kh-ch-h-ng"
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium text-gray-700 mb-2"
            htmlFor="createcustomermodal-nh-p-h-v-t-n"
          >
            Họ và tên <span className="text-red-500">*</span>
          </label>
          <input
            aria-label="Nhập họ và tên"
            type="text"
            required
            value={customerData.fullName}
            onChange={(e) => onFieldChange("fullName", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Nhập họ và tên"
            id="createcustomermodal-nh-p-h-v-t-n"
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium text-gray-700 mb-2"
            htmlFor="createcustomermodal-nh-p-s-i-n-tho-i"
          >
            Số điện thoại <span className="text-red-500">*</span>
          </label>
          <input
            aria-label="Nhập số điện thoại"
            type="tel"
            required
            value={customerData.phone}
            onChange={(e) => onFieldChange("phone", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Nhập số điện thoại"
            id="createcustomermodal-nh-p-s-i-n-tho-i"
          />
        </div>

        <div className="md:col-span-2">
          <label
            className="block text-sm font-medium text-gray-700 mb-2"
            htmlFor="createcustomermodal-ghi-ch-th-m-v-kh-ch-h-ng"
          >
            Ghi chú
          </label>
          <textarea
            aria-label="Ghi chú thêm về khách hàng..."
            value={customerData.notes}
            onChange={(e) => onFieldChange("notes", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            rows={3}
            placeholder="Ghi chú thêm về khách hàng..."
            id="createcustomermodal-ghi-ch-th-m-v-kh-ch-h-ng"
          />
        </div>
      </div>
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>Lưu ý:</strong> Cần điền ít nhất một trong Messenger ID hoặc
          Zalo ID
        </p>
      </div>
    </div>
  );
}

function AddressInfoFields({
  address,
  onAddressChange,
}: {
  address: CustomerData["address"];
  onAddressChange: (field: AddressField, value: string) => void;
}) {
  return (
    <div className="mb-6">
      <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
        <MapPin className="size-4" />
        Địa chỉ khách hàng
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label
            className="block text-sm font-medium text-gray-700 mb-2"
            htmlFor="createcustomermodal-s-nh-t-n-ng-ph-ng-x"
          >
            Địa chỉ chi tiết <span className="text-red-500">*</span>
          </label>
          <input
            aria-label="Số nhà, tên đường, phường/xã..."
            type="text"
            required
            value={address.addressLine}
            onChange={(e) => onAddressChange("addressLine", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Số nhà, tên đường, phường/xã..."
            id="createcustomermodal-s-nh-t-n-ng-ph-ng-x"
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium text-gray-700 mb-2"
            htmlFor="createcustomermodal-qu-n-huy-n"
          >
            Quận/Huyện
          </label>
          <input
            aria-label="Quận/Huyện"
            type="text"
            value={address.district}
            onChange={(e) => onAddressChange("district", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Quận/Huyện"
            id="createcustomermodal-qu-n-huy-n"
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium text-gray-700 mb-2"
            htmlFor="createcustomermodal-t-nh-th-nh-ph"
          >
            Tỉnh/Thành phố <span className="text-red-500">*</span>
          </label>
          <input
            aria-label="Tỉnh/Thành phố"
            type="text"
            required
            value={address.city}
            onChange={(e) => onAddressChange("city", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Tỉnh/Thành phố"
            id="createcustomermodal-t-nh-th-nh-ph"
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium text-gray-700 mb-2"
            htmlFor="createcustomermodal-m-b-u-i-n"
          >
            Mã bưu điện
          </label>
          <input
            aria-label="Mã bưu điện"
            type="text"
            value={address.postalCode}
            onChange={(e) => onAddressChange("postalCode", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Mã bưu điện"
            id="createcustomermodal-m-b-u-i-n"
          />
        </div>
      </div>
    </div>
  );
}

function ModalFooter({
  loading,
  onCancel,
  onSubmit,
}: {
  loading: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="border-t p-6">
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
        >
          Hủy
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
        >
          {loading && (
            <div className="animate-spin rounded-full size-4 border-b-2 border-white"></div>
          )}
          <Save className="size-4" />
          Tạo khách hàng
        </button>
      </div>
    </div>
  );
}

export default function CreateCustomerModal({
  isOpen,
  onClose,
  onCustomerCreated,
}: CreateCustomerModalProps) {
  const [loading, setLoading] = useState(false);
  const token = useSelector((state: RootState) => state.auth.token);
  const [customerData, setCustomerData] = useState(createInitialCustomerData);

  const updateCustomerField = (field: CustomerField, value: string) => {
    setCustomerData((prev) => ({ ...prev, [field]: value }));
  };

  const updateAddressField = (field: AddressField, value: string) => {
    setCustomerData((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  };

  const handleSubmit = async (event?: FormEvent) => {
    event?.preventDefault();

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

      const response = await fetch("/api/admin/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Tạo khách hàng thành công!");
        onCustomerCreated();
        resetForm();
      } else {
        toast.error(data.message || "Có lỗi xảy ra khi tạo khách hàng");
      }
    } catch {
      toast.error("Có lỗi xảy ra khi tạo khách hàng");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCustomerData(createInitialCustomerData());
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-zinc-950 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <ModalHeader onClose={handleClose} />

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <CustomerInfoFields
            customerData={customerData}
            onFieldChange={updateCustomerField}
          />
          <AddressInfoFields
            address={customerData.address}
            onAddressChange={updateAddressField}
          />
        </form>

        <ModalFooter
          loading={loading}
          onCancel={handleClose}
          onSubmit={() => void handleSubmit()}
        />
      </div>
    </div>
  );
}
