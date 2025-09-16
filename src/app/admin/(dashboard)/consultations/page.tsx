"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  MessageCircle,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Send,
  Package,
  Calendar,
  ExternalLink,
  Trash2,
} from "lucide-react";
import type { Consultation, ConsultationStatus } from "@/types";
import { toast } from "sonner";
import { Pagination } from "@/components/ui/Pagination";
import Image from "next/image";
import Link from "next/link";

interface ConsultationFilters {
  status: string;
  dateFrom: string;
  dateTo: string;
  search: string;
}

const statusConfig = {
  PENDING: {
    label: "Chờ xử lý",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  IN_PROGRESS: {
    label: "Đang xử lý",
    color: "bg-blue-100 text-blue-800",
    icon: MessageCircle,
  },
  RESOLVED: {
    label: "Đã giải quyết",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  CLOSED: {
    label: "Đã đóng",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
  },
};

export default function ConsultationsManagement() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConsultation, setSelectedConsultation] =
    useState<Consultation | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [consultationToDelete, setConsultationToDelete] = useState<
    string | null
  >(null);
  const [adminResponse, setAdminResponse] = useState("");
  const [selectedStatus, setSelectedStatus] =
    useState<ConsultationStatus>("PENDING");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filters, setFilters] = useState<ConsultationFilters>({
    status: "",
    dateFrom: "",
    dateTo: "",
    search: "",
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem("admin_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchConsultations = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.status && { status: filters.status }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
        ...(filters.search && { search: filters.search }),
      });

      const headers = getAuthHeaders();
      console.log("Auth headers:", headers);
      console.log("Fetching URL:", `/api/admin/consultations?${params}`);

      const response = await fetch(`/api/admin/consultations?${params}`, {
        headers,
      });
      const data = await response.json();
      console.log("Fetched consultations:", data);

      if (data.success) {
        setConsultations(data.data || []);
        setPagination((prev) => ({
          ...prev,
          total: data.meta?.pagination?.total || 0,
          totalPages: data.meta?.pagination?.totalPages || 0,
        }));
      } else {
        console.error("API Error:", data);
        toast.error(data.message || "Không thể tải danh sách tư vấn");
      }
    } catch (error) {
      console.error("Error fetching consultations:", error);
      toast.error("Có lỗi xảy ra khi tải danh sách tư vấn");
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchConsultations();
  }, [fetchConsultations]);

  const handleUpdateConsultation = async () => {
    if (!selectedConsultation) return;

    try {
      setActionLoading("response");

      // Update status and notes
      const updateData = {
        status: selectedStatus,
        notes: adminResponse.trim() || null,
      };

      console.log("Updating consultation:", selectedConsultation.id);
      console.log("Update data:", updateData);

      const response = await fetch(
        `/api/admin/consultations/${selectedConsultation.id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(updateData),
        }
      );

      console.log("Update response:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      const data = await response.json();
      console.log("Update data:", data);

      if (data.success) {
        toast.success("Cập nhật consultation thành công!");
        setAdminResponse("");
        fetchConsultations();
        setShowModal(false);
        setSelectedConsultation(null);
      } else {
        toast.error(data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error updating consultation:", error);
      toast.error("Có lỗi xảy ra khi cập nhật consultation");
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewConsultation = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setAdminResponse(consultation.notes || "");
    setSelectedStatus(consultation.status);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedConsultation(null);
    setAdminResponse("");
  };

  const handleFilterChange = (
    field: keyof ConsultationFilters,
    value: string
  ) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleDeleteConsultation = async (consultationId: string) => {
    setConsultationToDelete(consultationId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteConsultation = async () => {
    if (!consultationToDelete) return;

    try {
      setActionLoading("delete");

      const response = await fetch(
        `http://localhost:8080/api/consultations/${consultationToDelete}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Xóa consultation thành công");
        setConsultations((prev) =>
          prev.filter((c) => c.id !== consultationToDelete)
        );
        setShowDeleteConfirm(false);
        setConsultationToDelete(null);
      } else {
        toast.error(data.message || "Có lỗi xảy ra khi xóa consultation");
      }
    } catch (error) {
      console.error("Error deleting consultation:", error);
      toast.error("Có lỗi xảy ra khi xóa consultation");
    } finally {
      setActionLoading(null);
    }
  };

  const cancelDeleteConsultation = () => {
    setShowDeleteConfirm(false);
    setConsultationToDelete(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Quản lý tư vấn khách hàng
            </h1>
            <p className="text-gray-600 mt-2">
              Xử lý các yêu cầu tư vấn từ khách hàng qua Messenger
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên khách hàng..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Tất cả trạng thái</option>
              {Object.entries(statusConfig).map(([status, config]) => (
                <option key={status} value={status}>
                  {config.label}
                </option>
              ))}
            </select>

            {/* Date From */}
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Từ ngày"
            />

            {/* Date To */}
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange("dateTo", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Đến ngày"
            />
          </div>
        </div>

        {/* Consultations Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Yêu cầu tư vấn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sản phẩm quan tâm
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
                ) : consultations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Chưa có tư vấn nào</p>
                    </td>
                  </tr>
                ) : (
                  consultations.map((consultation) => {
                    const statusInfo = statusConfig[consultation.status];
                    const StatusIcon = statusInfo.icon;

                    return (
                      <tr key={consultation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <User className="w-10 h-10 text-gray-400 p-2 bg-gray-100 rounded-full" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {consultation.customerName || "Khách hàng"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {consultation.phoneNumber || "N/A"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs">
                            <div className="truncate" title="Tư vấn sản phẩm">
                              Tư vấn {consultation.totalItems} sản phẩm
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {consultation.consultationItems.length > 0 ? (
                              <div>
                                <span className="font-medium">
                                  {consultation.consultationItems.length} sản
                                  phẩm
                                </span>
                                <div className="text-xs text-gray-500 mt-1">
                                  {
                                    consultation.consultationItems[0]
                                      ?.productName
                                  }
                                  {consultation.consultationItems.length > 1 &&
                                    "..."}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400">Không có</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${statusInfo.color}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {new Date(
                              consultation.createdAt
                            ).toLocaleDateString("vi-VN")}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() =>
                                handleViewConsultation(consultation)
                              }
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="Xem chi tiết"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteConsultation(consultation.id)
                              }
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Xóa consultation"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 border-t">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(page) =>
                  setPagination((prev) => ({ ...prev, page }))
                }
                className="justify-center"
              />
            </div>
          )}
        </div>
      </div>

      {/* Consultation Detail Modal */}
      {showModal && selectedConsultation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">Chi tiết tư vấn</h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* Customer Info */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Thông tin khách hàng
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Tên:</span>
                      <p className="text-sm font-medium">
                        {selectedConsultation.customerName || "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">
                        Số điện thoại:
                      </span>
                      <p className="text-sm font-medium">
                        {selectedConsultation.phoneNumber || "N/A"}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-gray-600">Địa chỉ:</span>
                      <p className="text-sm font-medium">
                        {selectedConsultation.address || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Consultation Info */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Thông tin tư vấn
                </h4>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-800">
                    Khách hàng yêu cầu tư vấn {selectedConsultation.totalItems}{" "}
                    sản phẩm
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Ngày tạo:{" "}
                    {new Date(selectedConsultation.createdAt).toLocaleString(
                      "vi-VN"
                    )}
                  </p>
                </div>
              </div>

              {/* Products */}
              {selectedConsultation.consultationItems.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Sản phẩm quan tâm
                  </h4>
                  <div className="space-y-3">
                    {selectedConsultation.consultationItems.map((item) => {
                      // Get product images
                      const productImages =
                        item.product?.productImages?.map((img) => img.url) ||
                        (Array.isArray(item.product?.images)
                          ? item.product.images
                          : []);
                      const firstImage = productImages[0];

                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            {firstImage ? (
                              <div className="w-16 h-16 relative bg-white rounded-lg overflow-hidden border border-gray-200">
                                <Image
                                  src={firstImage}
                                  alt={item.productName}
                                  fill
                                  className="object-cover"
                                  sizes="64px"
                                />
                              </div>
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Package className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Link
                                href={`/products/${item.productId}`}
                                target="_blank"
                                className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                              >
                                {item.productName}
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            </div>
                            <p className="text-xs text-gray-500">
                              {item.category} • {item.color} • {item.capacity}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              Số lượng:{" "}
                              <span className="font-medium">
                                {item.quantity}
                              </span>
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Ghi chú của admin
                </h4>
                {selectedConsultation.notes ? (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-800">
                      {selectedConsultation.notes}
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 italic">
                      Chưa có ghi chú
                    </p>
                  </div>
                )}
              </div>

              {/* Response Form */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Cập nhật ghi chú
                </h4>
                <textarea
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  rows={4}
                  placeholder="Thêm ghi chú cho consultation này..."
                />
              </div>

              {/* Status Selection */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Cập nhật trạng thái
                </h4>
                <select
                  value={selectedStatus}
                  onChange={(e) =>
                    setSelectedStatus(e.target.value as ConsultationStatus)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {Object.entries(statusConfig).map(([status, config]) => (
                    <option key={status} value={status}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t p-6">
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Đóng
                </button>
                <button
                  onClick={handleUpdateConsultation}
                  disabled={actionLoading === "response"}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading === "response" && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <Send className="w-4 h-4" />
                  Cập nhật
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Xác nhận xóa
                </h3>
                <p className="text-sm text-gray-500">
                  Hành động này không thể hoàn tác
                </p>
              </div>
            </div>

            <p className="text-gray-700 mb-6">
              Bạn có chắc chắn muốn xóa consultation này? Tất cả thông tin liên
              quan sẽ bị xóa vĩnh viễn.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDeleteConsultation}
                disabled={actionLoading === "delete"}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={confirmDeleteConsultation}
                disabled={actionLoading === "delete"}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading === "delete" && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <Trash2 className="w-4 h-4" />
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
