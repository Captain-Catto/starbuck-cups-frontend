"use client";

import { Edit, Trash2, MapPin } from "lucide-react";

export interface Address {
  id: string;
  customerId: string;
  addressLine?: string; // From backend
  streetAddress?: string; // From frontend
  ward?: string;
  district?: string;
  city: string;
  postalCode?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AddressCardProps {
  address: Address;
  isEditing: boolean;
  actionLoading: string | null;
  handleSetDefault: (addressId: string) => void;
  handleStartEdit: (address: Address) => void;
  showDeleteConfirm: (addressId: string) => void;
}

export function AddressCard({
  address,
  isEditing,
  actionLoading,
  handleSetDefault,
  handleStartEdit,
  showDeleteConfirm,
}: AddressCardProps) {
  return (
    <div
      className={`p-4 rounded-lg border-2 ${
        address.isDefault
          ? "border-green-600 bg-green-900/20"
          : "border-gray-600 bg-gray-700"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <MapPin className="size-4 text-gray-400" />
          <span className="font-medium text-white">
            {address.isDefault ? "Địa chỉ chính" : "Địa chỉ phụ"}
          </span>
          {address.isDefault && (
            <span className="px-2 py-1 text-xs bg-green-600 text-white rounded-full">
              Mặc định
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!address.isDefault && !isEditing && (
            <button
              type="button"
              onClick={() => handleSetDefault(address.id)}
              disabled={actionLoading === `default-${address.id}`}
              className="px-3 py-1 text-xs text-green-600 border border-green-600 rounded-lg hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              {actionLoading === `default-${address.id}` && (
                <div className="animate-spin rounded-full size-3 border-b-2 border-green-600"></div>
              )}
              Đặt làm mặc định
            </button>
          )}
          {isEditing && (
            <>
              <button
                type="button"
                onClick={() => handleStartEdit(address)}
                className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg"
              >
                <Edit className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => showDeleteConfirm(address.id)}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg"
              >
                <Trash2 className="size-4" />
              </button>
            </>
          )}
        </div>
      </div>
      <div className="text-sm text-gray-300">
        <div className="font-medium">
          {address.addressLine || address.streetAddress}
        </div>
        <div>
          {[address.ward, address.district, address.city]
            .filter(Boolean)
            .join(", ")}
        </div>
        {address.postalCode && (
          <div className="text-gray-400">
            Mã bưu điện: {address.postalCode}
          </div>
        )}
      </div>
    </div>
  );
}
