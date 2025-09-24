import { Plus } from "lucide-react";

interface CapacitiesHeaderProps {
  onAddCapacity: () => void;
}

export function CapacitiesHeader({ onAddCapacity }: CapacitiesHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Quản lý dung tích</h1>
        <p className="text-gray-300 mt-2">
          Quản lý các loại dung tích cốc và ly
        </p>
      </div>
      <button
        onClick={onAddCapacity}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
      >
        <Plus className="w-5 h-5" />
        Thêm dung tích
      </button>
    </div>
  );
}