"use client";

import { useState, useEffect } from "react";
import { useParams, notFound, useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { addToCart } from "@/store/slices/cartSlice";
import { fetchProductBySlug } from "@/store/slices/productsSlice";
import { toast } from "sonner";
import { PropertyGallery } from "@/components/ui/PropertyGallery";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { trackProductView, trackAddToCart } from "@/lib/analytics";
import { trackProductClick, trackAddToCartClick } from "@/lib/productAnalytics";

interface ProductColor {
  color: {
    id: string;
    name: string;
    slug: string;
    hexCode: string;
  };
}

interface ProductCategory {
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

export default function ProductInfo() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  // Get product data from Redux store
  const {
    currentProduct: product,
    currentProductLoading: loading,
    currentProductError: error,
  } = useAppSelector((state) => state.products);

  // Debug logs

  // Fetch product data
  useEffect(() => {
    const slug = params.slug;
    if (typeof slug === "string" && !hasAttemptedFetch) {
      setHasAttemptedFetch(true);
      dispatch(fetchProductBySlug(slug));
    } else {
    }
  }, [params.slug, dispatch, hasAttemptedFetch]);

  // Track product view when product is loaded
  useEffect(() => {
    if (product) {
      // GA4 tracking
      trackProductView({
        id: product.id,
        name: product.name,
        category: product.productCategories?.[0]?.category?.name,
      });

      // Product analytics tracking
      trackProductClick({
        id: product.id,
        name: product.name,
        category: product.productCategories?.[0]?.category?.name,
      });
    }
  }, [product]);

  // Show error page if product not found AFTER we tried to fetch
  if (error && !loading && hasAttemptedFetch) {
    notFound();
  }

  const handleAddToCart = () => {
    if (product && product.stockQuantity > 0) {
      console.log("🛒 ADDING PRODUCT TO CART:", {
        productId: product.id,
        productName: product.name,
        capacity: product.capacity,
        categories: product.productCategories?.map((pc) => pc.category),
      });

      // Add to cart without specific color selection
      dispatch(
        addToCart({
          product,
          colorRequest: undefined, // No specific color selected
        })
      );

      // GA4 tracking
      trackAddToCart({
        id: product.id,
        name: product.name,
        category: product.productCategories?.[0]?.category?.name,
      });

      // Product analytics tracking
      trackAddToCartClick({
        id: product.id,
        name: product.name,
        category: product.productCategories?.[0]?.category?.name,
      });

      // Toast will be handled by ClientLayout based on cart lastAction
    } else {
      toast.error("Sản phẩm hiện đã hết hàng", {
        duration: 3000,
      });
    }
  };

  const handleColorClick = (colorSlug: string) => {
    // Navigate to products page with color filter
    router.push(`/products?color=${colorSlug}`);
  };

  // Handle capacity click - navigate to products with capacity filter
  const handleCapacityClick = (capacity: {
    id: string;
    name: string;
    volumeMl: number;
  }) => {
    router.push(
      `/products?minCapacity=${capacity.volumeMl}&maxCapacity=${capacity.volumeMl}`
    );
  };

  // Handle category click - navigate to products with category filter
  const handleCategoryClick = (categorySlug: string) => {
    router.push(`/products?category=${categorySlug}`);
  };

  // Only redirect to 404 if we've attempted fetch and got error, or if no product after successful fetch
  if (!product && !loading && hasAttemptedFetch && !error) {
    return notFound();
  }

  // Show skeleton loading if we haven't attempted fetch yet or if loading
  if (!hasAttemptedFetch || loading) {
    return (
      <SkeletonTheme baseColor="#18181b" highlightColor="#27272a">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Images Skeleton */}
          <div className="space-y-4">
            <div className="relative">
              <div className="relative h-96 w-full bg-zinc-900 rounded-lg overflow-hidden">
                <Skeleton height="100%" />

                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Skeleton circle width={48} height={48} />
                </div>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <Skeleton circle width={48} height={48} />
                </div>

                <div className="absolute bottom-4 right-4">
                  <Skeleton width={60} height={32} />
                </div>

                <div className="absolute bottom-4 left-4">
                  <Skeleton width={140} height={32} />
                </div>
              </div>

              <div className="px-4 py-2 bg-zinc-800 rounded-lg mt-4">
                <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2">
                  {[...Array(10)].map((_, index) => (
                    <div
                      key={index}
                      className={`relative h-16 w-20 md:h-20 md:w-28 flex-shrink-0 rounded-lg overflow-hidden border-2 ${
                        index === 0 ? "border-zinc-400" : "border-zinc-700"
                      }`}
                    >
                      <Skeleton height="100%" />
                    </div>
                  ))}
                </div>

                <div className="flex justify-center mt-3">
                  <Skeleton width={120} height={20} />
                </div>
              </div>
            </div>
          </div>

          {/* Product Info Skeleton */}
          <div className="space-y-6">
            <div>
              <Skeleton height={48} width="80%" className="mb-4" />
            </div>

            <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
              <div>
                <Skeleton height={16} width={60} className="mb-2" />
                <div className="flex items-center gap-3">
                  <Skeleton circle width={32} height={32} />
                  <Skeleton width={80} height={20} />
                </div>
              </div>

              <div>
                <Skeleton height={16} width={70} className="mb-2" />
                <Skeleton width={100} height={36} />
              </div>

              <div>
                <Skeleton height={16} width={60} className="mb-2" />
                <Skeleton width={90} height={24} />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Skeleton height={16} width={60} className="mb-2" />
                <div className="flex items-center gap-3">
                  <Skeleton width={120} height={40} />
                  <Skeleton width={100} height={16} />
                </div>
              </div>

              <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <Skeleton height={48} />
              </div>
            </div>
          </div>
        </div>
      </SkeletonTheme>
    );
  }

  if (!product) {
    return (
      <div className="text-center text-white py-8">
        <p>Không tìm thấy sản phẩm</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Product Images */}
      <div className="space-y-4">
        <PropertyGallery
          images={product.productImages?.map((img) => img.url) || []}
          title={product.name}
          isVip={product.isVip}
        />
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        {/* Basic Info */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">{product.name}</h1>
        </div>

        {/* Product Variants */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Màu sắc
            </label>
            <div className="flex flex-wrap gap-2">
              {product.productColors?.map((pc: ProductColor) => {
                return (
                  <button
                    key={pc.color.id}
                    onClick={() => handleColorClick(pc.color.slug)}
                    className="inline-flex items-center gap-2 px-3 py-2 border bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 rounded-lg transition-all cursor-pointer"
                  >
                    <div
                      className="w-4 h-4 rounded-full border border-zinc-600 flex-shrink-0"
                      style={{
                        backgroundColor: pc.color.hexCode || "#000000",
                      }}
                    />
                    <span className="font-medium text-white">
                      {pc.color.name}
                    </span>
                  </button>
                );
              }) || (
                <span className="text-zinc-400 text-sm">Không xác định</span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Dung tích
            </label>
            {product.capacity ? (
              <button
                onClick={() => handleCapacityClick(product.capacity!)}
                className="inline-flex items-center px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 hover:border-zinc-600 transition-colors cursor-pointer"
              >
                <span className="text-white font-medium">
                  {product.capacity.name}
                </span>
              </button>
            ) : (
              <div className="inline-flex items-center px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg">
                <span className="text-zinc-400 font-medium">
                  Không xác định
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Danh mục
            </label>
            <div className="flex flex-wrap gap-2">
              {product.productCategories?.map((pc: ProductCategory) => (
                <button
                  key={pc.category.id}
                  onClick={() => handleCategoryClick(pc.category.slug)}
                  className="inline-flex items-center px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 hover:border-zinc-600 transition-colors cursor-pointer"
                >
                  <span className="text-white font-medium">
                    {pc.category.name}
                  </span>
                </button>
              )) || (
                <span className="text-zinc-400 text-sm">Không xác định</span>
              )}
            </div>
          </div>
        </div>

        {/* Product URL */}
        {product.productUrl && (
          <div>
            <a
              href={product.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors underline"
            >
              Xem clip sản phẩm
            </a>
          </div>
        )}

        {/* Add to Cart */}
        <div className="space-y-4">
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <button
              onClick={handleAddToCart}
              disabled={product.stockQuantity === 0}
              className={`flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-medium transition-colors ${
                product.stockQuantity === 0
                  ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                  : "bg-white text-black hover:bg-zinc-100"
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              {product.stockQuantity === 0 ? "Hết hàng" : "Thêm vào giỏ tư vấn"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
