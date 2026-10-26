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
    <div className="fixed inset-0 z-50 bg-white sm:flex sm:items-center sm:justify-center sm:bg-zinc-950/60 sm:p-4">
      {/* Full-screen sheet on phones (one scroll area, sticky action bar); centered dialog from sm up. */}
      <div className="h-dvh w-full overflow-y-auto overscroll-contain bg-white sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-lg">
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
