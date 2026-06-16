import type { CustomerPhone } from "@/hooks/admin/useCustomerPhones";

export interface PhoneFormData {
  phoneNumber: string;
  label: string;
  isMain: boolean;
}

export const emptyPhoneForm: PhoneFormData = {
  phoneNumber: "",
  label: "",
  isMain: false,
};

export interface PhoneState {
  isEditing: boolean;
  showAddForm: boolean;
  editingPhone: string | null;
  deleteConfirm: {
    show: boolean;
    phoneId: string | null;
  };
  formData: PhoneFormData;
}

export type PhoneAction =
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

export const initialPhoneState: PhoneState = {
  isEditing: false,
  showAddForm: false,
  editingPhone: null,
  deleteConfirm: {
    show: false,
    phoneId: null,
  },
  formData: emptyPhoneForm,
};

export function phoneReducer(state: PhoneState, action: PhoneAction): PhoneState {
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

/**
 * Returns an error message if the phone number is invalid or duplicated,
 * otherwise null. `excludePhoneId` skips the phone being edited.
 */
export function validatePhoneNumber(
  phones: CustomerPhone[],
  phoneNumber: string,
  excludePhoneId?: string
): string | null {
  if (!phoneNumber) {
    return "Vui lòng nhập số điện thoại";
  }

  if (!/^\d+$/.test(phoneNumber)) {
    return "Số điện thoại chỉ được chứa số";
  }

  const existingPhone = phones.find(
    (phone) => phone.phoneNumber === phoneNumber && phone.id !== excludePhoneId
  );
  if (existingPhone) {
    return "Số điện thoại này đã tồn tại cho khách hàng";
  }

  return null;
}
