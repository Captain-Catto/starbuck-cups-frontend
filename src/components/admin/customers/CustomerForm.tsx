"use client";

import React from "react";
import {
  useCustomerForm,
  type CustomerFormData,
} from "@/hooks/business/useCustomerForm";
import { useRouter } from "next/navigation";

interface CustomerFormProps {
  initialData?: Partial<CustomerFormData>;
  isEditing?: boolean;
  customerId?: string;
}

type CustomerFormErrors = ReturnType<typeof useCustomerForm>["errors"];
type CustomerFormUpdateField = ReturnType<typeof useCustomerForm>["updateField"];

function GeneralError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg">
      <p className="text-red-400">{message}</p>
    </div>
  );
}

function BasicInfoSection({
  formData,
  errors,
  updateField,
}: {
  formData: CustomerFormData;
  errors: CustomerFormErrors;
  updateField: CustomerFormUpdateField;
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">
        Thông tin cơ bản
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="customerform-nh-p-h-v-t-n-kh-ch-h-ng">
            Họ và tên <span className="text-red-400">*</span>
          </label>
          <input aria-label="Nhập họ và tên khách hàng"
            type="text"
            value={formData.fullName}
            onChange={(e) => updateField("fullName", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400 ${
              errors.fullName ? "border-red-500" : "border-gray-600"
            }`}
            placeholder="Nhập họ và tên khách hàng"
            required id="customerform-nh-p-h-v-t-n-kh-ch-h-ng"
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-400">{errors.fullName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="customerform-nh-p-s-i-n-tho-i">
            Số điện thoại <span className="text-red-400">*</span>
          </label>
          <input aria-label="Nhập số điện thoại"
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => updateField("phoneNumber", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400 ${
              errors.phoneNumber ? "border-red-500" : "border-gray-600"
            }`}
            placeholder="Nhập số điện thoại"
            required id="customerform-nh-p-s-i-n-tho-i"
          />
          {errors.phoneNumber && (
            <p className="mt-1 text-sm text-red-400">{errors.phoneNumber}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function SocialIdsSection({
  formData,
  errors,
  updateField,
}: {
  formData: CustomerFormData;
  errors: CustomerFormErrors;
  updateField: CustomerFormUpdateField;
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">
        Liên hệ mạng xã hội
      </h3>
      {errors.social && (
        <p className="mb-4 text-sm text-red-400">{errors.social}</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="customerform-nh-p-messenger-id">
            Messenger ID
          </label>
          <input aria-label="Nhập Messenger ID"
            type="text"
            value={formData.messengerId}
            onChange={(e) => updateField("messengerId", e.target.value)}
            className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
            placeholder="Nhập Messenger ID" id="customerform-nh-p-messenger-id"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="customerform-nh-p-zalo-id">
            Zalo ID
          </label>
          <input aria-label="Nhập Zalo ID"
            type="text"
            value={formData.zaloId}
            onChange={(e) => updateField("zaloId", e.target.value)}
            className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
            placeholder="Nhập Zalo ID" id="customerform-nh-p-zalo-id"
          />
        </div>
      </div>
    </div>
  );
}

function NotesField({
  value,
  updateField,
}: {
  value: string;
  updateField: CustomerFormUpdateField;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="customerform-th-m-ghi-ch-v-kh-ch-h-ng-t-y-ch-n">
        Ghi chú
      </label>
      <textarea aria-label="Thêm ghi chú về khách hàng (tùy chọn)"
        value={value}
        onChange={(e) => updateField("notes", e.target.value)}
        rows={3}
        className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
        placeholder="Thêm ghi chú về khách hàng (tùy chọn)" id="customerform-th-m-ghi-ch-v-kh-ch-h-ng-t-y-ch-n"
      />
    </div>
  );
}

function AddressInfoSection({
  formData,
  errors,
  updateField,
}: {
  formData: CustomerFormData;
  errors: CustomerFormErrors;
  updateField: CustomerFormUpdateField;
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">Địa chỉ</h3>
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="customerform-nh-p-s-nh-t-n-ng">
            Địa chỉ cụ thể <span className="text-red-400">*</span>
          </label>
          <input aria-label="Nhập số nhà, tên đường"
            type="text"
            value={formData.address?.addressLine || ""}
            onChange={(e) =>
              updateField("address", {
                ...formData.address,
                addressLine: e.target.value,
              })
            }
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400 ${
              errors["address.addressLine"] ? "border-red-500" : "border-gray-600"
            }`}
            placeholder="Nhập số nhà, tên đường"
            required id="customerform-nh-p-s-nh-t-n-ng"
          />
          {errors["address.addressLine"] && (
            <p className="mt-1 text-sm text-red-400">
              {errors["address.addressLine"]}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="customerform-nh-p-ph-ng-x">
              Phường/Xã
            </label>
            <input aria-label="Nhập phường/xã"
              type="text"
              value={formData.address?.ward || ""}
              onChange={(e) =>
                updateField("address", { ...formData.address, ward: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
              placeholder="Nhập phường/xã" id="customerform-nh-p-ph-ng-x"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="customerform-nh-p-qu-n-huy-n">
              Quận/Huyện <span className="text-red-400">*</span>
            </label>
            <input aria-label="Nhập quận/huyện"
              type="text"
              value={formData.address?.district || ""}
              onChange={(e) =>
                updateField("address", { ...formData.address, district: e.target.value })
              }
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400 ${
                errors["address.district"] ? "border-red-500" : "border-gray-600"
              }`}
              placeholder="Nhập quận/huyện"
              required id="customerform-nh-p-qu-n-huy-n"
            />
            {errors["address.district"] && (
              <p className="mt-1 text-sm text-red-400">
                {errors["address.district"]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="customerform-nh-p-t-nh-th-nh-ph">
              Tỉnh/Thành phố <span className="text-red-400">*</span>
            </label>
            <input aria-label="Nhập tỉnh/thành phố"
              type="text"
              value={formData.address?.city || ""}
              onChange={(e) =>
                updateField("address", { ...formData.address, city: e.target.value })
              }
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400 ${
                errors["address.city"] ? "border-red-500" : "border-gray-600"
              }`}
              placeholder="Nhập tỉnh/thành phố"
              required id="customerform-nh-p-t-nh-th-nh-ph"
            />
            {errors["address.city"] && (
              <p className="mt-1 text-sm text-red-400">
                {errors["address.city"]}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="customerform-nh-p-m-b-u-i-n-t-y-ch-n">
            Mã bưu điện
          </label>
          <input aria-label="Nhập mã bưu điện (tùy chọn)"
            type="text"
            value={formData.address?.postalCode || ""}
            onChange={(e) =>
              updateField("address", { ...formData.address, postalCode: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
            placeholder="Nhập mã bưu điện (tùy chọn)" id="customerform-nh-p-m-b-u-i-n-t-y-ch-n"
          />
        </div>
      </div>
    </div>
  );
}

function VipStatusField({
  checked,
  updateField,
}: {
  checked: boolean;
  updateField: CustomerFormUpdateField;
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">
        Phân loại khách hàng
      </h3>
      <div className="flex items-center">
        <input aria-label="is Vip"
          id="isVip"
          type="checkbox"
          checked={checked}
          onChange={(e) => updateField("isVip", e.target.checked)}
          className="size-4 text-yellow-600 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500 focus:ring-2"
        />
        <label htmlFor="isVip" className="ml-2 text-sm font-medium text-gray-300">
          Khách hàng VIP
        </label>
      </div>
      <p className="mt-2 text-sm text-gray-400">
        Khách VIP sẽ được ưu tiên xử lý và có thể nhận được ưu đãi đặc biệt
      </p>
    </div>
  );
}

function CustomerFormActions({
  isSubmitting,
  isEditing,
  onCancel,
}: {
  isSubmitting: boolean;
  isEditing: boolean;
  onCancel: () => void;
}) {
  return (
    <div className="flex gap-4 pt-6">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 px-4 py-2 border border-gray-600 rounded-lg text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors"
      >
        Hủy
      </button>
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        {isSubmitting ? "Đang lưu..." : isEditing ? "Cập nhật" : "Thêm khách hàng"}
      </button>
    </div>
  );
}

export function CustomerForm({
  initialData,
  isEditing = false,
  customerId,
}: CustomerFormProps) {
  const { formData, errors, isSubmitting, updateField, submitForm } =
    useCustomerForm({
      initialData,
      isEditing,
      customerId,
    });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitForm();
  };

  return (
    <div className="mx-auto bg-gray-800 rounded-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">
          {isEditing ? "Chỉnh sửa khách hàng" : "Thêm khách hàng mới"}
        </h2>
      </div>

      <GeneralError message={errors.general} />

      <form onSubmit={handleSubmit} className="space-y-6">
        <BasicInfoSection
          formData={formData}
          errors={errors}
          updateField={updateField}
        />
        <SocialIdsSection
          formData={formData}
          errors={errors}
          updateField={updateField}
        />
        <NotesField value={formData.notes} updateField={updateField} />
        {!isEditing && (
          <AddressInfoSection
            formData={formData}
            errors={errors}
            updateField={updateField}
          />
        )}
        <VipStatusField checked={formData.isVip} updateField={updateField} />
        <CustomerFormActions
          isSubmitting={isSubmitting}
          isEditing={isEditing}
          onCancel={() => router.push("/admin/customers")}
        />
      </form>
    </div>
  );
}
