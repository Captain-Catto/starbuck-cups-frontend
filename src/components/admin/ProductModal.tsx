"use client";

import type { Product, Category, Color, Capacity } from "@/types";
import { UpdateProductForm } from "./UpdateProductForm";
import { CreateProductForm } from "./CreateProductForm";

// Extended product type for admin operations
interface AdminProduct extends Omit<Product, "stockQuantity"> {
  stockQuantity?: number;
  productUrl?: string;
  isVip?: boolean;
  isFeatured?: boolean;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: AdminProduct | null;
  categories: Category[];
  colors: Color[];
  capacities: Capacity[];
}

export default function ProductModal({
  isOpen,
  onClose,
  onSuccess,
  product,
  categories,
  colors,
  capacities,
}: ProductModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-zinc-950 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {product ? (
          <UpdateProductForm
            productId={product.id}
            onCancel={onClose}
            onSuccess={() => {
              onSuccess?.();
              onClose();
            }}
            categories={Array.isArray(categories) ? categories : []}
            colors={Array.isArray(colors) ? colors : []}
            capacities={Array.isArray(capacities) ? capacities : []}
          />
        ) : (
          <CreateProductForm
            onCancel={onClose}
            onSuccess={() => {
              onSuccess?.();
              onClose();
            }}
            categories={Array.isArray(categories) ? categories : []}
            colors={Array.isArray(colors) ? colors : []}
            capacities={Array.isArray(capacities) ? capacities : []}
          />
        )}
      </div>
    </div>
  );
}
