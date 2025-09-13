"use client";

import { useState, useEffect } from "react";
import { Edit, Trash2, MapPin, Plus, Save, X } from "lucide-react";

interface Address {
  id: string;
  label: string;
  streetAddress: string;
  ward?: string;
  district: string;
  city: string;
  postalCode?: string;
  isDefault: boolean;
}

interface AddressFormData {
  label: string;
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<AddressFormData>({
    label: "",
    streetAddress: "",
    ward: "",
    district: "",
    city: "",
    postalCode: "",
    isDefault: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Mock addresses data - replace with actual API call
    const mockAddresses: Address[] = [
      {
        id: "addr1",
        label: "Địa chỉ chính",
        streetAddress: "123 Nguyễn Trãi",
        ward: "Phường 2",
        district: "Quận 5", 
        city: "TP.HCM",
        postalCode: "70000",
        isDefault: true
      },
      {
        id: "addr2",
        label: "Văn phòng",
        streetAddress: "456 Lê Lợi",
        ward: "Phường Bến Nghé",
        district: "Quận 1",
        city: "TP.HCM",
        postalCode: "70000",
        isDefault: false
      }
    ];

    setTimeout(() => {
      setAddresses(mockAddresses);
      setLoading(false);
    }, 500);
  }, [customerId]);

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
    setFormData({
      label: `Địa chỉ ${addresses.length + 1}`,
      streetAddress: "",
      ward: "",
      district: "",
      city: "",
      postalCode: "",
      isDefault: addresses.length === 0 // First address is default
    });
    setErrors({});
  };

  const handleStartEdit = (address: Address) => {
    setEditingId(address.id);
    setIsAdding(false);
    setFormData({
      label: address.label,
      streetAddress: address.streetAddress,
      ward: address.ward || "",
      district: address.district,
      city: address.city,
      postalCode: address.postalCode || "",
      isDefault: address.isDefault
    });
    setErrors({});
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      if (isAdding) {
        // Create new address
        const newAddress: Address = {
          id: `addr_${Date.now()}`,
          ...formData
        };

        // If setting as default, unset others
        const updatedAddresses = formData.isDefault
          ? addresses.map(addr => ({ ...addr, isDefault: false }))
          : addresses;

        setAddresses([...updatedAddresses, newAddress]);
        setIsAdding(false);
      } else if (editingId) {
        // Update existing address
        setAddresses(addresses.map(addr => {
          if (addr.id === editingId) {
            return { ...addr, ...formData };
          }
          // If setting another as default, unset this one
          if (formData.isDefault) {
            return { ...addr, isDefault: false };
          }
          return addr;
        }));
        setEditingId(null);
      }

      // Reset form
      setFormData({
        label: "",
        streetAddress: "",
        ward: "",
        district: "",
        city: "",
        postalCode: "",
        isDefault: false
      });
    } catch (error) {
      console.error("Error saving address:", error);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      label: "",
      streetAddress: "",
      ward: "",
      district: "",
      city: "",
      postalCode: "",
      isDefault: false
    });
    setErrors({});
  };

  const handleDelete = async (addressId: string) => {
    const addressToDelete = addresses.find(addr => addr.id === addressId);
    if (!addressToDelete) return;

    if (addresses.length === 1) {
      alert("Không thể xóa địa chỉ cuối cùng");
      return;
    }

    if (window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) {
      const remainingAddresses = addresses.filter(addr => addr.id !== addressId);
      
      // If deleting default address, make first remaining address default
      if (addressToDelete.isDefault && remainingAddresses.length > 0) {
        remainingAddresses[0].isDefault = true;
      }

      setAddresses(remainingAddresses);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    })));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Address List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Danh sách địa chỉ ({addresses.length}/5)
          </h3>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  address.isDefault
                    ? "border-green-200 bg-green-50"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                {editingId === address.id ? (
                  // Edit Form
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nhãn địa chỉ
                        </label>
                        <input
                          type="text"
                          value={formData.label}
                          onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div className="flex items-center">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={formData.isDefault}
                            onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          Địa chỉ mặc định
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Địa chỉ <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.streetAddress}
                        onChange={(e) => setFormData(prev => ({ ...prev, streetAddress: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                          errors.streetAddress ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Số nhà, tên đường"
                      />
                      {errors.streetAddress && (
                        <p className="mt-1 text-sm text-red-600">{errors.streetAddress}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phường/Xã
                        </label>
                        <input
                          type="text"
                          value={formData.ward}
                          onChange={(e) => setFormData(prev => ({ ...prev, ward: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quận/Huyện <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.district}
                          onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                            errors.district ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                        {errors.district && (
                          <p className="mt-1 text-sm text-red-600">{errors.district}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tỉnh/Thành phố <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                            errors.city ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                        {errors.city && (
                          <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                        )}
                      </div>
                    </div>

                    <div className="w-full md:w-1/3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mã bưu điện
                      </label>
                      <input
                        type="text"
                        value={formData.postalCode}
                        onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
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
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
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
                        <span className="font-medium text-gray-900">
                          {address.label}
                        </span>
                        {address.isDefault && (
                          <span className="px-2 py-1 text-xs bg-green-600 text-white rounded-full">
                            Mặc định
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {!address.isDefault && (
                          <button
                            onClick={() => handleSetDefault(address.id)}
                            className="px-3 py-1 text-xs text-green-600 border border-green-600 rounded-lg hover:bg-green-50"
                          >
                            Đặt làm mặc định
                          </button>
                        )}
                        <button
                          onClick={() => handleStartEdit(address)}
                          className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(address.id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700">
                      <div className="font-medium">{address.streetAddress}</div>
                      <div>
                        {[address.ward, address.district, address.city]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                      {address.postalCode && (
                        <div className="text-gray-500">
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
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-4">Thêm địa chỉ mới</h4>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nhãn địa chỉ
                      </label>
                      <input
                        type="text"
                        value={formData.label}
                        onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="Ví dụ: Nhà riêng, Văn phòng"
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={formData.isDefault}
                          onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        Địa chỉ mặc định
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Địa chỉ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.streetAddress}
                      onChange={(e) => setFormData(prev => ({ ...prev, streetAddress: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                        errors.streetAddress ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Số nhà, tên đường"
                    />
                    {errors.streetAddress && (
                      <p className="mt-1 text-sm text-red-600">{errors.streetAddress}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phường/Xã
                      </label>
                      <input
                        type="text"
                        value={formData.ward}
                        onChange={(e) => setFormData(prev => ({ ...prev, ward: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="Phường/Xã"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quận/Huyện <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.district}
                        onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                          errors.district ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Quận/Huyện"
                      />
                      {errors.district && (
                        <p className="mt-1 text-sm text-red-600">{errors.district}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tỉnh/Thành phố <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                          errors.city ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Tỉnh/Thành phố"
                      />
                      {errors.city && (
                        <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                      )}
                    </div>
                  </div>

                  <div className="w-full md:w-1/3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mã bưu điện
                    </label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
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
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <X className="w-4 h-4" />
                      Hủy
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Add Button */}
            {!isAdding && !editingId && addresses.length < 5 && (
              <button
                onClick={handleStartAdd}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
              >
                <div className="flex items-center justify-center gap-2">
                  <Plus className="w-5 h-5" />
                  <span>Thêm địa chỉ mới</span>
                </div>
              </button>
            )}

            {addresses.length >= 5 && (
              <div className="text-center text-sm text-gray-500 py-4">
                Đã đạt giới hạn tối đa 5 địa chỉ cho mỗi khách hàng
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}