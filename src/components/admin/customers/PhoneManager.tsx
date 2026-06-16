"use client";

import { useReducer, useEffect } from "react";
import { toast } from "sonner";
import {
  useCustomerPhones,
  type CustomerPhone,
} from "@/hooks/admin/useCustomerPhones";
import {
  initialPhoneState,
  phoneReducer,
  validatePhoneNumber,
  type PhoneFormData,
} from "./phone-manager/phoneFormState";
import { AddPhoneForm } from "./phone-manager/PhoneForm";
import { PhoneList } from "./phone-manager/PhoneList";
import {
  DeletePhoneModal,
  PhoneManagerError,
  PhoneManagerHeader,
  PhoneManagerLoading,
} from "./phone-manager/PhoneManagerChrome";

interface PhoneManagerProps {
  customerId: string;
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

  const handleAddPhone = async () => {
    const phoneNumber = formData.phoneNumber.trim();

    const validationError = validatePhoneNumber(phones, phoneNumber);
    if (validationError) {
      toast.error(validationError);
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

    const validationError = validatePhoneNumber(phones, phoneNumber, phoneId);
    if (validationError) {
      toast.error(validationError);
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
