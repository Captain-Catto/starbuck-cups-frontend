/**
 * Utility functions for calculating optimal layout based on screen size
 */

export interface GridConfig {
  columns: number;
  rows: number;
  productsPerPage: number;
}

/**
 * Get number of columns based on screen width
 * Reduced for larger, more readable product cards
 */
export const getColumnsForWidth = (width: number): number => {
  if (width >= 1024) return 4; // lg screens and above
  if (width >= 768) return 3; // md screens
  if (width >= 640) return 2; // sm screens
  return 2; // mobile default
};

/**
 * Calculate optimal number of rows based on screen height
 */
export const getRowsForHeight = (height: number): number => {
  const cardHeight = 280; // Approximate card height including gap and margins
  const headerFooterHeight = 300; // Header, filters, pagination, etc.
  const availableHeight = height - headerFooterHeight;

  // Calculate how many rows can fit, with minimum of 4 rows
  const calculatedRows = Math.ceil(availableHeight / cardHeight);
  return Math.max(4, Math.min(calculatedRows, 8)); // Max 8 rows for more products
};

/**
 * Calculate optimal products per page based on screen dimensions
 */
export const calculateOptimalProductsPerPage = (): GridConfig => {
  // Default values for SSR or when window is not available
  if (typeof window === "undefined") {
    return getSSRSafeGridConfig();
  }

  const { innerWidth: width, innerHeight: height } = window;
  const columns = getColumnsForWidth(width);
  const rows = getRowsForHeight(height);
  const productsPerPage = columns * rows;

  return {
    columns,
    rows,
    productsPerPage,
  };
};

/**
 * Get SSR-safe grid configuration that works well across devices
 * Updated for larger cards with fewer columns
 */
export const getSSRSafeGridConfig = (): GridConfig => {
  return {
    columns: 3,
    rows: 2,
    productsPerPage: 6,
  };
};

/**
 * Get responsive grid classes for Tailwind CSS
 * Updated for larger, more readable product cards
 */
export const getResponsiveGridClasses = (
  layout: "products" | "homepage" | "related" = "products"
): string => {
  switch (layout) {
    case "homepage":
      return "grid grid-cols-2 lg:grid-cols-4 gap-4";

    case "related":
      return "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4";

    case "products":
    default:
      return "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4";
  }
};

/**
 * Single source of truth for the products page limit.
 * Used by both the server (page.tsx) and the client (ProductsGrid.tsx)
 * so that `initialQueryKey` always matches client-side params.
 */
export const PRODUCTS_PAGE_LIMIT = 24;

/**
 * Get fixed limit for products page
 * Returns 24 products per page to reduce initial render/main-thread pressure
 */
export const getProductsPageLimit = (): number => {
  return PRODUCTS_PAGE_LIMIT;
};
