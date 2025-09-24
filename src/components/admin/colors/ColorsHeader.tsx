import { Plus } from "lucide-react";

interface ColorsHeaderProps {
  onAddColor: () => void;
}

export function ColorsHeader({ onAddColor }: ColorsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Quản lý màu sắc</h1>
        <p className="text-gray-300">Quản lý các màu sắc cho sản phẩm</p>
      </div>
      <button
        onClick={onAddColor}
        className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Thêm màu mới
      </button>
    </div>
  );
}