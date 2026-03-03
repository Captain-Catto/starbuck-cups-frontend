import { Product } from "@/types";

/**
 * Check if a product is VIP
 */
export function isVipProduct(product: Pick<Product, "isVip">): boolean {
  return Boolean(product.isVip);
}

/**
 * Filter VIP products from array
 */
export function filterVipProducts(products: Product[]): Product[] {
  return products.filter(isVipProduct);
}

/**
 * Filter non-VIP products from array
 */
export function filterRegularProducts(products: Product[]): Product[] {
  return products.filter((product) => !isVipProduct(product));
}

/**
 * Sort products with VIP products first
 */
export function sortWithVipFirst(products: Product[]): Product[] {
  return [...products].sort((a, b) => {
    // VIP products come first
    if (isVipProduct(a) && !isVipProduct(b)) return -1;
    if (!isVipProduct(a) && isVipProduct(b)) return 1;
    return 0;
  });
}

/**
 * Count VIP products in array
 */
export function countVipProducts(products: Product[]): number {
  return products.filter(isVipProduct).length;
}

/**
 * Get VIP badge class names based on context
 */
export function getVipBadgeClasses(
  variant: "default" | "minimal" | "outline" = "default"
): string {
  const baseClasses =
    "inline-flex items-center gap-1 rounded-full font-semibold transition-all duration-200";

  const variants = {
    default:
      "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-md hover:shadow-lg",
    minimal: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    outline:
      "border-2 border-yellow-500 text-yellow-600 bg-transparent hover:bg-yellow-50",
  };

  return `${baseClasses} ${variants[variant]}`;
}

/**
 * VIP product analytics helper
 */
export function getVipProductStats(products: Product[]) {
  const total = products.length;
  const vipCount = countVipProducts(products);
  const regularCount = total - vipCount;
  const vipPercentage = total > 0 ? Math.round((vipCount / total) * 100) : 0;

  return {
    total,
    vipCount,
    regularCount,
    vipPercentage,
    hasVipProducts: vipCount > 0,
  };
}

/**
 * Generate VIP product summary text
 */
export function getVipSummaryText(products: Product[]): string {
  const stats = getVipProductStats(products);

  if (stats.vipCount === 0) {
    return "Không có sản phẩm VIP";
  }

  if (stats.vipCount === 1) {
    return "1 sản phẩm VIP";
  }

  return `${stats.vipCount} sản phẩm VIP (${stats.vipPercentage}%)`;
}

/**
 * Search products with VIP priority
 * VIP products matching the query will appear first
 */
export function searchProductsWithVipPriority(
  products: Product[],
  query: string,
  searchFields: Array<keyof Product> = ["name", "description"]
): Product[] {
  const normalizedQuery = query.toLowerCase().trim();

  if (!normalizedQuery) {
    return sortWithVipFirst(products);
  }

  const matchingProducts = products.filter((product) => {
    return searchFields.some((field) => {
      const value = product[field];
      return (
        typeof value === "string" &&
        value.toLowerCase().includes(normalizedQuery)
      );
    });
  });

  return sortWithVipFirst(matchingProducts);
}

/**
 * Format VIP status for display
 */
export function formatVipStatus(isVip: boolean): string {
  return isVip ? "VIP" : "Thường";
}

/**
 * Get VIP icon emoji
 */
export function getVipIcon(): string {
  return "⭐";
}

/**
 * Check if product should show VIP badge in different contexts
 */
export function shouldShowVipBadge(
  product: Product,
  context: "card" | "detail" | "list" | "admin" = "card"
): boolean {
  if (!isVipProduct(product)) return false;

  // Always show in admin context
  if (context === "admin") return true;

  // Show in all public contexts if product is VIP
  return true;
}
