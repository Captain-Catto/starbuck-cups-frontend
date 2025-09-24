"use client";

import { useEffect } from "react";
import { Product } from "@/types";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store";
import { addToCart } from "@/store/slices/cartSlice";
import { fetchRelatedProducts } from "@/store/slices/productsSlice";
import ProductCard from "@/components/ProductCard";

export default function RelatedProducts() {
  const dispatch = useAppDispatch();

  // Get data from Redux store
  const {
    currentProduct,
    relatedProducts,
    relatedProductsLoading: loading,
  } = useAppSelector((state) => state.products);

  useEffect(() => {
    // Fetch related products when current product is available
    if (currentProduct?.productCategories && currentProduct?.id) {
      const categoryIds = currentProduct.productCategories.map(pc => pc.category.id);
      dispatch(
        fetchRelatedProducts({
          categoryIds,
          currentProductId: currentProduct.id,
          limit: 8,
        })
      );
    }
  }, [currentProduct?.productCategories, currentProduct?.id, dispatch]); // Only depend on specific properties

  const handleAddToCart = (product: Product) => {
    if (product.stockQuantity > 0) {
      dispatch(addToCart({ product, quantity: 1 }));
      toast.success(`Đã thêm ${product.name} vào giỏ hàng`, {
        duration: 3000,
      });
    } else {
      toast.error("Sản phẩm hiện đã hết hàng", {
        duration: 3000,
      });
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, index) => (
          <div
            key={index}
            className="animate-pulse bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden"
          >
            <div className="aspect-square bg-zinc-700"></div>
            <div className="p-4">
              <div className="h-4 bg-zinc-700 rounded mb-2"></div>
              <div className="h-3 bg-zinc-700 rounded mb-3 w-3/4"></div>
              <div className="h-8 bg-zinc-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
      {relatedProducts.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={handleAddToCart}
        />
      ))}
    </div>
  );
}
