import { Eye, Edit, Trash2, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { HeroImage } from "@/hooks/admin/useHeroImages";
import OptimizedImage from "@/components/OptimizedImage";

interface HeroImageCardProps {
  image: HeroImage;
  onEdit: (image: HeroImage) => void;
  onDelete: (image: HeroImage) => void;
  formatDate: (dateString: string) => string;
}

export function HeroImageCard({
  image,
  onEdit,
  onDelete,
  formatDate,
}: HeroImageCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging
      ? "none"
      : transition || "transform 350ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:bg-gray-750 transition-all duration-350 ease-out"
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="bg-gray-700 hover:bg-gray-600 px-4 py-2 cursor-grab active:cursor-grabbing flex items-center gap-2 transition-colors duration-200"
      >
        <GripVertical className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-300">Kéo để sắp xếp</span>
      </div>

      {/* Image Preview */}
      <div className="relative h-48 bg-gray-700">
        <OptimizedImage
          src={image.imageUrl}
          alt={image.altText}
          fill
          className="object-contain"
          style={{ objectFit: "contain" }}
        />
        <div className="absolute top-2 right-2 flex gap-1">
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              image.isActive
                ? "bg-gray-700 text-white"
                : "bg-gray-500 text-gray-300"
            }`}
          >
            {image.isActive ? "Hiển thị" : "Ẩn"}
          </span>
          <span className="px-2 py-1 text-xs bg-gray-600 text-white rounded-full">
            #{image.order}
          </span>
        </div>
      </div>

      {/* Image Info */}
      <div className="p-4">
        <h3 className="text-white font-medium mb-1 truncate">{image.title}</h3>
        <p className="text-gray-400 text-sm mb-3 truncate">{image.altText}</p>

        <div className="text-xs text-gray-500 mb-3">
          <div>Tạo bởi: {image.createdByAdmin.username}</div>
          <div>Ngày tạo: {formatDate(image.createdAt)}</div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => window.open(image.imageUrl, "_blank")}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-white hover:bg-gray-700 rounded-lg transition-colors"
            title="Xem ảnh gốc"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Xem</span>
          </button>
          <button
            onClick={() => onEdit(image)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-white hover:bg-gray-700 rounded-lg transition-colors"
            title="Chỉnh sửa"
          >
            <Edit className="w-4 h-4" />
            <span className="hidden sm:inline">Sửa</span>
          </button>
          <button
            onClick={() => onDelete(image)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
            title="Xóa"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Xóa</span>
          </button>
        </div>
      </div>
    </div>
  );
}
