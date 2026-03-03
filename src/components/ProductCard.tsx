"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Product } from "@/types";
import { getFirstProductImage, getSecondProductImage } from "@/lib/utils/image";
import { trackProductClick, trackAddToCartClick } from "@/lib/productAnalytics";
import { ConditionalVipBadge } from "@/components/ui/VipBadge";
import { ConditionalFeaturedBadge } from "@/components/ui/FeaturedBadge";
import OptimizedImage from "@/components/OptimizedImage";

interface ProductCardProps {
  product: Product;
  animationDelay?: number;
  onAddToCart?: (product: Product) => void;
  showAddToCart?: boolean;
  priority?: boolean; // Thêm prop để control priority cho LCP
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  animationDelay,
  onAddToCart,
  showAddToCart = false,
  priority = false, // Thêm prop để control priority cho LCP
}) => {
  const [isInView, setIsInView] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Intersection Observer để lazy load second image khi card vào viewport
  useEffect(() => {
    if (!cardRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          // Unobserve sau khi đã vào viewport 1 lần
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px', // Preload 100px trước khi vào viewport
        threshold: 0.1,
      }
    );

    observer.observe(cardRef.current);

    return () => observer.disconnect();
  }, []);
  const renderProductVisual = () => {
    const firstImage = getFirstProductImage(product.productImages);
    const secondImage = getSecondProductImage(product.productImages);
    if (firstImage) {
      return (
        <>
          <OptimizedImage
            src={firstImage.url}
            alt={product.name}
            fill
            width={600} // Hint for API: 300px display x2 for retina
            className={`object-contain transition-opacity duration-300 ${
              secondImage ? "opacity-100 group-hover:opacity-0" : "opacity-100"
            }`}
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 300px"
            quality={70}
            style={{ objectFit: "contain" }}
          />
          {secondImage && (priority || isInView) && (
            <OptimizedImage
              src={secondImage.url}
              alt={`${product.name} alternate`}
              fill
              width={600} // Hint for API: 300px display x2 for retina
              className="object-contain opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              loading="eager"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 300px"
              quality={70}
              style={{ objectFit: "contain" }}
            />
          )}
        </>
      );
    }

    // Simple fallback when no images
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-4xl font-light text-white/30">
          {product.name.charAt(0)}
        </span>
      </div>
    );
  };

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
      <div ref={cardRef} className="bg-zinc-900 rounded-2xl overflow-hidden hover:bg-zinc-800 transition-colors duration-300 relative">
        <div className="aspect-square bg-gradient-to-br from-zinc-800 to-zinc-900 relative overflow-hidden">
          {/* Featured Badge - TOP LEFT */}
          <div className="absolute top-3 left-3 z-10">
            <ConditionalFeaturedBadge product={product} size="md" />
          </div>

          {/* VIP Badge - TOP RIGHT */}
          <div className="absolute top-3 right-3 z-10">
            <ConditionalVipBadge product={product} size="sm" />
          </div>

          {product.productImages && product.productImages.length > 0 ? (
            renderProductVisual()
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              {renderProductVisual()}
            </div>
          )}

          {/* Add to Cart Button - Desktop only, shows on hover */}
          {showAddToCart && onAddToCart && (
            <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block">
              <button
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
                className={`w-10 h-10 rounded-full transition-colors duration-200 flex items-center justify-center shadow-lg ${
                  product.stockQuantity === 0
                    ? "bg-zinc-600 text-zinc-400 cursor-not-allowed"
                    : "bg-white text-black hover:bg-black hover:text-white"
                }`}
                aria-label={
                  product.stockQuantity === 0 ? "Out of stock" : "Add to cart"
                }
              >
                <ShoppingCart className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Product info */}
      <div className="mt-3">
        <h3
          className={`text-sm font-medium mb-1 line-clamp-2 ${
            product.stockQuantity === 0 ? "text-zinc-400" : "text-white"
          }`}
        >
          {product.name}
        </h3>
        {/* <div className="text-xs text-zinc-500 font-mono mb-1">
          {product.productCategories
            ?.map((pc: { category: { name: string } }) => pc.category.name)
            .join(", ") || "N/A"}{" "}
          - {product.capacity?.name || "chưa có"}
        </div>
        {product.stockQuantity === 0 && (
          <div className="flex items-center">
            <span className="text-xs text-zinc-400">Hết hàng</span>
          </div>
        )} */}
      </div>
    </Link>
  );
};

export default ProductCard;
