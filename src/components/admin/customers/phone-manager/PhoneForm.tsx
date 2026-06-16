import { Check, X } from "lucide-react";
import { PhoneFormData } from "./phoneFormState";

export function PhoneForm({
  title,
  formData,
  idSuffix = "",
  onChange,
  onSave,
  onCancel,
}: {
  title?: string;
  formData: PhoneFormData;
  idSuffix?: string;
  onChange: (field: keyof PhoneFormData, value: string | boolean) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const phoneInputId = idSuffix ? `phonemanager-tel-${idSuffix}` : "phonemanager-nh-p-s-i-n-tho-i";
  const labelInputId = idSuffix
    ? `phonemanager-label-${idSuffix}`
    : "phonemanager-v-d-s-nh-s-c-quan";
  const mainInputId = idSuffix ? `isMain-${idSuffix}` : "isMain";

  return (
    <div className="space-y-4">
      {title && <h4 className="font-medium mb-3 text-white">{title}</h4>}
      <div>
        <label className="block text-sm font-medium text-white mb-1" htmlFor={phoneInputId}>
          Số điện thoại <span className="text-red-500">*</span>
        </label>
        <input
          aria-label="Nhập số điện thoại"
          type="tel"
          value={formData.phoneNumber}
          onChange={(e) => onChange("phoneNumber", e.target.value)}
          className="w-full px-3 py-2 border bg-gray-700 text-white border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500"
          placeholder="Nhập số điện thoại"
          id={phoneInputId}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-1" htmlFor={labelInputId}>
          Nhãn
        </label>
        <input
          aria-label="Ví dụ: Số nhà, Số cơ quan"
          type="text"
          value={formData.label}
          onChange={(e) => onChange("label", e.target.value)}
          className="w-full px-3 py-2 border bg-gray-700 text-white border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500"
          placeholder="Ví dụ: Số nhà, Số cơ quan"
          id={labelInputId}
        />
      </div>

      <div className="flex items-center">
        <input
          aria-label="is Main"
          type="checkbox"
          id={mainInputId}
          checked={formData.isMain}
          onChange={(e) => onChange("isMain", e.target.checked)}
          className="size-4 text-green-600 focus:ring-green-500 border-gray-600 rounded bg-gray-700"
        />
        <label htmlFor={mainInputId} className="ml-2 text-sm text-white">
          Đặt làm số điện thoại chính
        </label>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onSave}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
        >
          <Check className="size-4" />
          Lưu
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
        >
          <X className="size-4" />
          Hủy
        </button>
      </div>
    </div>
  );
}

export function AddPhoneForm({
  formData,
  onChange,
  onSave,
  onCancel,
}: {
  formData: PhoneFormData;
  onChange: (field: keyof PhoneFormData, value: string | boolean) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="p-4 bg-gray-700 border border-gray-600 rounded-lg mb-4">
      <PhoneForm
        title="Thêm số điện thoại mới"
        formData={formData}
        onChange={onChange}
        onSave={onSave}
        onCancel={onCancel}
      />
    </div>
  );
}
