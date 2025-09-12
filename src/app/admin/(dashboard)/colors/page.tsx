"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  AlertCircle,
  Check,
  X,
} from "lucide-react";
import type { Color } from "@/types";
import { toast } from "sonner";

interface ColorWithCount extends Color {
  _count?: {
    products: number;
  };
}

interface ColorFormData {
  name: string;
  hexCode: string;
  isActive: boolean;
}

export default function ColorsManagement() {
  const [colors, setColors] = useState<ColorWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingColor, setEditingColor] = useState<Color | null>(null);
  const [formData, setFormData] = useState<ColorFormData>({
    name: "",
    hexCode: "#000000",
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState<Partial<ColorFormData>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchColors();
  }, []);

  const fetchColors = async () => {
    try {
      setLoading(true);
      // Mock data for development
      const mockColors: ColorWithCount[] = [
        {
          id: "1",
          name: "Xanh Starbucks",
          hexCode: "#00704A",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          _count: { products: 12 },
        },
        {
          id: "2",
          name: "Đỏ Cherry",
          hexCode: "#D2001F",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          _count: { products: 8 },
        },
        {
          id: "3",
          name: "Xanh Navy",
          hexCode: "#0F3460",
          isActive: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          _count: { products: 0 },
        },
      ];
      setColors(mockColors);
    } catch (error) {
      console.error("Error fetching colors:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<ColorFormData> = {};

    if (!formData.name.trim()) {
      errors.name = "Tên màu là bắt buộc";
    } else if (formData.name.length > 100) {
      errors.name = "Tên màu không được vượt quá 100 ký tự";
    }

    const hexRegex = /^#[0-9A-F]{6}$/i;
    if (!hexRegex.test(formData.hexCode)) {
      errors.hexCode = "Mã màu phải có định dạng #RRGGBB";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setActionLoading("save");
    try {
      if (editingColor) {
        // Mock update
        setColors((prev) =>
          prev.map((c) =>
            c.id === editingColor.id ? { ...c, ...formData } : c
          )
        );
        toast.success(`Đã cập nhật màu "${formData.name}" thành công`);
      } else {
        // Mock create
        const newColor: ColorWithCount = {
          id: Date.now().toString(),
          ...formData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          _count: { products: 0 },
        };
        setColors((prev) => [newColor, ...prev]);
        toast.success(`Đã tạo màu "${formData.name}" thành công`);
      }

      handleCloseModal();
    } catch (error) {
      console.error("Error saving color:", error);
      toast.error("Có lỗi xảy ra khi lưu màu");
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = (color: ColorWithCount) => {
    setEditingColor(color);
    setFormData({
      name: color.name,
      hexCode: color.hexCode,
      isActive: color.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (color: ColorWithCount) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa màu "${color.name}"?`)) return;

    setActionLoading(`delete-${color.id}`);
    try {
      // Mock delete
      setColors((prev) => prev.filter((c) => c.id !== color.id));
      toast.success(`Đã xóa màu "${color.name}" thành công`);
    } catch (error) {
      console.error("Error deleting color:", error);
      toast.error("Có lỗi xảy ra khi xóa màu");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (color: ColorWithCount) => {
    setActionLoading(`toggle-${color.id}`);
    try {
      // Mock toggle
      setColors((prev) =>
        prev.map((c) =>
          c.id === color.id ? { ...c, isActive: !c.isActive } : c
        )
      );
      toast.success(
        `Đã ${!color.isActive ? "kích hoạt" : "tắt"} màu "${color.name}"`
      );
    } catch (error) {
      console.error("Error toggling color status:", error);
      toast.error("Có lỗi xảy ra khi thay đổi trạng thái màu");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingColor(null);
    setFormData({
      name: "",
      hexCode: "#000000",
      isActive: true,
    });
    setFormErrors({});
  };

  const filteredColors = colors.filter((color) =>
    color.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý màu sắc</h1>
          <p className="text-gray-600">Quản lý các màu sắc cho sản phẩm</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Thêm màu mới
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm kiếm màu sắc..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>

      {/* Colors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredColors.map((color) => (
          <div
            key={color.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            {/* Color Preview */}
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-12 h-12 rounded-lg border-2 border-gray-200 shadow-sm"
                style={{ backgroundColor: color.hexCode }}
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{color.name}</h3>
                <p className="text-sm text-gray-500 font-mono">
                  {color.hexCode}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-600">
                {color._count?.products || 0} sản phẩm
              </div>
              <div
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  color.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {color.isActive ? "Đang sử dụng" : "Ẩn"}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEdit(color)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Sửa
              </button>

              <button
                onClick={() => handleToggleStatus(color)}
                disabled={actionLoading === `toggle-${color.id}`}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  color.isActive
                    ? "text-gray-600 hover:bg-gray-50"
                    : "text-green-600 hover:bg-green-50"
                }`}
              >
                {actionLoading === `toggle-${color.id}` ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : color.isActive ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={() => handleDelete(color)}
                disabled={
                  actionLoading === `delete-${color.id}` ||
                  (color._count?.products || 0) > 0
                }
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={
                  (color._count?.products || 0) > 0
                    ? "Không thể xóa màu đang được sử dụng"
                    : "Xóa màu"
                }
              >
                {actionLoading === `delete-${color.id}` ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredColors.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Không tìm thấy màu sắc
          </h3>
          <p className="text-gray-600">
            {searchQuery
              ? "Thử tìm kiếm với từ khóa khác"
              : "Chưa có màu sắc nào được tạo"}
          </p>
        </div>
      )}

      {/* Color Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black bg-opacity-25"
              onClick={handleCloseModal}
            />

            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingColor ? "Cập nhật màu sắc" : "Thêm màu mới"}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Color Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên màu *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      formErrors.name ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Nhập tên màu..."
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                {/* Color Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã màu *
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={formData.hexCode}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          hexCode: e.target.value,
                        }))
                      }
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.hexCode}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          hexCode: e.target.value,
                        }))
                      }
                      className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono ${
                        formErrors.hexCode
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      placeholder="#000000"
                    />
                  </div>
                  {formErrors.hexCode && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.hexCode}
                    </p>
                  )}
                </div>

                {/* Status */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isActive: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label
                    htmlFor="isActive"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Hiển thị màu này
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading === "save"}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {actionLoading === "save" ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        {editingColor ? "Cập nhật" : "Tạo màu"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
