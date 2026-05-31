"use client";

import { MousePointer, ShoppingCart } from "lucide-react";
import { ProductAnalytics } from "@/hooks/admin/useProductAnalytics";
import Link from "next/link";
import { Pagination } from "@/components/ui/Pagination";

interface TopClickedProductsProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  products: ProductAnalytics[];
  loading?: boolean;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return "Chưa có";
  return new Date(dateString).toLocaleDateString("vi-VN");
};

const formatPercentage = (num: number) => {
  return `${num.toFixed(1)}%`;
};

export function TopClickedProducts({
  page,
  totalPages,
  onPageChange,
  products,
  loading,
}: TopClickedProductsProps) {
  const itemsPerPage = 10;

  if (loading) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-medium text-white mb-4">
          Sản phẩm được click nhiều nhất
        </h3>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-16 bg-gray-700 rounded-lg animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-medium text-white mb-4">
          Sản phẩm được click nhiều nhất
        </h3>
        <p className="text-gray-400 text-center py-8">
          Chưa có dữ liệu về sản phẩm được click
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-white">
          Sản phẩm được click nhiều nhất
        </h3>
        <p className="text-sm text-gray-400">{products.length} sản phẩm</p>
      </div>

      <div className="space-y-4">
        {products.map((product, index) => (
          <Link
            key={product.productId}
            href={`/products/${product.productSlug || product.productId}`}
            target="_blank"
            className="flex items-center justify-between p-4 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-800 hover:border-gray-600 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-x-4">
              <div className="flex items-center justify-center size-8 bg-gray-700 text-white rounded-full text-sm font-medium">
                #{(page - 1) * itemsPerPage + index + 1}
              </div>

              <div>
                <h4 className="font-medium text-white truncate max-w-48">
                  {product.productName || `Sản phẩm ${product.productId}`}
                </h4>
                <p className="text-xs text-gray-400">
                  Lần cuối: {formatDate(product.lastClicked)}
                </p>
              </div>
            </div>

            <div className="text-right space-y-1">
              <div className="flex items-center gap-x-4">
                <div className="flex items-center gap-x-1 text-blue-400">
                  <MousePointer className="size-4" />
                  <span className="text-sm font-medium">
                    {product.clickCount}
                  </span>
                </div>

                <div className="flex items-center gap-x-1 text-green-400">
                  <ShoppingCart className="size-4" />
                  <span className="text-sm font-medium">
                    {product.addToCartCount}
                  </span>
                </div>
              </div>

              <div className="text-xs text-gray-400">
                Chuyển đổi: {formatPercentage(product.conversionRate)}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 pt-4 border-t border-gray-700">
          <Pagination
            data={{
              current_page: page,
              total_pages: totalPages,
              has_next: page < totalPages,
              has_prev: page > 1,
              per_page: itemsPerPage,
              total_items: totalPages * itemsPerPage,
            }}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
