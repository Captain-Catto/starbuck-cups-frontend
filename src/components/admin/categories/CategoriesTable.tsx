import { memo } from "react";
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

interface CategoryRowProps {
  category: CategoryWithCount;
  actionLoading: string | null;
  onEdit: (category: Category) => void;
  onDelete: (category: CategoryWithCount) => void;
  onToggleStatus: (category: CategoryWithCount) => void;
}

const CategoryRow = memo(function CategoryRow({
  category,
  actionLoading,
  onEdit,
  onDelete,
  onToggleStatus,
}: CategoryRowProps) {
  const isToggling = actionLoading === `toggle-${category.id}`;
  const isDeleting = actionLoading === `delete-${category.id}`;
  return (
    <tr className="hover:bg-gray-700 cursor-pointer" onClick={() => onEdit(category)}>
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-white">{category.name}</div>
        {category.slug && (
          <div className="text-xs text-gray-300">slug: {category.slug}</div>
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
            <span className="text-gray-400 italic">Không có mô tả</span>
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
            onClick={(e) => { e.stopPropagation(); onEdit(category); }}
            className="text-white hover:bg-gray-600 p-1 rounded transition-colors cursor-pointer"
            title="Chỉnh sửa"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleStatus(category); }}
            disabled={isToggling}
            className="text-white hover:bg-gray-600 p-1 rounded transition-colors cursor-pointer disabled:opacity-50"
            title={category.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
          >
            {isToggling ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
            ) : category.isActive ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(category); }}
            disabled={isDeleting}
            className="text-white hover:bg-gray-600 p-1 rounded transition-colors cursor-pointer disabled:opacity-50"
            title="Xóa"
          >
            {isDeleting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </td>
    </tr>
  );
});

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
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto" />
                  <p className="text-gray-300 mt-2">Đang tải...</p>
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <Package className="w-12 h-12 text-white mx-auto mb-4" />
                  <p className="text-gray-300">
                    {searchQuery ? "Không tìm thấy danh mục nào" : "Chưa có danh mục nào"}
                  </p>
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <CategoryRow
                  key={category.id}
                  category={category}
                  actionLoading={actionLoading}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleStatus={onToggleStatus}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
