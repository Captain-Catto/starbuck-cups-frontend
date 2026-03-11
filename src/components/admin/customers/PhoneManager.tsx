"use client";

import { useState, useEffect } from "react";
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

export function PhoneManager({ customerId }: PhoneManagerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPhone, setEditingPhone] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    phoneId: string | null;
  }>({
    show: false,
    phoneId: null,
  });
  const [formData, setFormData] = useState<PhoneFormData>({
    phoneNumber: "",
    label: "",
    isMain: false,
  });

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
      setFormData({ phoneNumber: "", label: "", isMain: false });
      setShowAddForm(false);
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
      setFormData({ phoneNumber: "", label: "", isMain: false });
      setEditingPhone(null);
      setIsEditing(false);
    }
  };

  const handleDeletePhone = async (phoneId: string) => {
    const success = await deletePhone(phoneId);

    if (success) {
      setDeleteConfirm({ show: false, phoneId: null });
    }
  };

  const handleSetMainPhone = async (phoneId: string) => {
    await setMainPhone(phoneId);
  };

  const startEdit = (phone: CustomerPhone) => {
    setFormData({
      phoneNumber: phone.phoneNumber,
      label: phone.label || "",
      isMain: phone.isMain,
    });
    setEditingPhone(phone.id);
  };

  const cancelEdit = () => {
    setEditingPhone(null);
    setShowAddForm(false);
    setFormData({ phoneNumber: "", label: "", isMain: false });
  };

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

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Phone className="h-5 w-5 text-white" />
          <h3 className="text-lg font-semibold text-white">Số điện thoại</h3>
        </div>
        <div className="p-4 bg-red-900/20 border border-red-600 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">
          Danh sách số điện thoại ({phones.length})
        </h3>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              title="Chỉnh sửa"
            >
              <Edit className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                <Plus className="w-4 h-4" />
                Thêm số điện thoại
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setShowAddForm(false);
                  setEditingPhone(null);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
              >
                <X className="w-4 h-4" />
                Xong
              </button>
            </>
          )}
        </div>
      </div>

      {/* Add Phone Form */}
      {showAddForm && (
        <div className="p-4 bg-gray-700 border border-gray-600 rounded-lg mb-4">
          <h4 className="font-medium mb-3 text-white">
            Thêm số điện thoại mới
          </h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                className="w-full px-3 py-2 border bg-gray-700 text-white border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Nhập số điện thoại"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Nhãn
              </label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) =>
                  setFormData({ ...formData, label: e.target.value })
                }
                className="w-full px-3 py-2 border bg-gray-700 text-white border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Ví dụ: Số nhà, Số cơ quan"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isMain"
                checked={formData.isMain}
                onChange={(e) =>
                  setFormData({ ...formData, isMain: e.target.checked })
                }
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-600 rounded bg-gray-700"
              />
              <label htmlFor="isMain" className="ml-2 text-sm text-white">
                Đặt làm số điện thoại chính
              </label>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddPhone}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
              >
                <Check className="h-4 w-4" />
                Lưu
              </button>
              <button
                onClick={cancelEdit}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Phone List */}
      {phones.length > 0 ? (
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
                // Edit Form
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phoneNumber: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border bg-gray-700 text-white border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Nhãn
                    </label>
                    <input
                      type="text"
                      value={formData.label}
                      onChange={(e) =>
                        setFormData({ ...formData, label: e.target.value })
                      }
                      className="w-full px-3 py-2 border bg-gray-700 text-white border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Ví dụ: Số nhà, Số cơ quan"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`isMain-${phone.id}`}
                      checked={formData.isMain}
                      onChange={(e) =>
                        setFormData({ ...formData, isMain: e.target.checked })
                      }
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-600 rounded bg-gray-700"
                    />
                    <label
                      htmlFor={`isMain-${phone.id}`}
                      className="ml-2 text-sm text-white"
                    >
                      Đặt làm số điện thoại chính
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdatePhone(phone.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Check className="h-4 w-4" />
                      Lưu
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                // Display Mode
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">
                          {phone.phoneNumber}
                        </span>
                        {phone.isMain && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-600/20 text-green-400 text-xs font-medium rounded-full">
                            <Star className="h-3 w-3" />
                            Chính
                          </span>
                        )}
                      </div>
                      {phone.label && (
                        <p className="text-sm text-gray-400">{phone.label}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!phone.isMain && !isEditing && (
                      <button
                        onClick={() => handleSetMainPhone(phone.id)}
                        className="px-3 py-1 text-xs text-green-400 border border-green-600 rounded-lg hover:bg-green-900/20 transition-colors flex items-center gap-1"
                      >
                        Đặt làm mặc định
                      </button>
                    )}
                    {isEditing && (
                      <>
                        {!phone.isMain && (
                          <button
                            onClick={() => handleSetMainPhone(phone.id)}
                            className="p-1 text-gray-400 hover:text-green-400 transition-colors"
                            title="Đặt làm số chính"
                          >
                            <Star className="h-4 w-4" />
                          </button>
                        )}

                        <button
                          onClick={() => startEdit(phone)}
                          className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() =>
                            setDeleteConfirm({ show: true, phoneId: phone.id })
                          }
                          className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 text-center text-gray-400 bg-gray-700 border border-gray-600 rounded-lg">
          Chưa có số điện thoại nào
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2 text-white">
              Xác nhận xóa
            </h3>
            <p className="text-gray-300 mb-4">
              Bạn có chắc chắn muốn xóa số điện thoại này? Hành động này không
              thể hoàn tác.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm({ show: false, phoneId: null })}
                className="px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() =>
                  deleteConfirm.phoneId &&
                  handleDeletePhone(deleteConfirm.phoneId)
                }
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
