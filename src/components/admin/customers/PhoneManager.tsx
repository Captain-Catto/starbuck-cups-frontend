"use client";

import { useReducer, useEffect } from "react";
import { Phone, Plus, Edit2, Trash2, Star, Check, X, Edit } from "lucide-react";
import { toast } from "sonner";
import {
  useCustomerPhones,
  type CustomerPhone,
} from "@/hooks/admin/useCustomerPhones";

interface PhoneManagerProps {
  customerId: string;
}

interface PhoneFormData {
  phoneNumber: string;
  label: string;
  isMain: boolean;
}

const emptyPhoneForm: PhoneFormData = {
  phoneNumber: "",
  label: "",
  isMain: false,
};

function PhoneManagerLoading() {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-600 rounded w-1/4"></div>
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-600 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PhoneManagerError({ error }: { error: string }) {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Phone className="size-5 text-white" />
        <h3 className="text-lg font-semibold text-white">Số điện thoại</h3>
      </div>
      <div className="p-4 bg-red-900/20 border border-red-600 rounded-lg">
        <p className="text-red-400">{error}</p>
      </div>
    </div>
  );
}

function PhoneManagerHeader({
  count,
  isEditing,
  onStartEditing,
  onShowAddForm,
  onDone,
}: {
  count: number;
  isEditing: boolean;
  onStartEditing: () => void;
  onShowAddForm: () => void;
  onDone: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-semibold text-white">
        Danh sách số điện thoại ({count})
      </h3>
      <div className="flex items-center gap-2">
        {!isEditing ? (
          <button
            type="button"
            onClick={onStartEditing}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            title="Chỉnh sửa"
          >
            <Edit className="size-4" />
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onShowAddForm}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
            >
              <Plus className="size-4" />
              Thêm số điện thoại
            </button>
            <button
              type="button"
              onClick={onDone}
              className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
            >
              <X className="size-4" />
              Xong
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function PhoneForm({
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

function AddPhoneForm({
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

function PhoneList({
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

function DeletePhoneModal({
  phoneId,
  onCancel,
  onConfirm,
}: {
  phoneId: string | null;
  onCancel: () => void;
  onConfirm: (phoneId: string) => void;
}) {
  if (!phoneId) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-zinc-950 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-2 text-white">Xác nhận xóa</h3>
        <p className="text-gray-300 mb-4">
          Bạn có chắc chắn muốn xóa số điện thoại này? Hành động này không thể
          hoàn tác.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => onConfirm(phoneId)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}

interface PhoneState {
  isEditing: boolean;
  showAddForm: boolean;
  editingPhone: string | null;
  deleteConfirm: {
    show: boolean;
    phoneId: string | null;
  };
  formData: PhoneFormData;
}

type PhoneAction =
  | { type: "SET_IS_EDITING"; payload: boolean }
  | { type: "SET_SHOW_ADD_FORM"; payload: boolean }
  | { type: "SET_EDITING_PHONE"; payload: string | null }
  | { type: "SET_DELETE_CONFIRM"; payload: { show: boolean; phoneId: string | null } }
  | { type: "SET_FORM_DATA"; payload: PhoneFormData }
  | { type: "UPDATE_FORM_FIELD"; payload: { field: keyof PhoneFormData; value: string | boolean } }
  | { type: "RESET_FORM" }
  | { type: "START_EDIT"; payload: { phoneId: string; formData: PhoneFormData } }
  | { type: "CANCEL_EDIT" }
  | { type: "FINISH_EDITING" };

const initialPhoneState: PhoneState = {
  isEditing: false,
  showAddForm: false,
  editingPhone: null,
  deleteConfirm: {
    show: false,
    phoneId: null,
  },
  formData: emptyPhoneForm,
};

function phoneReducer(state: PhoneState, action: PhoneAction): PhoneState {
  switch (action.type) {
    case "SET_IS_EDITING":
      return { ...state, isEditing: action.payload };
    case "SET_SHOW_ADD_FORM":
      return { ...state, showAddForm: action.payload };
    case "SET_EDITING_PHONE":
      return { ...state, editingPhone: action.payload };
    case "SET_DELETE_CONFIRM":
      return { ...state, deleteConfirm: action.payload };
    case "SET_FORM_DATA":
      return { ...state, formData: action.payload };
    case "UPDATE_FORM_FIELD":
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.payload.field]: action.payload.value,
        },
      };
    case "RESET_FORM":
      return { ...state, formData: emptyPhoneForm };
    case "START_EDIT":
      return {
        ...state,
        formData: action.payload.formData,
        editingPhone: action.payload.phoneId,
      };
    case "CANCEL_EDIT":
      return {
        ...state,
        editingPhone: null,
        showAddForm: false,
        formData: emptyPhoneForm,
      };
    case "FINISH_EDITING":
      return {
        ...state,
        isEditing: false,
        showAddForm: false,
        editingPhone: null,
      };
    default:
      return state;
  }
}

export function PhoneManager({ customerId }: PhoneManagerProps) {
  const [state, dispatch] = useReducer(phoneReducer, initialPhoneState);
  const { isEditing, showAddForm, editingPhone, deleteConfirm, formData } = state;

  const {
    phones,
    loading,
    error,
    fetchPhones,
    createPhone,
    updatePhone,
    deletePhone,
    setMainPhone,
  } = useCustomerPhones(customerId);

  useEffect(() => {
    fetchPhones();
  }, [fetchPhones]);

  const updateFormField = (
    field: keyof PhoneFormData,
    value: string | boolean
  ) => {
    dispatch({ type: "UPDATE_FORM_FIELD", payload: { field, value } });
  };

  const resetForm = () => {
    dispatch({ type: "RESET_FORM" });
  };

  const handleAddPhone = async () => {
    const phoneNumber = formData.phoneNumber.trim();

    // Basic validation
    if (!phoneNumber) {
      toast.error("Vui lòng nhập số điện thoại");
      return;
    }

    // Check if contains only numbers
    if (!/^\d+$/.test(phoneNumber)) {
      toast.error("Số điện thoại chỉ được chứa số");
      return;
    }

    // Check if this phone number already exists in current list
    const existingPhone = phones.find(
      (phone) => phone.phoneNumber === phoneNumber
    );
    if (existingPhone) {
      toast.error("Số điện thoại này đã tồn tại cho khách hàng");
      return;
    }

    const success = await createPhone({
      phoneNumber: phoneNumber,
      label: formData.label.trim() || undefined,
      isMain: formData.isMain,
    });

    if (success) {
      dispatch({ type: "CANCEL_EDIT" });
    }
  };

  const handleUpdatePhone = async (phoneId: string) => {
    const phoneNumber = formData.phoneNumber.trim();

    // Basic validation
    if (!phoneNumber) {
      toast.error("Vui lòng nhập số điện thoại");
      return;
    }

    // Check if contains only numbers
    if (!/^\d+$/.test(phoneNumber)) {
      toast.error("Số điện thoại chỉ được chứa số");
      return;
    }

    // Check if this phone number already exists in current list (excluding current phone)
    const existingPhone = phones.find(
      (phone) => phone.phoneNumber === phoneNumber && phone.id !== phoneId
    );
    if (existingPhone) {
      toast.error("Số điện thoại này đã tồn tại cho khách hàng");
      return;
    }

    const success = await updatePhone(phoneId, {
      phoneNumber: phoneNumber,
      label: formData.label.trim() || undefined,
      isMain: formData.isMain,
    });

    if (success) {
      dispatch({ type: "FINISH_EDITING" });
      dispatch({ type: "RESET_FORM" });
    }
  };

  const handleDeletePhone = async (phoneId: string) => {
    const success = await deletePhone(phoneId);

    if (success) {
      dispatch({ type: "SET_DELETE_CONFIRM", payload: { show: false, phoneId: null } });
    }
  };

  const handleSetMainPhone = async (phoneId: string) => {
    await setMainPhone(phoneId);
  };

  const startEdit = (phone: CustomerPhone) => {
    dispatch({
      type: "START_EDIT",
      payload: {
        phoneId: phone.id,
        formData: {
          phoneNumber: phone.phoneNumber,
          label: phone.label || "",
          isMain: phone.isMain,
        },
      },
    });
  };

  const cancelEdit = () => {
    dispatch({ type: "CANCEL_EDIT" });
  };

  const finishEditing = () => {
    dispatch({ type: "FINISH_EDITING" });
  };

  if (loading) {
    return <PhoneManagerLoading />;
  }

  if (error) {
    return <PhoneManagerError error={error} />;
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <PhoneManagerHeader
        count={phones.length}
        isEditing={isEditing}
        onStartEditing={() => dispatch({ type: "SET_IS_EDITING", payload: true })}
        onShowAddForm={() => dispatch({ type: "SET_SHOW_ADD_FORM", payload: true })}
        onDone={finishEditing}
      />

      {showAddForm && (
        <AddPhoneForm
          formData={formData}
          onChange={updateFormField}
          onSave={handleAddPhone}
          onCancel={cancelEdit}
        />
      )}

      <PhoneList
        phones={phones}
        isEditing={isEditing}
        editingPhone={editingPhone}
        formData={formData}
        onFormChange={updateFormField}
        onUpdate={handleUpdatePhone}
        onCancelEdit={cancelEdit}
        onSetMain={handleSetMainPhone}
        onStartEdit={startEdit}
        onDelete={(phoneId) => dispatch({ type: "SET_DELETE_CONFIRM", payload: { show: true, phoneId } })}
      />

      {deleteConfirm.show && (
        <DeletePhoneModal
          phoneId={deleteConfirm.phoneId}
          onCancel={() => dispatch({ type: "SET_DELETE_CONFIRM", payload: { show: false, phoneId: null } })}
          onConfirm={handleDeletePhone}
        />
      )}
    </div>
  );
}
