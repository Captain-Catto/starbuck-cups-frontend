"use client";

import React, { memo, useSyncExternalStore } from "react";
import { Link } from "@/i18n/routing";
import { ShoppingCart } from "lucide-react";
import { Product } from "@/types";
import { getFirstProductImage, getSecondProductImage } from "@/lib/utils/image";
import { trackProductClick, trackAddToCartClick } from "@/lib/productAnalytics";
import { ConditionalVipBadge } from "@/components/ui/VipBadge";
import { ConditionalFeaturedBadge } from "@/components/ui/FeaturedBadge";
import OptimizedImage from "@/components/OptimizedImage";
import { useTranslations } from "next-intl";

const subscribeToTouchDevice = () => () => {};

const getTouchDeviceSnapshot = () =>
  typeof window !== "undefined" &&
  ("ontouchstart" in window || navigator.maxTouchPoints > 0);

const getServerTouchDeviceSnapshot = () => false;

function useIsTouchDevice() {
  return useSyncExternalStore(
    subscribeToTouchDevice,
    getTouchDeviceSnapshot,
    getServerTouchDeviceSnapshot
  );
}

interface ProductCardProps {
  product: Product;
  animationDelay?: number;
  onAddToCart?: (product: Product) => void;
  showAddToCart?: boolean;
  priority?: boolean;
  imageSizes?: string;
  showSecondaryImage?: boolean;
  showBadges?: boolean;
  showInfo?: boolean;
  highlightText?: string;
}

// react-doctor-disable-next-line react-doctor/no-many-boolean-props -- Stacking flags is required here for granular, high-fidelity custom design control of card variations in different catalog sections.
const ProductCard: React.FC<ProductCardProps> = memo(({
  product,
  animationDelay,
  onAddToCart,
  showAddToCart = false,
  priority = false,
  imageSizes = "(max-width: 640px) calc((100vw - 3rem)/2), (max-width: 768px) calc((100vw - 4rem)/2), (max-width: 1024px) calc((100vw - 5rem)/3), (max-width: 1280px) calc((100vw - 8rem)/4), (max-width: 1536px) calc((100vw - 10rem)/5), calc((100vw - 12rem)/6)",
  showSecondaryImage = true,
  showBadges = true,
  showInfo = true,
  highlightText,
}) => {
  const tProduct = useTranslations("productDetail");
  const isTouch = useIsTouchDevice();


  return (
    <Link
      href={`/products/${product.slug}`}
      className={`group block ${
        animationDelay !== undefined ? "animate-zoom-in" : ""
      }`}
      style={
        animationDelay !== undefined
          ? { animationDelay: `${animationDelay}s` }
          : {}
      }
      onClick={() => {
        // Track product click
        trackProductClick({
          id: product.id,
          name: product.name,
          category: product.productCategories?.[0]?.category?.name,
        });
      }}
    >
      <div className={`bg-black border border-neutral-900 rounded-xl overflow-hidden transition-all duration-300 relative ${
        product.stockQuantity === 0
          ? "opacity-60 grayscale"
          : "hover:border-neutral-700 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/80"
      }`}>
        <div className="aspect-square bg-neutral-950/50 relative overflow-hidden">
          {/* Featured Badge - TOP LEFT */}
          {showBadges && (
            <div className="absolute top-3 left-3 z-10">
              <ConditionalFeaturedBadge product={product} size="md" />
            </div>
          )}

          {/* VIP Badge - TOP RIGHT */}
          {showBadges && (
            <div className="absolute top-3 right-3 z-10">
              <ConditionalVipBadge product={product} size="sm" />
            </div>
          )}

          {product.productImages && product.productImages.length > 0 ? (
            <ProductVisual
              product={product}
              showSecondaryImage={showSecondaryImage}
              isTouch={isTouch}
              priority={priority}
              imageSizes={imageSizes}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <ProductVisual
                product={product}
                showSecondaryImage={showSecondaryImage}
                isTouch={isTouch}
                priority={priority}
                imageSizes={imageSizes}
              />
            </div>
          )}

          {/* Add to Cart Button - Desktop only, shows on hover */}
          {showAddToCart && onAddToCart && (
            <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block">
              <button type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (product.stockQuantity > 0) {
                    // Track add to cart click
                    trackAddToCartClick({
                      id: product.id,
                      name: product.name,
                      category: product.productCategories?.[0]?.category?.name,
                    });
                    onAddToCart(product);
                  }
                }}
                disabled={product.stockQuantity === 0}
                className={`size-10 rounded-full transition-all duration-200 flex items-center justify-center shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  product.stockQuantity === 0
                    ? "bg-zinc-600 text-zinc-400 cursor-not-allowed"
                    : "bg-white text-black hover:bg-black hover:text-white active:scale-90 cursor-pointer"
                }`}
                aria-label={
                  product.stockQuantity === 0
                    ? tProduct("outOfStockAria")
                    : tProduct("addToCartAria")
                }
              >
                <ShoppingCart className="size-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Product info */}
      {showInfo && (
        <div className="mt-3">
          <p
            className={`text-base lg:text-lg font-medium mb-1 line-clamp-2 ${
              product.stockQuantity === 0 ? "text-neutral-400" : "text-white"
            }`}
          >
            <HighlightedName name={product.name} highlight={highlightText} />
          </p>
        </div>
      )}
    </Link>
  );
});

ProductCard.displayName = "ProductCard";

interface HighlightedNameProps {
  name: string;
  highlight?: string;
}

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getHighlightedNameSegments = (name: string, highlight: string) => {
  const segments: Array<{ text: string; start: number; highlighted: boolean }> = [];
  const regex = new RegExp(escapeRegExp(highlight), "gi");
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(name)) !== null) {
    if (match.index > cursor) {
      segments.push({
        text: name.slice(cursor, match.index),
        start: cursor,
        highlighted: false,
      });
    }
    segments.push({
      text: match[0],
      start: match.index,
      highlighted: true,
    });
    cursor = match.index + match[0].length;
  }

  if (cursor < name.length) {
    segments.push({
      text: name.slice(cursor),
      start: cursor,
      highlighted: false,
    });
  }

  return segments;
};

const HighlightedName = memo(({ name, highlight }: HighlightedNameProps) => {
  if (!highlight) return <>{name}</>;
  const segments = getHighlightedNameSegments(name, highlight);
  return (
    <>
      {segments.map((segment) =>
        segment.highlighted ? (
          <span key={`part-${segment.start}-${segment.text}`} className="font-bold text-white underline">
            {segment.text}
          </span>
        ) : (
          segment.text
        )
      )}
    </>
  );
});

HighlightedName.displayName = "HighlightedName";

interface ProductVisualProps {
  product: Product;
  showSecondaryImage: boolean;
  isTouch: boolean;
  priority: boolean;
  imageSizes: string;
}

const ProductVisual: React.FC<ProductVisualProps> = memo(({
  product,
  showSecondaryImage,
  isTouch,
  priority,
  imageSizes,
}) => {
  const firstImage = getFirstProductImage(product.productImages);
  const secondImage = getSecondProductImage(product.productImages);
  const shouldRenderSecondary = showSecondaryImage && !isTouch && !!secondImage;
  
  if (firstImage) {
    return (
      <>
        <OptimizedImage
          src={firstImage.url}
          alt={product.name}
          fill
          width={456}
          className={`object-contain transition-opacity duration-300 ${
            shouldRenderSecondary
              ? "opacity-100 group-hover:opacity-0"
              : "opacity-100"
          }`}
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          sizes={imageSizes}
          quality={50}
          style={{ objectFit: "contain" }}
        />
        {shouldRenderSecondary && secondImage && (
          <OptimizedImage
            src={secondImage.url}
            alt={`${product.name} alternate`}
            fill
            width={456}
            className="object-contain opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            loading="lazy"
            fetchPriority="low"
            sizes={imageSizes}
            quality={50}
            style={{ objectFit: "contain" }}
          />
        )}
      </>
    );
  }

  return (
    <div className="flex items-center justify-center h-full">
      <span className="text-4xl font-light text-white/30">
        {product.name.charAt(0)}
      </span>
    </div>
  );
});

ProductVisual.displayName = "ProductVisual";

export default ProductCard;
