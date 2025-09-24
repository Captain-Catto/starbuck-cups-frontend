import { Edit2, Trash2, Eye, EyeOff, Package } from "lucide-react";
import type { Category } from "@/types";

interface CategoryWithCount extends Category {
  _count?: {
    products: number;
  };
}

interface CategoriesTableProps {
  categories: CategoryWithCount[];
  loading: boolean;
  actionLoading: string | null;
  searchQuery: string;
  onEdit: (category: Category) => void;
  onDelete: (category: CategoryWithCount) => void;
  onToggleStatus: (category: CategoryWithCount) => void;
}

export function CategoriesTable({
  categories,
  loading,
  actionLoading,
  searchQuery,
  onEdit,
  onDelete,
  onToggleStatus,
}: CategoriesTableProps) {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Tên danh mục
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Mô tả
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
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700 mx-auto"></div>
                  <p className="text-gray-300 mt-2">Đang tải...</p>
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <Package className="w-12 h-12 text-white mx-auto mb-4" />
                  <p className="text-gray-300">
                    {searchQuery
                      ? "Không tìm thấy danh mục nào"
                      : "Chưa có danh mục nào"}
                  </p>
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-white">
                      {category.name}
                    </div>
                    {category.slug && (
                      <div className="text-xs text-gray-300">
                        slug: {category.slug}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white max-w-xs">
                      {category.description ? (
                        <div
                          className="truncate prose prose-sm max-w-none"
                          title={category.description.replace(/<[^>]*>/g, "")}
                          dangerouslySetInnerHTML={{
                            __html:
                              category.description.length > 100
                                ? category.description.substring(0, 100) + "..."
                                : category.description,
                          }}
                        />
                      ) : (
                        <span className="text-gray-400 italic">
                          Không có mô tả
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-white">
                    {category._count?.products || 0}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-700 text-white">
                      {category.isActive ? "Hoạt động" : "Không hoạt động"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-white">
                    {new Date(category.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(category)}
                        disabled={actionLoading === category.id}
                        className="text-white hover:bg-gray-700 p-1 rounded transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onToggleStatus(category)}
                        disabled={actionLoading === `toggle-${category.id}`}
                        className="text-white hover:bg-gray-700 p-1 rounded transition-colors"
                        title={category.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                      >
                        {actionLoading === `toggle-${category.id}` ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        ) : category.isActive ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => onDelete(category)}
                        disabled={actionLoading === `delete-${category.id}`}
                        className="text-white hover:bg-gray-700 p-1 rounded transition-colors"
                        title="Xóa"
                      >
                        {actionLoading === `delete-${category.id}` ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
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
  );
}
