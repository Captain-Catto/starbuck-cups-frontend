"use client";

import { useState } from "react";
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
  const [activeTab, setActiveTab] = useState<"description" | "usage">(
    "description"
  );

  if (loading || !product) {
    return (
      <SkeletonTheme baseColor="#18181b" highlightColor="#27272a">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
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
      {/* Tab Navigation */}
      <div className="border-b border-zinc-800">
        <nav className="flex">
          <button
            onClick={() => setActiveTab("description")}
            className={`px-6 py-4 font-medium transition-colors ${
              activeTab === "description"
                ? "text-white border-b-2 border-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Mô tả sản phẩm
          </button>
          <button
            onClick={() => setActiveTab("usage")}
            className={`px-6 py-4 font-medium transition-colors ${
              activeTab === "usage"
                ? "text-white border-b-2 border-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Hướng dẫn sử dụng
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "description" && (
          <div className="prose max-w-none prose-invert">
            <div
              className="prose-sm text-zinc-300"
              dangerouslySetInnerHTML={{
                __html: product.description || "",
              }}
            />
          </div>
        )}

        {activeTab === "usage" && (
          <div className="prose max-w-none prose-invert">
            <div className="prose-sm text-zinc-300">
              <p>Hướng dẫn sử dụng sản phẩm:</p>
              <ul>
                <li>Rửa sạch trước khi sử dụng lần đầu</li>
                <li>Không sử dụng trong lò vi sóng</li>
                <li>Rửa tay bằng nước ấm và xà phòng</li>
                <li>Không ngâm trong nước quá lâu</li>
                <li>Bảo quản ở nơi khô ráo</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
