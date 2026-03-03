import {
  XCircle,
  Package,
  ExternalLink,
  Send,
  Clock,
  CheckCircle,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import type { Consultation, ConsultationStatus } from "@/types";
import { getFirstProductImageUrl } from "@/lib/utils/image";
import OptimizedImage from "@/components/OptimizedImage";

interface ConsultationDetailModalProps {
  isOpen: boolean;
  consultation: Consultation | null;
  adminResponse: string;
  selectedStatus: ConsultationStatus;
  actionLoading: string | null;
  onClose: () => void;
  onUpdate: () => Promise<void>;
  onAdminResponseChange: (value: string) => void;
  onStatusChange: (status: ConsultationStatus) => void;
}

const statusConfig = {
  PENDING: {
    label: "Chờ xử lý",
    color: "bg-yellow-900 text-yellow-200",
    icon: Clock,
  },
  IN_PROGRESS: {
    label: "Đang xử lý",
    color: "bg-blue-900 text-blue-200",
    icon: MessageCircle,
  },
  RESOLVED: {
    label: "Đã giải quyết",
    color: "bg-gray-900 text-green-200",
    icon: CheckCircle,
  },
  CLOSED: {
    label: "Đã đóng",
    color: "bg-red-900 text-red-200",
    icon: XCircle,
  },
};

export function ConsultationDetailModal({
  isOpen,
  consultation,
  adminResponse,
  selectedStatus,
  actionLoading,
  onClose,
  onUpdate,
  onAdminResponseChange,
  onStatusChange,
}: ConsultationDetailModalProps) {
  if (!isOpen || !consultation) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Chi tiết tư vấn</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Customer Info */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-white mb-3">
              Thông tin khách hàng
            </h4>
            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-400">Tên:</span>
                  <p className="text-sm font-medium text-white">
                    {consultation.customerName || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Số điện thoại:</span>
                  <p className="text-sm font-medium text-white">
                    {consultation.phoneNumber || "N/A"}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-sm text-gray-400">Địa chỉ:</span>
                  <p className="text-sm font-medium text-white">
                    {consultation.address || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Consultation Info */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-white mb-3">
              Thông tin tư vấn
            </h4>
            <div className="bg-blue-900/50 p-4 rounded-lg border border-blue-800">
              <p className="text-sm text-blue-200">
                Khách hàng yêu cầu tư vấn các sản phẩm
              </p>
              <p className="text-xs text-blue-300 mt-1">
                Ngày tạo:{" "}
                {new Date(consultation.createdAt).toLocaleString("vi-VN")}
              </p>
            </div>
          </div>

          {/* Products */}
          {consultation.consultationItems.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-white mb-3">
                Sản phẩm quan tâm
              </h4>
              <div className="space-y-3">
                {consultation.consultationItems.map((item) => {
                  // Get first image URL using helper function
                  const firstImage = getFirstProductImageUrl(item.product?.productImages);

                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors border border-gray-600"
                    >
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        {firstImage ? (
                          <div className="w-16 h-16 relative bg-gray-800 rounded-lg overflow-hidden border border-gray-600">
                            <OptimizedImage
                              src={firstImage}
                              alt={item.productName}
                              width={64}
                              height={64}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-gray-600 rounded-lg flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Link
                            href={`/products/${
                              item.product?.slug || item.productId
                            }`}
                            target="_blank"
                            className="text-sm font-medium text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1"
                          >
                            {item.productName}
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-400">
                            <span className="text-gray-300">Danh mục:</span> {item.category}
                          </p>
                          <p className="text-xs text-gray-400">
                            <span className="text-gray-300">Màu sắc:</span> {item.color}
                          </p>
                          <p className="text-xs text-gray-400">
                            <span className="text-gray-300">Dung tích:</span> {item.capacity}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Admin Notes */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-white mb-3">
              Ghi chú của admin
            </h4>
            {consultation.notes ? (
              <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                <p className="text-sm text-green-200">{consultation.notes}</p>
              </div>
            ) : (
              <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                <p className="text-sm text-gray-400 italic">Chưa có ghi chú</p>
              </div>
            )}
          </div>

          {/* Response Form */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-white mb-3">
              Cập nhật ghi chú
            </h4>
            <textarea
              value={adminResponse}
              onChange={(e) => onAdminResponseChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              rows={4}
              placeholder="Thêm ghi chú cho consultation này..."
            />
          </div>

          {/* Status Selection */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-white mb-3">
              Cập nhật trạng thái
            </h4>
            <select
              value={selectedStatus}
              onChange={(e) =>
                onStatusChange(e.target.value as ConsultationStatus)
              }
              className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
            >
              {Object.entries(statusConfig).map(([status, config]) => (
                <option key={status} value={status}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="border-t border-gray-700 p-6">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700"
            >
              Đóng
            </button>
            <button
              onClick={onUpdate}
              disabled={actionLoading === "response"}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 flex items-center gap-2"
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
  );
}
