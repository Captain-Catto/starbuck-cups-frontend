import { Edit2, Trash2, Eye, EyeOff, AlertCircle } from "lucide-react";
import type { Color } from "@/types";

interface ColorWithCount extends Color {
  _count?: {
    productColors: number;
  };
}

interface ColorsTableProps {
  colors: ColorWithCount[];
  loading: boolean;
  actionLoading: string | null;
  searchQuery: string;
  onEdit: (color: ColorWithCount) => void;
  onDelete: (color: ColorWithCount) => void;
  onToggleStatus: (color: ColorWithCount) => void;
}

export function ColorsTable({
  colors,
  loading,
  actionLoading,
  searchQuery,
  onEdit,
  onDelete,
  onToggleStatus,
}: ColorsTableProps) {
  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  <div className="flex items-center gap-2">Màu sắc</div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Mã màu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Sản phẩm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {colors.map((color) => (
                <tr key={color.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg border border-gray-600"
                        style={{ backgroundColor: color.hexCode }}
                      />
                      <div>
                        <div className="text-sm font-medium text-white">
                          {color.name}
                        </div>
                        {color.slug && (
                          <div className="text-xs text-gray-300">
                            slug: {color.slug}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-white">
                      {color.hexCode}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {color._count?.productColors || 0} sản phẩm
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-700 text-white">
                      {color.isActive ? "Đang sử dụng" : "Ẩn"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(color)}
                        className="text-white hover:bg-gray-700 p-1 rounded transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onToggleStatus(color)}
                        disabled={actionLoading === `toggle-${color.id}`}
                        className="text-white hover:bg-gray-700 p-1 rounded transition-colors relative"
                        title={
                          color.isActive &&
                          (color._count?.productColors || 0) > 0
                            ? `Tắt màu (${
                                color._count?.productColors || 0
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
                            {(color._count?.productColors || 0) > 0 && (
                              <span className="absolute -top-1 -right-1 w-2 h-2 bg-gray-500 rounded-full" />
                            )}
                          </>
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => onDelete(color)}
                        disabled={actionLoading === `delete-${color.id}`}
                        className="text-white hover:bg-gray-700 p-1 rounded transition-colors"
                        title="Xóa màu"
                      >
                        {actionLoading === `delete-${color.id}` ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {colors.length === 0 && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-8">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-white mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              Không tìm thấy màu sắc
            </h3>
            <p className="text-gray-300">
              {searchQuery
                ? "Thử tìm kiếm với từ khóa khác"
                : "Chưa có màu sắc nào được tạo"}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
