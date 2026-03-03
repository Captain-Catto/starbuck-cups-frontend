import { useState, useEffect } from "react";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { HeroImageCard } from "./HeroImageCard";
import { HeroImage } from "@/hooks/admin/useHeroImages";

interface HeroImageGridProps {
  heroImages: HeroImage[];
  onEdit: (image: HeroImage) => void;
  onDelete: (image: HeroImage) => void;
  onReorder: (imageOrders: { id: string; order: number }[]) => Promise<boolean>;
  formatDate: (dateString: string) => string;
}

export function HeroImageGrid({
  heroImages,
  onEdit,
  onDelete,
  onReorder,
  formatDate,
}: HeroImageGridProps) {
  const [localHeroImages, setLocalHeroImages] = useState(heroImages);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const activeImage = activeId
    ? localHeroImages.find((img) => img.id === activeId)
    : null;

  // Sync local state with props, but only when not dragging
  useEffect(() => {
    if (!activeId && Date.now() - lastUpdateTime > 500) {
      setLocalHeroImages(heroImages);
    }
  }, [heroImages, activeId, lastUpdateTime]);

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = localHeroImages.findIndex((item) => item.id === active.id);
    const newIndex = localHeroImages.findIndex((item) => item.id === over.id);

    // Update local state immediately for better UX
    const reorderedItems = arrayMove(localHeroImages, oldIndex, newIndex).map(
      (item, index) => ({
        ...item,
        order: index + 1,
      })
    );

    // Force React to re-render by clearing and setting
    setLocalHeroImages([]);
    setTimeout(() => {
      setLocalHeroImages(reorderedItems);
    }, 0);

    setLastUpdateTime(Date.now()); // Block sync for 500ms

    // Update order values and call API
    const imageOrders = reorderedItems.map((item) => ({
      id: item.id,
      order: item.order,
    }));

    const success = await onReorder(imageOrders);

    if (!success) {
      // Revert local changes if API call failed
      setLocalHeroImages(heroImages);
    }
  };

  return (
    <div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={localHeroImages.map((img) => img.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {localHeroImages.map((image) => (
              <HeroImageCard
                key={`${image.id}-${image.order}`}
                image={image}
                onEdit={onEdit}
                onDelete={onDelete}
                formatDate={formatDate}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeImage ? (
            <HeroImageCard
              image={activeImage}
              onEdit={onEdit}
              onDelete={onDelete}
              formatDate={formatDate}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
