"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppSelector } from "@/store";
import { Edit, Trash2, MapPin, Plus, Save, X } from "lucide-react";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/api-config";

interface Address {
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

interface AddressFormData {
  streetAddress: string;
  ward: string;
  district: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
}

interface AddressManagerProps {
  customerId: string;
}

export function AddressManager({ customerId }: AddressManagerProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    addressId: string | null;
  }>({
    show: false,
    addressId: null,
  });
  const [formData, setFormData] = useState<AddressFormData>({
    streetAddress: "",
    ward: "",
    district: "",
    city: "",
    postalCode: "",
    isDefault: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get token from Redux store
  const { token } = useAppSelector((state) => state.auth);

  const fetchAddresses = useCallback(async () => {
    try {
      setLoading(true);

      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(getApiUrl(`admin/customers/${customerId}`), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch customer data");
      }

      const result = await response.json();
      if (result.success && result.data.addresses) {
        setAddresses(result.data.addresses);
      }
    } catch {
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, [customerId, token]);

  useEffect(() => {
    if (customerId && token) {
      fetchAddresses();
    }
  }, [customerId, token, fetchAddresses]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.streetAddress.trim()) {
      newErrors.streetAddress = "Địa chỉ là bắt buộc";
    }
    if (!formData.district.trim()) {
      newErrors.district = "Quận/Huyện là bắt buộc";
    }
    if (!formData.city.trim()) {
      newErrors.city = "Tỉnh/Thành phố là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStartAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setIsEditing(true);
    setFormData({
      streetAddress: "",
      ward: "",
      district: "",
      city: "",
      postalCode: "",
      isDefault: addresses.length === 0, // First address is default
    });
    setErrors({});
  };

  const handleStartEdit = (address: Address) => {
    setEditingId(address.id);
    setIsAdding(false);
    setFormData({
      streetAddress: address.addressLine || address.streetAddress || "",
      ward: address.ward || "",
      district: address.district || "",
      city: address.city || "",
      postalCode: address.postalCode || "",
      isDefault: address.isDefault,
    });
    setErrors({});
  };

  const handleSave = async () => {
    if (!validateForm() || !token) {
      return;
    }

    // Map frontend format to backend format
    const backendData = {
      addressLine: formData.streetAddress,
      ward: formData.ward,
      district: formData.district,
      city: formData.city,
      postalCode: formData.postalCode,
      isDefault: formData.isDefault,
    };

    try {
      if (isAdding) {
        // Create new address
        const response = await fetch(
          getApiUrl(`admin/customers/${customerId}/addresses`),
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(backendData),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error("Failed to create address");
        }

        if (result.success) {
          // Refresh addresses
          await fetchAddresses();
          setIsAdding(false);
          toast.success("Đã tạo địa chỉ mới thành công");
        }
      } else if (editingId) {
        // Update existing address
        const response = await fetch(
          getApiUrl(`admin/customers/${customerId}/addresses/${editingId}`),
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(backendData),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update address");
        }

        const result = await response.json();
        if (result.success) {
          // Refresh addresses
          await fetchAddresses();
          setEditingId(null);
          toast.success("Đã cập nhật địa chỉ thành công");
        }
      }

      // Reset form
      setFormData({
        streetAddress: "",
        ward: "",
        district: "",
        city: "",
        postalCode: "",
        isDefault: false,
      });
    } catch (error) {
      toast.error(`Có lỗi xảy ra khi lưu địa chỉ, ${error}`);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      streetAddress: "",
      ward: "",
      district: "",
      city: "",
      postalCode: "",
      isDefault: false,
    });
    setErrors({});
  };

  const handleDelete = async (addressId: string) => {
    if (!token) return;

    const addressToDelete = addresses.find((addr) => addr.id === addressId);
    if (!addressToDelete) return;

    if (addresses.length === 1) {
      toast.error("Không thể xóa địa chỉ cuối cùng");
      return;
    }

    try {
      const response = await fetch(
        getApiUrl(`admin/customers/${customerId}/addresses/${addressId}`),
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete address");
      }

      const result = await response.json();
      if (result.success) {
        // Refresh addresses
        await fetchAddresses();
        setDeleteConfirm({ show: false, addressId: null });
        toast.success("Đã xóa địa chỉ thành công");
      }
    } catch (error) {
      toast.error(`Có lỗi xảy ra khi xóa địa chỉ, ${error}`);
    }
  };

  const showDeleteConfirm = (addressId: string) => {
    setDeleteConfirm({ show: true, addressId });
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, addressId: null });
  };

  const handleSetDefault = async (addressId: string) => {
    if (!token) return;

    setActionLoading(`default-${addressId}`);

    // Store original state for potential rollback
    const originalAddresses = [...addresses];

    // Optimistic update: Set the selected address as default and others as non-default
    const optimisticAddresses = addresses.map((addr) => ({
      ...addr,
      isDefault: addr.id === addressId,
    }));
    setAddresses(optimisticAddresses);

    try {
      const response = await fetch(
        getApiUrl(
          `admin/customers/${customerId}/addresses/${addressId}/set-default`
        ),
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to set default address");
      }

      const result = await response.json();
      if (result.success) {
        // Success - the optimistic update was correct, no need to fetch again
        toast.success("Đã đặt làm địa chỉ mặc định thành công");
      } else {
        // API returned success: false, rollback
        setAddresses(originalAddresses);

        toast.error("Có lỗi xảy ra khi đặt địa chỉ mặc định");
      }
    } catch (error) {
      // Network error, rollback to original state
      setAddresses(originalAddresses);

      toast.error(`Có lỗi xảy ra khi đặt địa chỉ mặc định, ${error}`);
    } finally {
      setActionLoading(null);
    }
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

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">
          Danh sách địa chỉ ({addresses.length})
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
                onClick={handleStartAdd}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                <Plus className="w-4 h-4" />
                Thêm địa chỉ
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setIsAdding(false);
                  setEditingId(null);
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

      {addresses.length > 0 ? (
        <div className="space-y-3">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`p-4 rounded-lg border-2 ${
                address.isDefault
                  ? "border-green-600 bg-green-900/20"
                  : "border-gray-600 bg-gray-700"
              }`}
            >
              {editingId === address.id ? (
                // Edit Form
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center">
                      <label className="flex items-center gap-2 text-sm text-white">
                        <input
                          type="checkbox"
                          checked={formData.isDefault}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              isDefault: e.target.checked,
                            }))
                          }
                          className="rounded border-gray-600 text-green-600 focus:ring-green-500"
                        />
                        Địa chỉ mặc định
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Địa chỉ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.streetAddress}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          streetAddress: e.target.value,
                        }))
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 bg-gray-700 text-white ${
                        errors.streetAddress
                          ? "border-red-500"
                          : "border-gray-600"
                      }`}
                      placeholder="Số nhà, tên đường"
                    />
                    {errors.streetAddress && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.streetAddress}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">
                        Phường/Xã
                      </label>
                      <input
                        type="text"
                        value={formData.ward}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            ward: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border bg-gray-700 text-white border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">
                        Quận/Huyện <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.district}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            district: e.target.value,
                          }))
                        }
                        className={`w-full px-3 py-2 border bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-green-500 ${
                          errors.district ? "border-red-500" : "border-gray-600"
                        }`}
                      />
                      {errors.district && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.district}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">
                        Tỉnh/Thành phố <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            city: e.target.value,
                          }))
                        }
                        className={`w-full px-3 py-2 border bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-green-500 ${
                          errors.city ? "border-red-500" : "border-gray-600"
                        }`}
                      />
                      {errors.city && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.city}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="w-full md:w-1/3">
                    <label className="block text-sm font-medium text-white mb-1">
                      Mã bưu điện
                    </label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          postalCode: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border bg-gray-700 text-white border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Save className="w-4 h-4" />
                      Lưu
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-4 py-2 text-white bg-gray-600 border border-gray-500 rounded-lg hover:bg-gray-500"
                    >
                      <X className="w-4 h-4" />
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                // Display Mode
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
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
                          onClick={() => handleSetDefault(address.id)}
                          disabled={actionLoading === `default-${address.id}`}
                          className="px-3 py-1 text-xs text-green-600 border border-green-600 rounded-lg hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          {actionLoading === `default-${address.id}` && (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600"></div>
                          )}
                          Đặt làm mặc định
                        </button>
                      )}
                      {isEditing && (
                        <>
                          <button
                            onClick={() => handleStartEdit(address)}
                            className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => showDeleteConfirm(address.id)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
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
              )}
            </div>
          ))}

          {/* Add New Address Form */}
          {isAdding && (
            <div className="p-4 border-2 border-dashed border-gray-600 rounded-lg">
              <h4 className="font-medium text-white mb-4">Thêm địa chỉ mới</h4>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center">
                    <label className="flex items-center gap-2 text-sm text-white">
                      <input
                        type="checkbox"
                        checked={formData.isDefault}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            isDefault: e.target.checked,
                          }))
                        }
                        className="rounded border-gray-600 text-green-600"
                      />
                      Địa chỉ mặc định
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Địa chỉ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.streetAddress}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        streetAddress: e.target.value,
                      }))
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 text-white ${
                      errors.streetAddress
                        ? "border-red-500"
                        : "border-gray-600"
                    }`}
                    placeholder="Số nhà, tên đường"
                  />
                  {errors.streetAddress && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.streetAddress}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Phường/Xã
                    </label>
                    <input
                      type="text"
                      value={formData.ward}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          ward: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border bg-gray-700 text-white border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Phường/Xã"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Quận/Huyện <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.district}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          district: e.target.value,
                        }))
                      }
                      className={`w-full px-3 py-2 border bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-green-500 ${
                        errors.district ? "border-red-500" : "border-gray-600"
                      }`}
                      placeholder="Quận/Huyện"
                    />
                    {errors.district && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.district}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Tỉnh/Thành phố <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          city: e.target.value,
                        }))
                      }
                      className={`w-full px-3 py-2 border bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-green-500 ${
                        errors.city ? "border-red-500" : "border-gray-600"
                      }`}
                      placeholder="Tỉnh/Thành phố"
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                    )}
                  </div>
                </div>

                <div className="w-full md:w-1/3">
                  <label className="block text-sm font-medium text-white mb-1">
                    Mã bưu điện
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        postalCode: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border bg-gray-700 text-white border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Mã bưu điện"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Save className="w-4 h-4" />
                    Lưu địa chỉ
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 text-white bg-gray-600 border border-gray-500 rounded-lg hover:bg-gray-500"
                  >
                    <X className="w-4 h-4" />
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add Button */}
          {!isAdding && !editingId && !isEditing && (
            <button
              onClick={handleStartAdd}
              className="w-full p-4 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors"
            >
              <div className="flex items-center justify-center gap-2">
                <Plus className="w-5 h-5" />
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Xác nhận xóa
                </h3>
                <p className="text-gray-400">
                  Hành động này không thể hoàn tác
                </p>
              </div>
            </div>

            <p className="text-gray-300 mb-6">
              Bạn có chắc chắn muốn xóa địa chỉ này không? Dữ liệu sẽ bị xóa
              vĩnh viễn.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Hủy
              </button>
              <button
                onClick={() =>
                  deleteConfirm.addressId &&
                  handleDelete(deleteConfirm.addressId)
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
