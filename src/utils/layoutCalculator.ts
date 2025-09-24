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
  if (width >= 1536) return 6;      // 2xl screens - reduced from 8
  if (width >= 1280) return 5;      // xl screens - reduced from 7
  if (width >= 1024) return 4;      // lg screens - reduced from 6
  if (width >= 768) return 3;       // md screens - reduced from 4
  if (width >= 640) return 2;       // sm screens
  return 2;                         // mobile default
};

/**
 * Calculate optimal number of rows based on screen height
 */
export const getRowsForHeight = (height: number): number => {
  const cardHeight = 280; // Approximate card height including gap and margins
  const headerFooterHeight = 300; // Header, filters, pagination, etc.
  const availableHeight = height - headerFooterHeight;

  // Calculate how many rows can fit, with minimum of 3 rows
  const calculatedRows = Math.ceil(availableHeight / cardHeight);
  return Math.max(3, Math.min(calculatedRows, 6)); // Max 6 rows to avoid too many products
};

/**
 * Calculate optimal products per page based on screen dimensions
 */
export const calculateOptimalProductsPerPage = (): GridConfig => {
  // Default values for SSR or when window is not available
  if (typeof window === 'undefined') {
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
    rows: 4,
    productsPerPage: 12, // Conservative number for larger cards
  };
};

/**
 * Get responsive grid classes for Tailwind CSS
 * Updated for larger, more readable product cards
 */
export const getResponsiveGridClasses = (
  layout: 'products' | 'homepage' | 'related' = 'products'
): string => {
  switch (layout) {
    case 'homepage':
      return 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4';

    case 'related':
      return 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4';

    case 'products':
    default:
      return 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4';
  }
};

/**
 * Hook-like function to setup responsive products per page with resize handling
 * Only runs on client-side to avoid hydration mismatch
 */
export const useResponsiveProductsPerPage = (
  callback: (config: GridConfig) => void
) => {
  // Ensure we're only running on client-side
  if (typeof window === 'undefined') {
    return () => {}; // No-op for SSR
  }

  const updateLayout = () => {
    const config = calculateOptimalProductsPerPage();
    callback(config);
  };

  // Initial calculation (only on client)
  updateLayout();

  // Setup resize listener with debouncing
  const handleResize = () => {
    // Debounce resize events
    if (window.resizeTimeout) {
      clearTimeout(window.resizeTimeout);
    }
    window.resizeTimeout = setTimeout(updateLayout, 150);
  };

  window.addEventListener('resize', handleResize);

  // Return cleanup function
  return () => {
    window.removeEventListener('resize', handleResize);
    if (window.resizeTimeout) {
      clearTimeout(window.resizeTimeout);
    }
  };
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    resizeTimeout: NodeJS.Timeout;
  }
}