"use client";

import { useState, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { ShoppingCart, ExternalLink } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { addToCart } from "@/store/slices/cartSlice";
import { fetchProductBySlug } from "@/store/slices/productsSlice";
import { toast } from "sonner";
import { PropertyGallery } from "@/components/ui/PropertyGallery";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { trackProductView, trackAddToCart } from "@/lib/analytics";
import { trackProductClick, trackAddToCartClick } from "@/lib/productAnalytics";
import { useLocale, useTranslations } from "next-intl";
import DOMPurify from "isomorphic-dompurify";

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
  const t = useTranslations("productDetail");
  const locale = useLocale();
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
      dispatch(fetchProductBySlug({ slug, locale }));
    } else {
    }
  }, [params.slug, dispatch, hasAttemptedFetch, locale]);

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
      toast.error(t("outOfStockError"), {
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
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_450px] gap-6 lg:gap-8">
          {/* Product Images Skeleton */}
          <div>
            <div className="relative">
              <div className="relative h-[350px] md:h-[500px] lg:h-[600px] w-full bg-zinc-900 rounded-lg overflow-hidden">
                <Skeleton height="100%" />
              </div>
              <div className="px-4 py-2 bg-zinc-800 rounded-lg mt-1">
                <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2">
                  {[...Array(6)].map((_, index) => (
                    <div
                      key={index}
                      className="relative h-16 w-20 md:h-20 md:w-28 flex-shrink-0 rounded-lg overflow-hidden"
                    >
                      <Skeleton height="100%" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Product Info Skeleton */}
          <div className="space-y-6">
            <div className="pb-4 border-b border-zinc-800">
              <Skeleton height={32} width="80%" />
            </div>

            <div className="space-y-5">
              <div>
                <Skeleton height={12} width={60} className="mb-2" />
                <div className="flex gap-2">
                  <Skeleton width={90} height={36} />
                  <Skeleton width={90} height={36} />
                </div>
              </div>
              <div>
                <Skeleton height={12} width={70} className="mb-2" />
                <Skeleton width={100} height={36} />
              </div>
              <div>
                <Skeleton height={12} width={60} className="mb-2" />
                <Skeleton width={90} height={36} />
              </div>
            </div>

            <div className="pt-2">
              <Skeleton height={48} />
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <Skeleton height={12} width={80} className="mb-3" />
              <Skeleton count={3} />
            </div>
          </div>
        </div>
      </SkeletonTheme>
    );
  }

  if (!product) {
    return (
      <div className="text-center text-white py-8">
        <p>{t("notFound")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_450px] gap-6 lg:gap-8">
      {/* Product Images - Sticky on desktop */}
      <div className="lg:sticky lg:top-20 lg:self-start">
        <PropertyGallery
          images={product.productImages?.map((img) => img.url) || []}
          title={product.name}
          isVip={product.isVip}
        />
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        {/* Product Name */}
        <div className="pb-3 border-b border-zinc-800">
          <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-white">{product.name}</h1>
        </div>

        {/* Product Variants - Vertical stack */}
        <div className="space-y-4">
          {/* Colors */}
          {product.productColors && product.productColors.length > 0 && (
            <div>
              <label className="block text-[10px] md:text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                {t("color")}
              </label>
              <div className="flex flex-wrap gap-2">
                {product.productColors.map((pc: ProductColor) => (
                  <button
                    key={pc.color.id}
                    onClick={() => handleColorClick(pc.color.slug)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-800/50 border border-zinc-700 hover:bg-zinc-700 hover:border-zinc-500 rounded-lg transition-all"
                  >
                    <div
                      className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full border border-zinc-500 flex-shrink-0"
                      style={{
                        backgroundColor: pc.color.hexCode || "#000000",
                      }}
                    />
                    <span className="text-xs md:text-sm text-white">{pc.color.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Capacity */}
          {product.capacity && (
            <div>
              <label className="block text-[10px] md:text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                {t("capacity")}
              </label>
              <button
                onClick={() => handleCapacityClick(product.capacity!)}
                className="inline-flex items-center px-2.5 py-1.5 bg-zinc-800/50 border border-zinc-700 rounded-lg hover:bg-zinc-700 hover:border-zinc-500 transition-all"
              >
                <span className="text-xs md:text-sm text-white">
                  {product.capacity.name}
                </span>
              </button>
            </div>
          )}

          {/* Categories */}
          {product.productCategories && product.productCategories.length > 0 && (
            <div>
              <label className="block text-[10px] md:text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                {t("category")}
              </label>
              <div className="flex flex-wrap gap-2">
                {product.productCategories.map((pc: ProductCategory) => (
                  <button
                    key={pc.category.id}
                    onClick={() => handleCategoryClick(pc.category.slug)}
                    className="inline-flex items-center px-2.5 py-1.5 bg-zinc-800/50 border border-zinc-700 rounded-lg hover:bg-zinc-700 hover:border-zinc-500 transition-all"
                  >
                    <span className="text-xs md:text-sm text-white">{pc.category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-2">
          {/* Add to Cart - Full width */}
          <button
            onClick={handleAddToCart}
            disabled={product.stockQuantity === 0}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold text-sm md:text-base transition-colors ${
              product.stockQuantity === 0
                ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                : "bg-white text-black hover:bg-zinc-100"
            }`}
          >
            <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
            {product.stockQuantity === 0 ? t("outOfStock") : t("addToCart")}
          </button>

          {/* Product URL */}
          {product.productUrl && (
            <a
              href={product.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-xs md:text-sm border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              {t("viewClip")}
            </a>
          )}
        </div>

        {/* Description - Integrated */}
        {product.description && (
          <div className="pt-4 border-t border-zinc-800">
            <h3 className="text-xs md:text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              {t("descriptionHeading")}
            </h3>
            <div className="prose prose-sm prose-invert max-w-none">
              <div
                className="text-xs md:text-sm text-zinc-300 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(product.description),
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
