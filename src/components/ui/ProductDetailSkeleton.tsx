import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function ProductDetailSkeleton() {
  return (
    <SkeletonTheme baseColor="#18181b" highlightColor="#27272a">
      <div className="min-h-screen bg-black text-white">
        {/* Header Skeleton */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-zinc-800">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-13">
              <Skeleton width={120} height={32} />
              <div className="flex items-center gap-4">
                <Skeleton width={60} height={40} />
              </div>
            </div>
          </div>
        </div>

        {/* Breadcrumb Skeleton */}
        <div className="pt-12">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-2 text-sm">
              <Skeleton width={60} height={16} />
              <span className="text-zinc-600">/</span>
              <Skeleton width={70} height={16} />
              <span className="text-zinc-600">/</span>
              <Skeleton width={100} height={16} />
            </div>
          </div>
        </div>

        {/* Product Detail Content */}
        <div className="grid grid-cols-1 lg:gap-6">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Product Images Skeleton */}
              <div className="space-y-4">
                {/* Main Image Gallery */}
                <div className="relative">
                  <div className="relative h-96 w-full bg-zinc-900 rounded-lg overflow-hidden">
                    <Skeleton height="100%" />

                    {/* Navigation Buttons */}
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <Skeleton circle width={48} height={48} />
                    </div>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <Skeleton circle width={48} height={48} />
                    </div>

                    {/* Image Counter */}
                    <div className="absolute bottom-4 right-4">
                      <Skeleton width={60} height={32} />
                    </div>

                    {/* Zoom Indicator */}
                    <div className="absolute bottom-4 left-4">
                      <Skeleton width={140} height={32} />
                    </div>
                  </div>

                  {/* Thumbnail Bar */}
                  <div className="px-4 py-2 bg-zinc-800 rounded-lg">
                    <div className="flex gap-2 md:gap-3 pb-2">
                      {[...Array(5)].map((_, index) => (
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

                    {/* View All Button */}
                    <div className="flex justify-center mt-3">
                      <Skeleton width={120} height={20} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Info Skeleton */}
              <div className="space-y-6">
                {/* Title and Basic Info */}
                <div>
                  <Skeleton height={48} width="80%" className="mb-4" />
                </div>

                {/* Product Variants */}
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

                {/* Quantity and Add to Cart */}
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
          </div>

          {/* Bottom Section - Description and Related Products */}
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 sm:gap-4 lg:gap-6">
              {/* Product Description Skeleton */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
                {/* Tab Navigation */}
                <div className="border-b border-zinc-800">
                  <nav className="flex">
                    <div className="px-6 py-4">
                      <Skeleton width={120} height={20} />
                    </div>
                    <div className="px-6 py-4">
                      <Skeleton width={140} height={20} />
                    </div>
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  <div className="space-y-3">
                    <Skeleton count={2} />
                  </div>
                </div>
              </div>

              {/* Related Products Skeleton */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <Skeleton height={24} width={150} className="mb-6" />

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="space-y-3">
                      <div className="aspect-square bg-zinc-800 rounded-lg overflow-hidden">
                        <Skeleton height="100%" />
                      </div>
                      <Skeleton height={20} />
                      <Skeleton height={16} width="60%" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SkeletonTheme>
  );
}
