import React from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface ProductSkeletonProps {
  count?: number;
  layout?: "homepage" | "products"; // New prop for different layouts
}

const ProductSkeleton: React.FC<ProductSkeletonProps> = ({
  count = 6,
  layout = "homepage",
}) => {
  const gridClasses =
    layout === "products"
      ? "grid gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
      : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4";

  return (
    <SkeletonTheme baseColor="#27272a" highlightColor="#3f3f46">
      <div className={gridClasses}>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="bg-zinc-900 rounded-xl overflow-hidden">
            {/* Image skeleton */}
            <div className="aspect-square">
              <Skeleton height="100%" />
            </div>

            {/* Content skeleton */}
            <div className="p-4 space-y-2">
              {/* Title skeleton */}
              <Skeleton height={16} />
              <Skeleton height={12} width="75%" />

              {/* Price skeleton */}
              <Skeleton height={20} width="50%" />

              {/* Button skeleton */}
              <Skeleton height={36} />
            </div>
          </div>
        ))}
      </div>
    </SkeletonTheme>
  );
};

export default ProductSkeleton;
