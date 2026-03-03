import { Edit2, Trash2, Eye, EyeOff, Package } from "lucide-react";
import type { Capacity, PaginationMeta } from "@/types";
import { Pagination } from "@/components/ui/Pagination";

interface CapacityWithCount extends Capacity {
  _count?: {
    products: number;
  };
}

interface CapacitiesTableProps {
  capacities: CapacityWithCount[];
  loading: boolean;
  actionLoading: string | null;
  searchQuery: string;
  pagination: PaginationMeta | null;
  onEdit: (capacity: Capacity) => void;
  onDelete: (capacity: CapacityWithCount) => void;
  onToggleStatus: (capacity: CapacityWithCount) => void;
  onPageChange: (page: number) => void;
}

export function CapacitiesTable({
  capacities,
  loading,
  actionLoading,
  searchQuery,
  pagination,
  onEdit,
  onDelete,
  onToggleStatus,
  onPageChange,
}: CapacitiesTableProps) {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Tên dung tích
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Dung tích (ml)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Số sản phẩm
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
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Đang tải...</p>
                </td>
              </tr>
            ) : capacities.length === 0 ? (
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
              capacities.map((capacity) => (
                <tr key={capacity.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-white">
                        {capacity.name}
                      </div>
                      {capacity.slug && (
                        <div className="text-xs text-gray-300 bg-gray-700 px-2 py-1 rounded mt-1 inline-block">
                          slug: {capacity.slug}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {capacity.volumeMl}ml
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {capacity._count?.products || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        capacity.isActive
                          ? "bg-gray-700 text-white"
                          : "bg-gray-600 text-white"
                      }`}
                    >
                      {capacity.isActive ? "Hoạt động" : "Không hoạt động"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {new Date(capacity.createdAt).toLocaleDateString("vi-VN")}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(capacity)}
                        disabled={actionLoading === capacity.id}
                        className="text-white hover:bg-gray-700 p-1 rounded transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onToggleStatus(capacity)}
                        disabled={actionLoading === capacity.id}
                        className="text-white hover:bg-gray-700 p-1 rounded transition-colors"
                        title={capacity.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                      >
                        {actionLoading === capacity.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : capacity.isActive ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => onDelete(capacity)}
                        disabled={actionLoading === capacity.id}
                        className="text-white hover:bg-gray-700 p-1 rounded transition-colors"
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

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="px-6 py-4 border-t border-gray-700">
          <Pagination data={pagination} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  );
}
