import { OrderItem } from "@/types/orders";
import { ProductOrderItem } from "./ProductOrderItem";
import { ProductSearchControls, UpdateItemHandler } from "./types";

export function ProductItemsSection({
  items,
  errors,
  search,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
}: {
  items: OrderItem[];
  errors: Record<string, string>;
  search: ProductSearchControls;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onUpdateItem: UpdateItemHandler;
}) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <ProductOrderItem
          key={item.key || index}
          item={item}
          index={index}
          itemCount={items.length}
          errors={errors}
          search={search}
          onRemoveItem={onRemoveItem}
          onUpdateItem={onUpdateItem}
        />
      ))}

      <button
        type="button"
        onClick={onAddItem}
        className="w-full p-3 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
      >
        + Thêm sản phẩm
      </button>

      {errors.items && <p className="text-sm text-red-400">{errors.items}</p>}
    </div>
  );
}
