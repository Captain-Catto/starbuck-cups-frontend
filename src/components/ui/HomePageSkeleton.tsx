import React from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const HomePageSkeleton: React.FC = () => {
  return (
    <SkeletonTheme baseColor="#27272a" highlightColor="#3f3f46">
      <div className="min-h-screen bg-black text-white pt-12">
        {/* Hero Section Skeleton */}
        <section className="py-8">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[70vh]">
              {/* Left text card skeleton */}
              <div className="bg-zinc-900 rounded-3xl p-8 lg:p-12">
                <Skeleton height={32} width="80%" className="mb-6" />
                <Skeleton height={16} count={3} className="mb-8" />
                <Skeleton height={14} width="30%" />
              </div>

              {/* Right hero card skeleton - spans 2 columns */}
              <div className="lg:col-span-2 bg-zinc-900 rounded-3xl overflow-hidden">
                <div className="aspect-[2/1]">
                  <Skeleton height="100%" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product Section Skeleton */}
        <section className="pt-8 pb-16">
          <div className="container mx-auto px-6">
            {/* Category Tabs Skeleton */}
            <div className="mb-12">
              <div className="flex flex-wrap gap-3">
                <Skeleton height={40} width={80} borderRadius={20} />
                <Skeleton height={40} width={120} borderRadius={20} />
                <Skeleton height={40} width={100} borderRadius={20} />
                <Skeleton height={40} width={110} borderRadius={20} />
                <Skeleton height={40} width={90} borderRadius={20} />
              </div>
            </div>

            {/* Products Grid Skeleton */}
            <div className="space-y-8">
              {Array.from({ length: 6 }).map((_, rowIndex) => (
                <div
                  key={rowIndex}
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
                >
                  {Array.from({ length: 6 }).map((_, productIndex) => (
                    <div
                      key={productIndex}
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
              ))}
            </div>

            {/* View All Button Skeleton */}
            <div className="text-center mt-12">
              <Skeleton height={44} width={180} borderRadius={22} />
            </div>
          </div>
        </section>
      </div>
    </SkeletonTheme>
  );
};

export default HomePageSkeleton;
