"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  X,
  Package,
} from "lucide-react";
import type { Capacity } from "@/types";
import { toast } from "sonner";

interface CapacityWithCount extends Capacity {
  _count?: {
    products: number;
  };
}

interface CapacityFormData {
  name: string;
  volumeMl: number;
  isActive: boolean;
}

interface CapacityFormErrors {
  name?: string;
  volumeMl?: string;
  isActive?: string;
}

export default function CapacitiesManagement() {
  const [capacities, setCapacities] = useState<CapacityWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("active");
  const [showModal, setShowModal] = useState(false);
  const [editingCapacity, setEditingCapacity] = useState<Capacity | null>(null);
  const [formData, setFormData] = useState<CapacityFormData>({
    name: "",
    volumeMl: 0,
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState<CapacityFormErrors>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem("admin_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchCapacities = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/capacities", {
        headers: getAuthHeaders(),
      });
      const data = await response.json();

      if (data.success) {
        setCapacities(data.data?.items || []);
      } else {
        console.error("API Error:", data);
        toast.error(data.message || "Không thể tải danh sách dung tích");
      }
    } catch (error) {
      console.error("Error fetching capacities:", error);
      toast.error("Có lỗi xảy ra khi tải dung tích");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCapacities();
  }, [fetchCapacities]);

  const validateForm = (): boolean => {
    const errors: CapacityFormErrors = {};

    if (!formData.name.trim()) {
      errors.name = "Tên dung tích là bắt buộc";
    } else if (formData.name.length > 100) {
      errors.name = "Tên dung tích không được vượt quá 100 ký tự";
    }

    if (!formData.volumeMl || formData.volumeMl <= 0) {
      errors.volumeMl = "Dung tích phải lớn hơn 0";
    } else if (formData.volumeMl > 10000) {
      errors.volumeMl = "Dung tích không được vượt quá 10,000ml";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setActionLoading("submit");

      const url = editingCapacity
        ? `/api/admin/capacities/${editingCapacity.id}`
        : "/api/admin/capacities";

      const method = editingCapacity ? "PUT" : "POST";

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
          editingCapacity
            ? "Cập nhật dung tích thành công"
            : "Tạo dung tích thành công"
        );
        handleCloseModal();
        fetchCapacities();
      } else {
        toast.error(data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error saving capacity:", error);
      toast.error("Có lỗi xảy ra khi lưu dung tích");
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = (capacity: Capacity) => {
    setEditingCapacity(capacity);
    setFormData({
      name: capacity.name,
      volumeMl: capacity.volumeMl,
      isActive: capacity.isActive,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa dung tích này?")) return;

    try {
      setActionLoading(id);
      const response = await fetch(`/api/admin/capacities/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Xóa dung tích thành công");
        fetchCapacities();
      } else {
        toast.error(data.message || "Có lỗi xảy ra khi xóa");
      }
    } catch (error) {
      console.error("Error deleting capacity:", error);
      toast.error("Có lỗi xảy ra khi xóa dung tích");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (id: string) => {
    const capacity = capacities.find((c) => c.id === id);
    if (!capacity) return;

    setActionLoading(id);

    // Optimistic update - cập nhật UI ngay lập tức
    const updatedCapacities = capacities.map((c) =>
      c.id === id ? { ...c, isActive: !c.isActive } : c
    );
    setCapacities(updatedCapacities);

    try {
      const response = await fetch(
        `/api/admin/capacities/${id}/toggle-status`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success(
          `Đã ${!capacity.isActive ? "kích hoạt" : "tắt"} dung tích "${
            capacity.name
          }"`
        );
        // Không cần fetchCapacities() nữa vì đã update optimistically
      } else {
        // Rollback nếu có lỗi
        setCapacities(capacities);
        toast.error(data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      // Rollback nếu có lỗi network
      setCapacities(capacities);
      console.error("Error toggling status:", error);
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCapacity(null);
    setFormData({
      name: "",
      volumeMl: 0,
      isActive: true,
    });
    setFormErrors({});
  };

  const filteredCapacities = capacities.filter((capacity) => {
    const matchesSearch = capacity.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && capacity.isActive) ||
      (statusFilter === "inactive" && !capacity.isActive);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Quản lý dung tích
            </h1>
            <p className="text-gray-600 mt-2">
              Quản lý các loại dung tích cốc và ly
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Thêm dung tích
          </button>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm kiếm dung tích..."
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
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white min-w-48"
            >
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Đã ẩn</option>
              <option value="all">Tất cả trạng thái</option>
            </select>
          </div>
        </div>

        {/* Capacities Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên dung tích
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dung tích (ml)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số sản phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                      <p className="text-gray-500 mt-2">Đang tải...</p>
                    </td>
                  </tr>
                ) : filteredCapacities.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">
                        {searchQuery
                          ? "Không tìm thấy dung tích nào"
                          : "Chưa có dung tích nào"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredCapacities.map((capacity) => (
                    <tr key={capacity.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {capacity.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {capacity.volumeMl}ml
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {capacity._count?.products || 0}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            capacity.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {capacity.isActive ? "Hoạt động" : "Không hoạt động"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(capacity.createdAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(capacity)}
                            disabled={actionLoading === capacity.id}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Chỉnh sửa"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(capacity.id)}
                            disabled={actionLoading === capacity.id}
                            className={`p-1 ${
                              capacity.isActive
                                ? "text-yellow-600 hover:text-yellow-900"
                                : "text-green-600 hover:text-green-900"
                            }`}
                            title={
                              capacity.isActive ? "Vô hiệu hóa" : "Kích hoạt"
                            }
                          >
                            {actionLoading === capacity.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                            ) : capacity.isActive ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(capacity.id)}
                            disabled={actionLoading === capacity.id}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">
                {editingCapacity ? "Chỉnh sửa dung tích" : "Thêm dung tích mới"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên dung tích *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      formErrors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Vd: Size L, Size XL..."
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                {/* Volume */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dung tích (ml) *
                  </label>
                  <input
                    type="number"
                    value={formData.volumeMl}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        volumeMl: parseInt(e.target.value) || 0,
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      formErrors.volumeMl ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="473"
                    min="1"
                    max="10000"
                  />
                  {formErrors.volumeMl && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.volumeMl}
                    </p>
                  )}
                </div>

                {/* Active Status */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <label
                    htmlFor="isActive"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Kích hoạt ngay
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === "submit"}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading === "submit" && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  {editingCapacity ? "Cập nhật" : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
