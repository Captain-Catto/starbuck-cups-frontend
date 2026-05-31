"use client";

import { Trash2, Plus, Edit, X } from "lucide-react";

// Sub-components import
import { AddressCard } from "./AddressCard";
import { AddressForm } from "./AddressForm";

// Custom hook import
import { useAddressManager } from "@/hooks/admin/useAddressManager";

interface AddressManagerProps {
  customerId: string;
}

export function AddressManager({ customerId }: AddressManagerProps) {
  const {
    addresses,
    loading,
    actionLoading,
    isEditing,
    setIsEditing,
    editingId,
    isAdding,
    deleteConfirm,
    formData,
    errors,
    handleStartAdd,
    handleStartEdit,
    handleSave,
    handleCancel,
    handleDelete,
    showDeleteConfirm,
    cancelDelete,
    handleSetDefault,
    handleFieldChange,
  } = useAddressManager(customerId);

  if (loading) {
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

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">
          Danh sách địa chỉ ({addresses.length})
        </h3>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              title="Chỉnh sửa"
            >
              <Edit className="size-4" />
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleStartAdd}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm cursor-pointer"
              >
                <Plus className="size-4" />
                Thêm địa chỉ
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
              >
                <X className="size-4" />
                Xong
              </button>
            </>
          )}
        </div>
      </div>

      {addresses.length > 0 ? (
        <div className="space-y-3">
          {addresses.map((address) => (
            <div key={address.id}>
              {editingId === address.id ? (
                <AddressForm
                  formData={formData}
                  onChangeField={handleFieldChange}
                  errors={errors}
                  handleSave={handleSave}
                  handleCancel={handleCancel}
                />
              ) : (
                <AddressCard
                  address={address}
                  isEditing={isEditing}
                  actionLoading={actionLoading}
                  handleSetDefault={handleSetDefault}
                  handleStartEdit={handleStartEdit}
                  showDeleteConfirm={showDeleteConfirm}
                />
              )}
            </div>
          ))}

          {/* Add New Address Form */}
          {isAdding && (
            <AddressForm
              formData={formData}
              onChangeField={handleFieldChange}
              errors={errors}
              handleSave={handleSave}
              handleCancel={handleCancel}
              title="Thêm địa chỉ mới"
              saveButtonLabel="Lưu địa chỉ"
            />
          )}

          {/* Add Button */}
          {!isAdding && !editingId && !isEditing && (
            <button
              type="button"
              onClick={handleStartAdd}
              className="w-full p-4 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-center gap-2">
                <Plus className="size-5" />
                <span>Thêm địa chỉ mới</span>
              </div>
            </button>
          )}
        </div>
      ) : (
        <div className="text-gray-400 text-center py-8">
          Chưa có địa chỉ nào được thêm
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-zinc-950 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="size-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Xác nhận xóa</h3>
                <p className="text-gray-400">Hành động này không thể hoàn tác</p>
              </div>
            </div>

            <p className="text-gray-300 mb-6">
              Bạn có chắc chắn muốn xóa địa chỉ này không? Dữ liệu sẽ bị xóa vĩnh
              viễn.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() =>
                  deleteConfirm.addressId && handleDelete(deleteConfirm.addressId)
                }
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
