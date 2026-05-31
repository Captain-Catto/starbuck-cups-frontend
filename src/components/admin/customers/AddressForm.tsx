"use client";

import { Save, X } from "lucide-react";

export interface AddressFormData {
  streetAddress: string;
  ward: string;
  district: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
}

interface AddressFormProps {
  formData: AddressFormData;
  onChangeField: <K extends keyof AddressFormData>(
    key: K,
    value: AddressFormData[K]
  ) => void;
  errors: Record<string, string>;
  handleSave: () => void;
  handleCancel: () => void;
  title?: string;
  saveButtonLabel?: string;
}

export function AddressForm({
  formData,
  onChangeField,
  errors,
  handleSave,
  handleCancel,
  title,
  saveButtonLabel = "Lưu",
}: AddressFormProps) {
  return (
    <div className={title ? "p-4 border-2 border-dashed border-gray-600 rounded-lg" : ""}>
      {title && <h4 className="font-medium text-white mb-4">{title}</h4>}

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center">
            <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
              <input
                aria-label="checkbox"
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) => onChangeField("isDefault", e.target.checked)}
                className="rounded border-gray-600 text-green-600 focus:ring-green-500"
              />
              Địa chỉ mặc định
            </label>
          </div>
        </div>

        <div>
          <label
            className="block text-sm font-medium text-white mb-1"
            htmlFor="address-streetAddress"
          >
            Địa chỉ <span className="text-red-500">*</span>
          </label>
          <input
            aria-label="Số nhà, tên đường"
            type="text"
            value={formData.streetAddress}
            onChange={(e) => onChangeField("streetAddress", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 bg-gray-700 text-white ${
              errors.streetAddress ? "border-red-500" : "border-gray-600"
            }`}
            placeholder="Số nhà, tên đường"
            id="address-streetAddress"
          />
          {errors.streetAddress && (
            <p className="mt-1 text-sm text-red-600">{errors.streetAddress}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              className="block text-sm font-medium text-white mb-1"
              htmlFor="address-ward"
            >
              Phường/Xã
            </label>
            <input
              aria-label="text"
              type="text"
              value={formData.ward}
              onChange={(e) => onChangeField("ward", e.target.value)}
              className="w-full px-3 py-2 border bg-gray-700 text-white border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="Phường/Xã"
              id="address-ward"
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium text-white mb-1"
              htmlFor="address-district"
            >
              Quận/Huyện <span className="text-red-500">*</span>
            </label>
            <input
              aria-label="text"
              type="text"
              value={formData.district}
              onChange={(e) => onChangeField("district", e.target.value)}
              className={`w-full px-3 py-2 border bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-green-500 ${
                errors.district ? "border-red-500" : "border-gray-600"
              }`}
              placeholder="Quận/Huyện"
              id="address-district"
            />
            {errors.district && (
              <p className="mt-1 text-sm text-red-600">{errors.district}</p>
            )}
          </div>
          <div>
            <label
              className="block text-sm font-medium text-white mb-1"
              htmlFor="address-city"
            >
              Tỉnh/Thành phố <span className="text-red-500">*</span>
            </label>
            <input
              aria-label="text"
              type="text"
              value={formData.city}
              onChange={(e) => onChangeField("city", e.target.value)}
              className={`w-full px-3 py-2 border bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-green-500 ${
                errors.city ? "border-red-500" : "border-gray-600"
              }`}
              placeholder="Tỉnh/Thành phố"
              id="address-city"
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-600">{errors.city}</p>
            )}
          </div>
        </div>

        <div className="w-full md:w-1/3">
          <label
            className="block text-sm font-medium text-white mb-1"
            htmlFor="address-postalCode"
          >
            Mã bưu điện
          </label>
          <input
            aria-label="text"
            type="text"
            value={formData.postalCode}
            onChange={(e) => onChangeField("postalCode", e.target.value)}
            className="w-full px-3 py-2 border bg-gray-700 text-white border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="Mã bưu điện"
            id="address-postalCode"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer"
          >
            <Save className="size-4" />
            {saveButtonLabel}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center gap-2 px-4 py-2 text-white bg-gray-600 border border-gray-500 rounded-lg hover:bg-gray-500 cursor-pointer"
          >
            <X className="size-4" />
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}
