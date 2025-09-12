"use client";

import { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import { Product } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useAppDispatch } from "@/store";
import { addToCart } from "@/store/slices/cartSlice";

interface RelatedProductsProps {
  currentProduct: Product;
}

export default function RelatedProducts({
  currentProduct,
}: RelatedProductsProps) {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      setLoading(true);
      try {
        // Fetch products from the same category using the public API (only in stock)
        const response = await fetch(
          `/api/products/public?categoryId=${currentProduct.category.id}&limit=4&inStock=true`
        );
        const data = await response.json();
        console.log("Related products data:", data);

        if (data.success && data.data?.items) {
          // Filter out the current product and limit to 4 items
          const filtered = data.data.items
            .filter((product: Product) => product.id !== currentProduct.id)
            .slice(0, 4);
          setRelatedProducts(filtered);
        }
      } catch (error) {
        console.error("Error fetching related products:", error);
        setRelatedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (currentProduct.category?.id) {
      fetchRelatedProducts();
    }
  }, [currentProduct.category.id, currentProduct.id]);

  const handleAddToCart = (product: Product) => {
    dispatch(addToCart({ product, quantity: 1 }));
    toast.success(`Đã thêm ${product.name} vào giỏ hàng`, {
      duration: 3000,
    });
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Có Thể Bạn Thích
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="animate-pulse bg-gray-50 rounded-lg overflow-hidden"
              >
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-3 w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <section className="px-15 py-4 bg-white">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Có Thể Bạn Thích
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedProducts.map((product) => (
            <div
              key={product.id}
              className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-shadow group"
            >
              <Link href={`/products/${product.slug}`}>
                <div className="aspect-square bg-gray-200 overflow-hidden">
                  <Image
                    src={product.images[0] || "/images/placeholder-product.jpg"}
                    alt={product.name}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Link>

              <div className="p-4">
                <Link href={`/products/${product.slug}`}>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-green-600 transition-colors">
                    {product.name}
                  </h3>
                </Link>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {product.description}
                </p>

                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: product.color.hexCode }}
                  />
                  <span className="text-sm text-gray-600">
                    {product.color.name}
                  </span>
                  <span className="text-sm text-gray-400">•</span>
                  <span className="text-sm text-gray-600">
                    {product.capacity.name}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">
                    {product.category.name}
                  </span>
                </div>

                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stockQuantity === 0}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {product.stockQuantity === 0 ? "Hết hàng" : "Thêm vào giỏ"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
