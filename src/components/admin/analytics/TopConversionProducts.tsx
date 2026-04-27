"use client";

import { TrendingUp, MousePointer, ShoppingCart } from "lucide-react";
import { ProductAnalytics } from "@/hooks/admin/useProductAnalytics";
import Link from "next/link";
import { Pagination } from "@/components/ui/Pagination";

interface TopConversionProductsProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  products: ProductAnalytics[];
  loading?: boolean;
}

export function TopConversionProducts({
  page,
  totalPages,
  onPageChange,
  products,
  loading,
}: TopConversionProductsProps) {
  const itemsPerPage = 10;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Chưa có";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const getConversionColor = (rate: number) => {
    if (rate >= 50) return "text-green-400";
    if (rate >= 25) return "text-yellow-400";
    return "text-red-400";
  };

  if (loading) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-medium text-white mb-4">
          Sản phẩm chuyển đổi tốt nhất
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
          Sản phẩm chuyển đổi tốt nhất
        </h3>
        <p className="text-gray-400 text-center py-8">
          Chưa có dữ liệu về tỷ lệ chuyển đổi
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-white">
          Sản phẩm chuyển đổi tốt nhất
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
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-8 h-8 bg-gray-700 text-white rounded-full text-sm font-medium">
                #{(page - 1) * itemsPerPage + index + 1}
              </div>

              <div>
                <h4 className="font-medium text-white truncate max-w-48">
                  {product.productName || `Sản phẩm ${product.productId}`}
                </h4>
                <p className="text-xs text-gray-400">
                  Cập nhật: {formatDate(product.lastAddedToCart)}
                </p>
              </div>
            </div>

            <div className="text-right space-y-2">
              <div
                className={`flex items-center space-x-2 ${getConversionColor(
                  product.conversionRate
                )}`}
              >
                <TrendingUp className="w-4 h-4" />
                <span className="text-lg font-bold">
                  {formatPercentage(product.conversionRate)}
                </span>
              </div>

              <div className="flex items-center space-x-4 text-xs text-gray-400">
                <div className="flex items-center space-x-1">
                  <MousePointer className="w-3 h-3" />
                  <span>{product.clickCount}</span>
                </div>

                <div className="flex items-center space-x-1">
                  <ShoppingCart className="w-3 h-3" />
                  <span>{product.addToCartCount}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="text-xs text-gray-400 space-y-1 mb-4">
          <div>🟢 Tỷ lệ cao: ≥50% (Rất tốt)</div>
          <div>🟡 Tỷ lệ trung bình: 25-49% (Có thể cải thiện)</div>
          <div>🔴 Tỷ lệ thấp: &lt;25% (Cần tối ưu)</div>
        </div>
        {totalPages > 1 && (
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
        )}
      </div>
    </div>
  );
}
