"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import { useLowStock } from "@/hooks/admin/useLowStock";

export function LowStockAlert() {
  const { products, pagination, loading, error, handlePageChange } = useLowStock({
    limit: 12,
    threshold: 10,
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <AlertTriangle className="h-5 w-5 mr-2 text-gray-400" />
            Sản phẩm sắp hết hàng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="p-4 border border-gray-700 rounded-lg bg-gray-800 animate-pulse"
              >
                <div className="h-5 bg-gray-700 rounded mb-2 w-3/4"></div>
                <div className="h-4 bg-gray-700 rounded mb-3 w-1/2"></div>
                <div className="h-6 bg-gray-700 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <AlertTriangle className="h-5 w-5 mr-2 text-gray-400" />
            Sản phẩm sắp hết hàng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-400 text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <AlertTriangle className="h-5 w-5 mr-2 text-gray-400" />
            Sản phẩm sắp hết hàng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-sm">
            Không có sản phẩm nào sắp hết hàng
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <AlertTriangle className="h-5 w-5 mr-2 text-gray-400" />
          Sản phẩm sắp hết hàng ({pagination?.total_items || 0})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="p-4 border border-gray-700 rounded-lg bg-gray-800"
            >
              <h4 className="font-medium text-white">{product.name}</h4>
              <p className="text-sm text-gray-400">{product.capacity.name}</p>
              <p className="text-lg font-bold text-red-400 mt-2">
                Còn lại: {product.stockQuantity}
              </p>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div className="flex justify-center pt-4">
            <Pagination data={pagination} onPageChange={handlePageChange} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
