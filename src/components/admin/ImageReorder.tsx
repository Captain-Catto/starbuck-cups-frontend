"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import OptimizedImage from "@/components/OptimizedImage";

interface ImageItem {
  id: string;
  url: string;
  order: number;
}

interface SortableImageItemProps {
  image: ImageItem;
  onRemove: (id: string) => void;
}

function SortableImageItem({ image, onRemove }: SortableImageItemProps) {
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
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-md shadow-sm ${
        isDragging ? "shadow-lg" : ""
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      <OptimizedImage
        src={image.url}
        alt={`Product image ${image.order + 1}`}
        width={48}
        height={48}
        className="w-12 h-12 object-cover rounded border"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />

      <span className="flex-1 text-sm text-gray-700 truncate" title={image.url}>
        {image.url.length > 50 ? `${image.url.substring(0, 50)}...` : image.url}
      </span>

      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
        #{image.order + 1}
      </span>

      <button
        type="button"
        onClick={() => onRemove(image.id)}
        className="text-red-500 hover:text-red-700 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

interface ImageReorderProps {
  images: string[];
  onReorder: (newImageUrls: string[]) => void;
  onRemove?: (index: number) => void;
  className?: string;
}

export default function ImageReorder({
  images,
  onReorder,
  onRemove,
  className = ""
}: ImageReorderProps) {
  // Convert string array to ImageItem array
  const [imageItems, setImageItems] = useState<ImageItem[]>(() =>
    images.map((url, index) => ({
      id: `${index}-${url}`,
      url,
      order: index,
    }))
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Update imageItems when images prop changes
  useEffect(() => {
    const newItems = images.map((url, index) => ({
      id: `${index}-${url}`,
      url,
      order: index,
    }));
    setImageItems(newItems);
  }, [images]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setImageItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        const newItems = arrayMove(items, oldIndex, newIndex);

        // Update order field
        const updatedItems = newItems.map((item, index) => ({
          ...item,
          order: index,
        }));

        // Use setTimeout to avoid setState during render
        setTimeout(() => {
          const newUrls = updatedItems.map(item => item.url);
          onReorder(newUrls);
        }, 0);

        return updatedItems;
      });
    }
  }, [onReorder]);

  const handleRemove = useCallback((id: string) => {
    const index = imageItems.findIndex(item => item.id === id);
    if (index !== -1 && onRemove) {
      onRemove(index);
    }
  }, [imageItems, onRemove]);

  if (imageItems.length === 0) {
    return (
      <div className={`text-center text-gray-500 py-4 ${className}`}>
        Chưa có hình ảnh nào
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-2 text-sm text-gray-600">
        Kéo thả để sắp xếp thứ tự hình ảnh
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={imageItems.map(item => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {imageItems.map((image) => (
              <SortableImageItem
                key={image.id}
                image={image}
                onRemove={handleRemove}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
