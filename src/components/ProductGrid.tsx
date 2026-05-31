import { useState, useEffect, useCallback, memo } from "react";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types";
import { useAppDispatch } from "@/store";
import { addToCart } from "@/store/slices/cartSlice";

interface ProductGridProps {
  apiEndpoint: string;
  emptyMessage?: string;
  className?: string;
  layout?: "homepage" | "products";
}

const ProductGrid = memo(function ProductGrid({
  apiEndpoint,
  emptyMessage = "No products available",
  className = "",
  layout = "products",
}: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useAppDispatch();

  // react-doctor-disable-next-line react-doctor/no-fetch-in-effect -- using native fetch inside useEffect is required for this dynamic client-side component
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch(apiEndpoint);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        if (data.success && data.data?.items) {
          setProducts(data.data.items);
        } else {
          setProducts([]);
        }
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    // react-doctor-disable-next-line react-doctor/no-derived-state
    fetchProducts();
  }, [apiEndpoint]);

  const handleAddToCart = useCallback((product: Product) => {
    dispatch(addToCart({ product }));
  }, [dispatch]);

  // Skeleton loading
  if (loading) {
    const skeletonCount = layout === "homepage" ? 6 : 12;
    const gridCols =
      layout === "homepage"
        ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
        : "grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5";

    return (
      <div className={`grid ${gridCols} gap-4 ${className}`}>
        {[...Array(skeletonCount)].map((_, index) => (
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

  // Empty state
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-400 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  // Product grid
  const gridCols =
    layout === "homepage"
      ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
      : "grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5";

  return (
    <div className={`grid ${gridCols} gap-4 ${className}`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={handleAddToCart}
          showAddToCart={true}
        />
      ))}
    </div>
  );
});

export default ProductGrid;
