import {
  MessageCircle,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  Trash2,
} from "lucide-react";
import type { Consultation, PaginationMeta } from "@/types";
import { Pagination } from "@/components/ui/Pagination";


interface ConsultationsTableProps {
  consultations: Consultation[];
  loading: boolean;
  pagination: PaginationMeta;
  onViewConsultation: (consultation: Consultation) => void;
  onDeleteConsultation: (consultationId: string) => void;
  onPageChange: (page: number) => void;
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

export function ConsultationsTable({
  consultations,
  loading,
  pagination,
  onViewConsultation,
  onDeleteConsultation,
  onPageChange,
}: ConsultationsTableProps) {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Khách hàng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Yêu cầu tư vấn
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Sản phẩm quan tâm
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Ngày tạo
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700 mx-auto"></div>
                  <p className="text-gray-300 mt-2">Đang tải...</p>
                </td>
              </tr>
            ) : consultations.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <MessageCircle className="w-12 h-12 text-white mx-auto mb-4" />
                  <p className="text-gray-300">Chưa có tư vấn nào</p>
                </td>
              </tr>
            ) : (
              consultations.map((consultation) => {
                const statusInfo = statusConfig[consultation.status];
                const StatusIcon = statusInfo.icon;

                return (
                  <tr key={consultation.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <User className="w-10 h-10 text-gray-500 p-2 bg-gray-700 rounded-full" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">
                            {consultation.customerName || "Khách hàng"}
                          </div>
                          <div className="text-sm text-gray-400">
                            {consultation.phoneNumber || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white max-w-xs">
                        <div className="truncate" title="Tư vấn sản phẩm">
                          Tư vấn {consultation.totalItems} sản phẩm
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white">
                        {consultation.consultationItems.length > 0 ? (
                          <div>
                            <span className="font-medium">
                              {consultation.consultationItems.length} sản phẩm
                            </span>
                            <div className="text-xs text-gray-400 mt-1">
                              {consultation.consultationItems[0]?.productName}
                              {consultation.consultationItems.length > 1 && "..."}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500">Không có</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-gray-700 text-white">
                        <StatusIcon className="w-3 h-3" />
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-white">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(consultation.createdAt).toLocaleDateString("vi-VN")}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onViewConsultation(consultation)}
                          className="text-white hover:bg-gray-700 p-1 rounded transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteConsultation(consultation.id)}
                          className="text-white hover:bg-gray-700 p-1 rounded transition-colors"
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
      {pagination.total_pages > 1 && (
        <div className="px-4 py-3 border-t border-gray-700">
          <Pagination
            data={pagination}
            onPageChange={onPageChange}
            className="justify-center"
          />
        </div>
      )}
    </div>
  );
}