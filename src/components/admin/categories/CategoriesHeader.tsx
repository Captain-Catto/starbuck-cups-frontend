import { Plus } from "lucide-react";

interface CategoriesHeaderProps {
  onAddCategory: () => void;
}

export function CategoriesHeader({ onAddCategory }: CategoriesHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Quản lý danh mục</h1>
        <p className="text-gray-300 mt-2">Quản lý các danh mục sản phẩm</p>
      </div>
      <button
        onClick={onAddCategory}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
      >
        <Plus className="w-5 h-5" />
        Thêm danh mục
      </button>
    </div>
  );
}