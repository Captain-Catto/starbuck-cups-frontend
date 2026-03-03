"use client";

import type { Product } from "@/types";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface ProductDescriptionProps {
  product: Product | null;
  loading?: boolean;
}

export default function ProductDescription({
  product,
  loading = false,
}: ProductDescriptionProps) {
  if (loading || !product) {
    return (
      <SkeletonTheme baseColor="#18181b" highlightColor="#27272a">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="border-b border-zinc-800">
            <div className="px-6 py-4">
              <Skeleton width={120} height={20} />
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-3">
              <Skeleton count={2} />
            </div>
          </div>
        </div>
      </SkeletonTheme>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
      {/* Header */}
      <div className="border-b border-zinc-800">
        <div className="px-6 py-4">
          <h3 className="text-white font-medium">Mô tả sản phẩm</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="prose max-w-none prose-invert">
          <div
            className="prose-sm text-zinc-300"
            dangerouslySetInnerHTML={{
              __html: product.description || "",
            }}
          />
        </div>
      </div>
    </div>
  );
}
