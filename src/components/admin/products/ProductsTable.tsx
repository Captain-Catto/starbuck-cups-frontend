import {
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Package,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import type { Product } from "@/types";
import { ProductStatusBadge } from "@/components/admin/products/ProductStatusBadge";
import { getFirstProductImage } from "@/lib/utils/image";
import { ConditionalVipBadge } from "@/components/ui/VipBadge";
import { ConditionalFeaturedBadge } from "@/components/ui/FeaturedBadge";
import OptimizedImage from "@/components/OptimizedImage";

interface ProductCategory {
  category: {
    id: string;
    name: string;
  };
}

interface ProductColor {
  color: {
    id: string;
    name: string;
    hexCode: string;
  };
}

interface ProductListItem extends Product {
  isActive: boolean;
  stock: number;
}

interface ProductsTableProps {
  products: ProductListItem[];
  loading: boolean;
  actionLoading: string | null;
  selectedProducts: string[];
  isAllSelected: boolean;
  isIndeterminate: boolean;
  onSelectAll: (checked: boolean) => void;
  onSelectProduct: (productId: string, checked: boolean) => void;
  onEditProduct: (product: ProductListItem) => void;
  onProductAction: (
    productId: string,
    action: "activate" | "deactivate" | "delete"
  ) => void;
  getProductStatus: (product: ProductListItem) => {
    type: "active" | "inactive" | "low-stock" | "out-of-stock";
    label: string;
  };
}


export function ProductsTable({
  products,
  loading,
  actionLoading,
  selectedProducts,
  isAllSelected,
  isIndeterminate,
  onSelectAll,
  onSelectProduct,
  onEditProduct,
  onProductAction,
  getProductStatus,
}: ProductsTableProps) {
  const LoadingSkeleton = () => (
    <>
      {[...Array(10)].map((_, index) => (
        <tr key={index} className="animate-pulse">
          {/* Checkbox column */}
          <td className="px-6 py-4">
            <div className="w-4 h-4 bg-gray-700 rounded"></div>
          </td>
          {/* Image + Product Info column */}
          <td className="px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-700 rounded w-32"></div>
                <div className="h-3 bg-gray-700 rounded w-24"></div>
                <div className="h-3 bg-gray-700 rounded w-20"></div>
              </div>
            </div>
          </td>
          {/* Category column */}
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-700 rounded w-20"></div>
          </td>
          {/* Attributes column */}
          <td className="px-6 py-4">
            <div className="space-y-2">
              <div className="h-3 bg-gray-700 rounded w-16"></div>
              <div className="h-3 bg-gray-700 rounded w-14"></div>
              <div className="h-3 bg-gray-700 rounded w-18"></div>
            </div>
          </td>
          {/* Stock column */}
          <td className="px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="h-4 bg-gray-700 rounded w-8"></div>
              <div className="w-4 h-4 bg-gray-700 rounded"></div>
            </div>
          </td>
          {/* Status column */}
          <td className="px-6 py-4 w-36">
            <div className="h-6 bg-gray-700 rounded-full w-28 mx-auto"></div>
          </td>
          {/* Actions column */}
          <td className="px-6 py-4 text-right">
            <div className="flex items-center justify-end gap-2">
              <div className="w-8 h-8 bg-gray-700 rounded"></div>
              <div className="w-8 h-8 bg-gray-700 rounded"></div>
              <div className="w-8 h-8 bg-gray-700 rounded"></div>
            </div>
          </td>
        </tr>
      ))}
    </>
  );

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isIndeterminate;
                  }}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="rounded border-gray-600 text-gray-500 focus:ring-gray-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Sản phẩm
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Danh mục
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Thuộc tính
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Tồn kho
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-36">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {loading ? (
              <LoadingSkeleton />
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <Package className="w-12 h-12 text-white mx-auto mb-4" />
                  <p className="text-gray-300">Không có sản phẩm nào</p>
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const firstImage = getFirstProductImage(product.productImages);
                return (
                <tr key={product.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={(e) =>
                        onSelectProduct(product.id, e.target.checked)
                      }
                      className="rounded border-gray-600 text-gray-500 focus:ring-gray-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12 relative">
                        {firstImage ? (
                          <OptimizedImage
                            src={firstImage.url}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="h-12 w-12 rounded-lg object-cover"
                            onError={(e) => {
                              // Hide image and show fallback icon on error
                              const target = e.currentTarget;
                              target.style.display = "none";
                              const fallback =
                                target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center"
                          style={{
                            display: firstImage ? "none" : "flex",
                          }}
                        >
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        </div>
                        {/* Featured Badge - TOP LEFT */}
                        <div className="absolute -top-1 -left-1 z-10">
                          <ConditionalFeaturedBadge product={product} size="sm" />
                        </div>
                        {/* VIP Badge - TOP RIGHT */}
                        <div className="absolute -top-1 -right-1 z-10">
                          <ConditionalVipBadge product={product} size="sm" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-300">
                          {product.slug}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-white">
                    <div className="space-y-1">
                      {product.productCategories?.map((pc: ProductCategory) => (
                        <div key={pc.category.id} className="text-xs">
                          {pc.category.name}
                        </div>
                      )) || "No categories"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-white">
                    <div className="space-y-1">
                      {product.productColors?.map((pc: ProductColor) => (
                        <div
                          key={pc.color.id}
                          className="flex items-center gap-2"
                        >
                          <div
                            className="w-3 h-3 rounded-full border"
                            style={{ backgroundColor: pc.color.hexCode }}
                          />
                          <span className="text-xs">{pc.color.name}</span>
                        </div>
                      )) || "No colors"}
                      <div className="text-xs text-gray-300">
                        {product.capacity?.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-white">
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          product.stock <= 1
                            ? "text-gray-300 font-medium"
                            : "text-white"
                        }
                      >
                        {product.stock}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 w-36">
                    <ProductStatusBadge {...getProductStatus(product)} />
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEditProduct(product)}
                        className="text-white hover:bg-gray-700 p-1 rounded transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          const targetAction = product.isActive
                            ? "deactivate"
                            : "activate";
                          onProductAction(product.id, targetAction);
                        }}
                        disabled={actionLoading?.includes(product.id)}
                        className="text-white hover:bg-gray-700 p-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={product.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                      >
                        {actionLoading?.includes(product.id) ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : product.isActive ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => onProductAction(product.id, "delete")}
                        disabled={actionLoading?.includes(product.id)}
                        className="text-white hover:bg-gray-700 p-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Xóa"
                      >
                        {actionLoading?.includes(product.id) ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
