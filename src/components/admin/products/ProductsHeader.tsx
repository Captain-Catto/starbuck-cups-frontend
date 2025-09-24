import { Plus } from "lucide-react";

interface ProductsHeaderProps {
  onCreateProduct: () => void;
}

export function ProductsHeader({ onCreateProduct }: ProductsHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Quản lý sản phẩm</h1>
        <p className="text-gray-300 mt-2">
          Quản lý danh sách sản phẩm, tồn kho và trạng thái
        </p>
      </div>
      <button
        onClick={onCreateProduct}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
      >
        <Plus className="w-5 h-5" />
        Thêm sản phẩm
      </button>
    </div>
  );
}