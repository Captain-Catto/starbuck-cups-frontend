import { memo, useMemo } from "react";
import {
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Package,
  Image as ImageIcon,
  Loader2,
  Pin,
  PinOff,
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
  onTogglePin: (productId: string) => void;
  getProductStatus: (product: ProductListItem) => ProductStatus;
  onCategoryClick?: (categorySlug: string) => void;
  onColorClick?: (colorSlug: string) => void;
  onCapacityClick?: (volumeMl: number) => void;
}

// Same look as the route's loading.tsx skeleton, so the page does not swap loading styles
const SKELETON_ROWS = 8;

const LoadingSkeleton = memo(function LoadingSkeleton() {
  return (
    <>
      {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          <td colSpan={7} className="h-16 border-b border-gray-700" aria-hidden="true" />
        </tr>
      ))}
      <tr>
        <td colSpan={7} className="sr-only" role="status">
          Đang tải sản phẩm…
        </td>
      </tr>
    </>
  );
});

function PinnedBadge() {
  return (
    <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-yellow-400/15 px-2 py-0.5 text-xs font-medium text-yellow-400">
      <Pin className="size-3" aria-hidden="true" />
      Đã ghim
    </span>
  );
}

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
  onTogglePin: (productId: string) => void;
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
    onTogglePin,
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
              {product.pinnedAt && <PinnedBadge />}
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
              onClick={() => onTogglePin(product.id)}
              disabled={rowActionLoading}
              className={`hover:bg-gray-700 p-1 rounded transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${product.pinnedAt ? "text-yellow-400" : "text-white"}`}
              aria-label={product.pinnedAt ? "Bỏ ghim" : "Ghim lên đầu"}
              title={product.pinnedAt ? "Bỏ ghim" : "Ghim lên đầu"}
            >
              {product.pinnedAt ? <PinOff className="size-4" /> : <Pin className="size-4" />}
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

interface ProductCardProps extends ProductRowProps {}

/** Phone layout: one compact card per product instead of a 7-column table row. */
const ProductCard = memo(function ProductCard({
  product,
  status,
  isSelected,
  rowActionLoading,
  onSelectProduct,
  onEditProduct,
  onProductAction,
  onTogglePin,
  onCategoryClick,
}: ProductCardProps) {
  const firstImage = getFirstProductImage(product.productImages);
  const categories = product.productCategories ?? [];
  const colors = product.productColors ?? [];

  return (
    <li className="p-3">
      <div className="flex gap-3">
        <label className="flex shrink-0 items-start pt-1">
          <input
            aria-label={`Select ${product.name}`}
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelectProduct(product.id, e.target.checked)}
            className="size-5 rounded border-gray-600 text-gray-500 focus:ring-gray-500"
          />
        </label>

        <button
          type="button"
          onClick={() => onEditProduct(product)}
          className="relative size-16 shrink-0 cursor-pointer"
          aria-label={`Chỉnh sửa ${product.name}`}
        >
          {firstImage ? (
            <OptimizedImage
              src={firstImage.url}
              alt={product.name}
              width={64}
              height={64}
              className="size-16 rounded-lg object-cover"
            />
          ) : (
            <div className="flex size-16 items-center justify-center rounded-lg bg-gray-700">
              <ImageIcon className="size-6 text-gray-400" />
            </div>
          )}
          <div className="pointer-events-none absolute -left-1 -top-1 z-10">
            <ConditionalFeaturedBadge product={product} size="xs" />
          </div>
          <div className="pointer-events-none absolute -right-1 -top-1 z-10">
            <ConditionalVipBadge product={product} size="xs" />
          </div>
        </button>

        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => onEditProduct(product)}
            className="line-clamp-2 cursor-pointer text-left text-sm font-medium text-white"
          >
            {product.name}
          </button>
          {product.pinnedAt && <PinnedBadge />}
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-300">
            {categories.slice(0, 2).map((pc: ProductCategory) => (
              <button
                type="button"
                key={pc.category.id}
                onClick={() => onCategoryClick?.(pc.category.slug)}
                className="rounded bg-gray-700 px-1.5 py-0.5"
              >
                {pc.category.name}
              </button>
            ))}
            {product.capacity ? <span>{product.capacity.name}</span> : null}
          </div>
          {colors.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {colors.map((pc: ProductColor) => (
                <span
                  key={pc.color.id}
                  title={pc.color.name}
                  className="size-4 rounded-full border border-gray-500"
                  style={{ backgroundColor: pc.color.hexCode }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 pl-8">
        <div className="flex items-center gap-3">
          <ProductStatusBadge {...status} />
          <span
            className={`text-xs ${
              product.stock <= 1 ? "text-gray-300 font-medium" : "text-white"
            }`}
          >
            Tồn: {product.stock}
          </span>
        </div>
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => onEditProduct(product)}
            className="flex size-11 cursor-pointer items-center justify-center rounded-lg text-white active:bg-gray-700"
            aria-label="Chỉnh sửa"
          >
            <Edit className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => onTogglePin(product.id)}
            disabled={rowActionLoading}
            className={`flex size-11 cursor-pointer items-center justify-center rounded-lg active:bg-gray-700 disabled:opacity-50 ${product.pinnedAt ? "text-yellow-400" : "text-white"}`}
            aria-label={product.pinnedAt ? "Bỏ ghim" : "Ghim lên đầu"}
          >
            {product.pinnedAt ? <PinOff className="size-5" /> : <Pin className="size-5" />}
          </button>
          <button
            type="button"
            onClick={() =>
              onProductAction(product.id, product.isActive ? "deactivate" : "activate")
            }
            disabled={rowActionLoading}
            className="flex size-11 cursor-pointer items-center justify-center rounded-lg text-white active:bg-gray-700 disabled:opacity-50"
            aria-label={product.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
          >
            {rowActionLoading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : product.isActive ? (
              <EyeOff className="size-5" />
            ) : (
              <Eye className="size-5" />
            )}
          </button>
          <button
            type="button"
            onClick={() => onProductAction(product.id, "delete")}
            disabled={rowActionLoading}
            className="flex size-11 cursor-pointer items-center justify-center rounded-lg text-white active:bg-gray-700 disabled:opacity-50"
            aria-label="Xóa"
          >
            <Trash2 className="size-5" />
          </button>
        </div>
      </div>
    </li>
  );
});

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
  onTogglePin,
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

  const mobileList = loading ? (
    <div className="animate-pulse" role="status">
      <span className="sr-only">Đang tải sản phẩm…</span>
      {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
        <div key={i} className="h-20 border-b border-gray-700" aria-hidden="true" />
      ))}
    </div>
  ) : products.length === 0 ? (
    <div className="px-4 py-12 text-center">
      <Package className="mx-auto mb-4 size-12 text-white" />
      <p className="text-gray-300">Không có sản phẩm nào</p>
    </div>
  ) : (
    <>
      <label className="flex items-center gap-3 border-b border-gray-700 bg-gray-700 px-4 py-3 text-sm text-white">
        <input
          aria-label="Select all products"
          type="checkbox"
          checked={isAllSelected}
          ref={(el) => {
            if (el) el.indeterminate = isIndeterminate;
          }}
          onChange={(e) => onSelectAll(e.target.checked)}
          className="size-5 rounded border-gray-600 text-gray-500 focus:ring-gray-500"
        />
        Chọn tất cả
      </label>
      <ul className="divide-y divide-gray-700">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            status={getProductStatus(product)}
            isSelected={selectedProductIds.has(product.id)}
            rowActionLoading={activeActionProductId === product.id}
            onSelectProduct={onSelectProduct}
            onEditProduct={onEditProduct}
            onProductAction={onProductAction}
            onTogglePin={onTogglePin}
            onCategoryClick={onCategoryClick}
            onColorClick={onColorClick}
            onCapacityClick={onCapacityClick}
          />
        ))}
      </ul>
    </>
  );

  return (
    <div className="overflow-hidden rounded-lg border border-gray-700 bg-gray-800">
      <div className="lg:hidden">{mobileList}</div>
      <div className="hidden overflow-x-auto lg:block">
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
            onTogglePin={onTogglePin}
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
