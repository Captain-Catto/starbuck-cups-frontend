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
  AlertTriangle,
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
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("active");
  const [showModal, setShowModal] = useState(false);
  const [editingColor, setEditingColor] = useState<Color | null>(null);
  const [formData, setFormData] = useState<ColorFormData>({
    name: "",
    hexCode: "#000000",
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState<Partial<ColorFormData>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    color: ColorWithCount | null;
    action: "toggle" | "delete";
  }>({
    show: false,
    color: null,
    action: "toggle",
  });

  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem("admin_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchColors = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/colors", {
        headers: getAuthHeaders(),
      });
      const data = await response.json();

      if (data.success) {
        setColors(data.data?.items || []);
      } else {
        console.error("API Error:", data);
        toast.error(data.message || "Không thể tải danh sách màu sắc");
      }
    } catch (error) {
      console.error("Error fetching colors:", error);
      toast.error("Có lỗi xảy ra khi tải màu sắc");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      const url = editingColor
        ? `/api/admin/colors/${editingColor.id}`
        : "/api/admin/colors";

      const method = editingColor ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          editingColor ? "Cập nhật màu thành công" : "Tạo màu thành công"
        );
        handleCloseModal();
        fetchColors();
      } else {
        toast.error(data.message || "Có lỗi xảy ra");
      }
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
    const productCount = color._count?.products || 0;
    if (productCount > 0) {
      setConfirmModal({
        show: true,
        color: color,
        action: "delete",
      });
      return;
    }

    // Nếu không có products, thực hiện xóa ngay
    await performDelete(color);
  };

  const performDelete = async (color: ColorWithCount) => {
    setActionLoading(`delete-${color.id}`);
    try {
      const response = await fetch(`/api/admin/colors/${color.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Đã xóa màu "${color.name}" thành công`);
        fetchColors();
      } else {
        toast.error(data.message || "Có lỗi xảy ra khi xóa");
      }
    } catch (error) {
      console.error("Error deleting color:", error);
      toast.error("Có lỗi xảy ra khi xóa màu");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (color: ColorWithCount) => {
    // Nếu tắt màu đang có products sử dụng, hiển thị modal xác nhận
    const productCount = color._count?.products || 0;
    if (color.isActive && productCount > 0) {
      setConfirmModal({
        show: true,
        color: color,
        action: "toggle",
      });
      return;
    }

    // Nếu không có products hoặc đang kích hoạt lại, thực hiện ngay
    await performToggleStatus(color);
  };

  const performToggleStatus = async (color: ColorWithCount) => {
    setActionLoading(`toggle-${color.id}`);

    // Optimistic update - cập nhật UI ngay lập tức
    const updatedColors = colors.map((c) =>
      c.id === color.id ? { ...c, isActive: !c.isActive } : c
    );
    setColors(updatedColors);

    try {
      const response = await fetch(
        `/api/admin/colors/${color.id}/toggle-status`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (data.success) {
        const statusText = !color.isActive ? "kích hoạt" : "tắt";
        const productCount = color._count?.products || 0;
        const productInfo =
          productCount > 0 ? ` (${productCount} sản phẩm vẫn giữ màu này)` : "";
        toast.success(`Đã ${statusText} màu "${color.name}"${productInfo}`);
        // Không cần fetchColors() nữa vì đã update optimistically
      } else {
        // Rollback nếu có lỗi
        setColors(colors);

        // Hiển thị message cụ thể từ backend
        toast.error(data.error?.message || data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      // Rollback nếu có lỗi network
      setColors(colors);
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

  const filteredColors = colors.filter((color) => {
    const matchesSearch = color.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && color.isActive) ||
      (statusFilter === "inactive" && !color.isActive);

    return matchesSearch && matchesStatus;
  });

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
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as "all" | "active" | "inactive")
          }
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
        >
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Đã ẩn</option>
          <option value="all">Tất cả trạng thái</option>
        </select>
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
                className={`relative px-3 py-2 rounded-lg transition-colors ${
                  color.isActive
                    ? "text-gray-600 hover:bg-gray-50"
                    : "text-green-600 hover:bg-green-50"
                }`}
                title={
                  color.isActive && (color._count?.products || 0) > 0
                    ? `Tắt màu (${
                        color._count?.products || 0
                      } sản phẩm đang sử dụng)`
                    : color.isActive
                    ? "Tắt màu"
                    : "Kích hoạt màu"
                }
              >
                {actionLoading === `toggle-${color.id}` ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : color.isActive ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    {(color._count?.products || 0) > 0 && (
                      <span
                        className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"
                        title={`${
                          color._count?.products || 0
                        } sản phẩm đang sử dụng màu này`}
                      />
                    )}
                  </>
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={() => handleDelete(color)}
                disabled={actionLoading === `delete-${color.id}`}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Xóa màu"
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

      {/* Confirmation Modal */}
      {confirmModal.show && confirmModal.color && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    confirmModal.action === "delete"
                      ? "bg-red-100"
                      : "bg-yellow-100"
                  }`}
                >
                  <AlertTriangle
                    className={`w-5 h-5 ${
                      confirmModal.action === "delete"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {confirmModal.action === "delete"
                      ? "Xác nhận xóa màu"
                      : "Xác nhận tắt màu"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Màu đang được sử dụng bởi sản phẩm
                  </p>
                </div>
              </div>

              {/* Color info */}
              <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                <div
                  className="w-8 h-8 rounded border-2 border-gray-200"
                  style={{ backgroundColor: confirmModal.color.hexCode }}
                />
                <div>
                  <div className="font-medium text-gray-900">
                    {confirmModal.color.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {confirmModal.color.hexCode}
                  </div>
                </div>
              </div>

              {/* Warning message */}
              <div className="mb-6">
                <p className="text-gray-700 mb-3">
                  Màu <strong>&ldquo;{confirmModal.color.name}&rdquo;</strong>{" "}
                  đang được sử dụng trong{" "}
                  <strong>
                    {confirmModal.color._count?.products || 0} sản phẩm
                  </strong>
                  .
                </p>

                <div
                  className={`border rounded-lg p-3 ${
                    confirmModal.action === "delete"
                      ? "bg-red-50 border-red-200"
                      : "bg-yellow-50 border-yellow-200"
                  }`}
                >
                  {confirmModal.action === "delete" ? (
                    <>
                      <h4 className="font-medium text-red-800 mb-2">
                        ⚠️ Không thể xóa màu đang được sử dụng!
                      </h4>
                      <p className="text-sm text-red-700">
                        Bạn cần xóa hoặc thay đổi màu của tất cả sản phẩm trước
                        khi có thể xóa màu này.
                      </p>
                    </>
                  ) : (
                    <>
                      <h4 className="font-medium text-yellow-800 mb-2">
                        Khi tắt màu này:
                      </h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Các sản phẩm hiện tại vẫn giữ màu này</li>
                        <li>• Màu sẽ không hiển thị khi tạo sản phẩm mới</li>
                        <li>• Bạn có thể kích hoạt lại bất cứ lúc nào</li>
                      </ul>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    setConfirmModal({
                      show: false,
                      color: null,
                      action: "toggle",
                    })
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {confirmModal.action === "delete" ? "Đóng" : "Hủy"}
                </button>
                {confirmModal.action === "toggle" && (
                  <button
                    onClick={() => {
                      if (confirmModal.color) {
                        performToggleStatus(confirmModal.color);
                        setConfirmModal({
                          show: false,
                          color: null,
                          action: "toggle",
                        });
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    Xác nhận tắt
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
