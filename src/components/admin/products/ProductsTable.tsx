import { memo, useMemo } from "react";
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
    slug: string;
  };
}

interface ProductColor {
  color: {
    id: string;
    name: string;
    hexCode: string;
    slug: string;
  };
}

interface ProductListItem extends Product {
  isActive: boolean;
  stock: number;
}

interface ProductStatus {
  type: "active" | "inactive" | "low-stock" | "out-of-stock";
  label: string;
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
  getProductStatus: (product: ProductListItem) => ProductStatus;
  onCategoryClick?: (categorySlug: string) => void;
  onColorClick?: (colorSlug: string) => void;
  onCapacityClick?: (volumeMl: number) => void;
}

const LoadingSkeleton = memo(function LoadingSkeleton() {
  return (
    <tr>
      <td colSpan={7} className="px-6 py-12 text-center text-gray-300">
        <Loader2 className="size-6 animate-spin mx-auto mb-3" aria-hidden="true" />
        Đang tải sản phẩm…
      </td>
    </tr>
  );
});

interface ProductRowProps {
  product: ProductListItem;
  status: ProductStatus;
  isSelected: boolean;
  rowActionLoading: boolean;
  onSelectProduct: (productId: string, checked: boolean) => void;
  onEditProduct: (product: ProductListItem) => void;
  onProductAction: (
    productId: string,
    action: "activate" | "deactivate" | "delete"
  ) => void;
  onCategoryClick?: (categorySlug: string) => void;
  onColorClick?: (colorSlug: string) => void;
  onCapacityClick?: (volumeMl: number) => void;
}

const ProductRow = memo(
  function ProductRow({
    product,
    status,
    isSelected,
    rowActionLoading,
    onSelectProduct,
    onEditProduct,
    onProductAction,
    onCategoryClick,
    onColorClick,
    onCapacityClick,
  }: ProductRowProps) {
    const firstImage = getFirstProductImage(product.productImages);

    return (
      <tr className="hover:bg-gray-700">
        <td className="px-6 py-4">
          <input aria-label={`Select ${product.name}`}
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelectProduct(product.id, e.target.checked)}
            className="rounded border-gray-600 text-gray-500 focus:ring-gray-500"
          />
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 size-12 relative">
              {firstImage ? (
                <OptimizedImage
                  src={firstImage.url}
                  alt={product.name}
                  width={48}
                  height={48}
                  className="size-12 rounded-lg object-cover"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = "none";
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className="size-12 rounded-lg bg-gray-200 flex items-center justify-center"
                style={{
                  display: firstImage ? "none" : "flex",
                }}
              >
                <ImageIcon className="size-6 text-gray-400" />
              </div>
              <div className="absolute -top-1 -left-1 z-10 pointer-events-none">
                <ConditionalFeaturedBadge product={product} size="xs" />
              </div>
              <div className="absolute -top-1 -right-1 z-10 pointer-events-none">
                <ConditionalVipBadge product={product} size="xs" />
              </div>
            </div>
            <div className="ml-4">
              <button type="button"
                onClick={() => onEditProduct(product)}
                className="text-sm font-medium text-white hover:text-green-400 hover:underline transition-colors text-left cursor-pointer"
              >
                {product.name}
              </button>
              <div className="text-sm text-gray-300">{product.slug}</div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 text-sm text-white">
          <div className="space-y-1">
            {product.productCategories?.map((pc: ProductCategory) => (
              <button
                type="button"
                key={pc.category.id}
                onClick={() => onCategoryClick?.(pc.category.slug)}
                className="block text-xs text-left hover:text-blue-400 hover:underline transition-colors cursor-pointer"
                title={`Lọc theo: ${pc.category.name}`}
              >
                {pc.category.name}
              </button>
            )) || <span className="text-gray-400 text-xs">-</span>}
          </div>
        </td>
        <td className="px-6 py-4 text-sm text-white">
          <div className="space-y-1">
            {product.productColors?.map((pc: ProductColor) => (
              <button
                type="button"
                key={pc.color.id}
                onClick={() => onColorClick?.(pc.color.slug)}
                className="flex items-center gap-2 text-left hover:text-blue-400 hover:underline transition-colors cursor-pointer"
                title={`Lọc theo: ${pc.color.name}`}
              >
                <div
                  className="size-3 rounded-full border flex-shrink-0"
                  style={{ backgroundColor: pc.color.hexCode }}
                />
                <span className="text-xs">{pc.color.name}</span>
              </button>
            )) || "No colors"}
            {product.capacity ? (
              <button
                type="button"
                onClick={() => onCapacityClick?.(product.capacity!.volumeMl)}
                className="text-xs text-gray-300 text-left hover:text-blue-400 hover:underline transition-colors cursor-pointer"
                title={`Lọc theo: ${product.capacity.name}`}
              >
                {product.capacity.name}
              </button>
            ) : null}
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
          <ProductStatusBadge {...status} />
        </td>
        <td className="px-6 py-4 text-right text-sm font-medium">
          <div className="flex items-center justify-end gap-2">
            <button type="button"
              onClick={() => onEditProduct(product)}
              className="text-white hover:bg-gray-700 p-1 rounded transition-colors cursor-pointer"
              aria-label="Chỉnh sửa"
            >
              <Edit className="size-4" />
            </button>
            <button type="button"
              onClick={() => {
                const targetAction = product.isActive ? "deactivate" : "activate";
                onProductAction(product.id, targetAction);
              }}
              disabled={rowActionLoading}
              className="text-white hover:bg-gray-700 p-1 rounded transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={product.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
            >
              {rowActionLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : product.isActive ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
            <button type="button"
              onClick={() => onProductAction(product.id, "delete")}
              disabled={rowActionLoading}
              className="text-white hover:bg-gray-700 p-1 rounded transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Xóa"
            >
              {rowActionLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
            </button>
          </div>
        </td>
      </tr>
    );
  },
  (prev, next) => {
    return (
      prev.product === next.product &&
      prev.isSelected === next.isSelected &&
      prev.rowActionLoading === next.rowActionLoading &&
      prev.status.type === next.status.type &&
      prev.status.label === next.status.label
    );
  }
);

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
  onCategoryClick,
  onColorClick,
  onCapacityClick,
}: ProductsTableProps) {
  const selectedProductIds = useMemo(
    () => new Set(selectedProducts),
    [selectedProducts]
  );

  const activeActionProductId = useMemo(() => {
    if (!actionLoading) {
      return null;
    }

    const [_, ...productIdParts] = actionLoading.split("-");
    return productIdParts.join("-") || null;
  }, [actionLoading]);

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left">
                <input aria-label="Select all products"
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
                  <Package className="size-12 text-white mx-auto mb-4" />
                  <p className="text-gray-300">Không có sản phẩm nào</p>
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const status = getProductStatus(product);
                return (
                  <ProductRow
                    key={product.id}
                    product={product}
                    status={status}
                    isSelected={selectedProductIds.has(product.id)}
                    rowActionLoading={activeActionProductId === product.id}
                    onSelectProduct={onSelectProduct}
                    onEditProduct={onEditProduct}
                    onProductAction={onProductAction}
                    onCategoryClick={onCategoryClick}
                    onColorClick={onColorClick}
                    onCapacityClick={onCapacityClick}
                  />
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
