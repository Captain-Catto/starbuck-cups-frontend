import { Phone, Edit2, Trash2, Star } from "lucide-react";
import type { CustomerPhone } from "@/hooks/admin/useCustomerPhones";
import { PhoneForm } from "./PhoneForm";
import { PhoneFormData } from "./phoneFormState";

function PhoneDisplayCard({
  phone,
  isEditing,
  onSetMain,
  onEdit,
  onDelete,
}: {
  phone: CustomerPhone;
  isEditing: boolean;
  onSetMain: (phoneId: string) => void;
  onEdit: (phone: CustomerPhone) => void;
  onDelete: (phoneId: string) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Phone className="size-4 text-gray-400" />
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-white">{phone.phoneNumber}</span>
            {phone.isMain && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-600/20 text-green-400 text-xs font-medium rounded-full">
                <Star className="size-3" />
                Chính
              </span>
            )}
          </div>
          {phone.label && <p className="text-sm text-gray-400">{phone.label}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!phone.isMain && !isEditing && (
          <button
            type="button"
            onClick={() => onSetMain(phone.id)}
            className="px-3 py-1 text-xs text-green-400 border border-green-600 rounded-lg hover:bg-green-900/20 transition-colors flex items-center gap-1"
          >
            Đặt làm mặc định
          </button>
        )}
        {isEditing && (
          <>
            {!phone.isMain && (
              <button
                type="button"
                onClick={() => onSetMain(phone.id)}
                className="p-1 text-gray-400 hover:text-green-400 transition-colors"
                title="Đặt làm số chính"
              >
                <Star className="size-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => onEdit(phone)}
              className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
              title="Chỉnh sửa"
            >
              <Edit2 className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(phone.id)}
              className="p-1 text-gray-400 hover:text-red-400 transition-colors"
              title="Xóa"
            >
              <Trash2 className="size-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function PhoneList({
  phones,
  isEditing,
  editingPhone,
  formData,
  onFormChange,
  onUpdate,
  onCancelEdit,
  onSetMain,
  onStartEdit,
  onDelete,
}: {
  phones: CustomerPhone[];
  isEditing: boolean;
  editingPhone: string | null;
  formData: PhoneFormData;
  onFormChange: (field: keyof PhoneFormData, value: string | boolean) => void;
  onUpdate: (phoneId: string) => void;
  onCancelEdit: () => void;
  onSetMain: (phoneId: string) => void;
  onStartEdit: (phone: CustomerPhone) => void;
  onDelete: (phoneId: string) => void;
}) {
  if (phones.length === 0) {
    return (
      <div className="p-6 text-center text-gray-400 bg-gray-700 border border-gray-600 rounded-lg">
        Chưa có số điện thoại nào
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {phones.map((phone) => (
        <div
          key={phone.id}
          className={`p-4 rounded-lg border-2 ${
            phone.isMain
              ? "border-green-600 bg-green-900/20"
              : "border-gray-600 bg-gray-700"
          }`}
        >
          {editingPhone === phone.id ? (
            <PhoneForm
              formData={formData}
              idSuffix={phone.id}
              onChange={onFormChange}
              onSave={() => onUpdate(phone.id)}
              onCancel={onCancelEdit}
            />
          ) : (
            <PhoneDisplayCard
              phone={phone}
              isEditing={isEditing}
              onSetMain={onSetMain}
              onEdit={onStartEdit}
              onDelete={onDelete}
            />
          )}
        </div>
      ))}
    </div>
  );
}
