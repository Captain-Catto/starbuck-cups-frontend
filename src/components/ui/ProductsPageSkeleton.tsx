import React from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { getResponsiveGridClasses } from "@/utils/layoutCalculator";

const ProductsPageSkeleton: React.FC = () => {
  return (
    <SkeletonTheme baseColor="#27272a" highlightColor="#3f3f46">
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8 lg:px-8 pt-20">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters Skeleton */}
            <div className="lg:w-1/5">
              <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6">
                {/* Filter Header */}
                <div className="mb-6">
                  <Skeleton height={24} width="60%" />
                </div>

                {/* Search */}
                <div className="mb-6">
                  <Skeleton height={16} width="40%" className="mb-2" />
                  <Skeleton height={40} />
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                  <Skeleton height={16} width="30%" className="mb-2" />
                  <Skeleton height={40} />
                </div>

                {/* Color Filter */}
                <div className="mb-6">
                  <Skeleton height={16} width="35%" className="mb-2" />
                  <Skeleton height={40} />
                </div>

                {/* Capacity Filter */}
                <div className="mb-6">
                  <Skeleton height={16} width="40%" className="mb-2" />
                  <Skeleton height={40} />
                </div>

                {/* Sort Options */}
                <div className="mb-6">
                  <Skeleton height={16} width="35%" className="mb-2" />
                  <Skeleton height={40} />
                </div>
              </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="lg:w-full">
              {/* Mobile Filter Button Skeleton */}
              <div className="lg:hidden bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-6">
                <Skeleton height={40} width={100} />
              </div>

              {/* Products Grid Skeleton */}
              <div
                className={getResponsiveGridClasses("products").replace(
                  "gap-4",
                  "gap-6"
                )}
              >
                {Array.from({ length: 20 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-zinc-900 rounded-xl overflow-hidden"
                  >
                    {/* Image skeleton */}
                    <div className="aspect-square">
                      <Skeleton height="100%" />
                    </div>

                    {/* Content skeleton */}
                    <div className="p-4 space-y-2">
                      <Skeleton height={16} />
                      <Skeleton height={12} width="75%" />
                      <Skeleton height={20} width="50%" />
                      <Skeleton height={36} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Skeleton */}
              <div className="flex justify-center mt-8">
                <div className="flex gap-2">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton key={index} height={40} width={40} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SkeletonTheme>
  );
};

export default ProductsPageSkeleton;
