// Product-specific analytics with spam prevention
// Tracks product clicks and add-to-cart actions with deduplication

interface ClickTracker {
  lastClickTime: number;
  clickCount: number;
}

interface SessionTracker {
  productClicks: Map<string, ClickTracker>;
  cartClicks: Map<string, ClickTracker>;
  sessionStart: number;
}

// Session-based tracking để prevent spam
let sessionTracker: SessionTracker = {
  productClicks: new Map(),
  cartClicks: new Map(),
  sessionStart: Date.now(),
};

// Configuration
const CLICK_DEBOUNCE_MS = 3000; // 3 giây debounce
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 phút reset session
const MAX_CLICKS_PER_SESSION = 50; // Maximum clicks per session để prevent abuse
const MAX_CLICKS_PER_PRODUCT = 5; // Maximum clicks per product per session

// Reset session nếu timeout
const resetSessionIfNeeded = () => {
  const now = Date.now();
  if (now - sessionTracker.sessionStart > SESSION_TIMEOUT_MS) {

    sessionTracker = {
      productClicks: new Map(),
      cartClicks: new Map(),
      sessionStart: now,
    };
  }
};

// Count total clicks in session
const getTotalSessionClicks = (): number => {
  let total = 0;
  sessionTracker.productClicks.forEach(tracker => {
    total += tracker.clickCount;
  });
  sessionTracker.cartClicks.forEach(tracker => {
    total += tracker.clickCount;
  });
  return total;
};

// Check if click should be tracked (debounce + rate limiting)
const shouldTrackClick = (
  productId: string,
  clickMap: Map<string, ClickTracker>,
  actionType: 'product_click' | 'cart_click'
): boolean => {
  resetSessionIfNeeded();

  const now = Date.now();
  const tracker = clickMap.get(productId);
  const totalClicks = getTotalSessionClicks();

  // Check session-wide rate limit
  if (totalClicks >= MAX_CLICKS_PER_SESSION) {

    return false;
  }

  if (!tracker) {
    // First click cho product này
    clickMap.set(productId, { lastClickTime: now, clickCount: 1 });

    return true;
  }

  // Check product-specific rate limit
  if (tracker.clickCount >= MAX_CLICKS_PER_PRODUCT) {

    return false;
  }

  // Check debounce time
  const timeSinceLastClick = now - tracker.lastClickTime;
  if (timeSinceLastClick < CLICK_DEBOUNCE_MS) {

    return false; // Too soon, ignore click
  }

  // Update tracker
  tracker.lastClickTime = now;
  tracker.clickCount++;

  return true;
};

// Track product click (when user clicks on product card/link)
export const trackProductClick = async (product: {
  id: string;
  name: string;
  category?: string;
}) => {
  // Check spam prevention
  if (!shouldTrackClick(product.id, sessionTracker.productClicks, 'product_click')) {
    return; // Skip tracking
  }

  try {
    // 1. GA4 tracking (immediate) - use existing function
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'product_click', {
        product_id: product.id,
        product_name: product.name,
        product_category: product.category,
        event_category: 'engagement',
        event_label: product.name,
        timestamp: Date.now(),
      });
    }

    // 2. Backend tracking (background, no await để không block UI)
    fetch('/api/analytics/product-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: product.id,
        productName: product.name,
        timestamp: new Date().toISOString(),
      }),
    }).catch(error => {
      // Silent fail - không ảnh hưởng user experience

    });

  } catch (error) {

  }
};

// Track add-to-cart click
export const trackAddToCartClick = async (product: {
  id: string;
  name: string;
  category?: string;
}) => {
  // Check spam prevention
  if (!shouldTrackClick(product.id, sessionTracker.cartClicks, 'cart_click')) {
    return; // Skip tracking
  }

  try {
    // 1. GA4 tracking (immediate) - use existing function
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'add_to_cart_click', {
        product_id: product.id,
        product_name: product.name,
        product_category: product.category,
        event_category: 'engagement',
        event_label: `Add to cart: ${product.name}`,
        timestamp: Date.now(),
      });
    }

    // 2. Backend tracking (background)
    fetch('/api/analytics/add-to-cart-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: product.id,
        productName: product.name,
        timestamp: new Date().toISOString(),
      }),
    }).catch(error => {

    });

  } catch (error) {

  }
};

// Utility functions for debugging and monitoring

// Get current session stats (for debugging)
export const getSessionStats = () => {
  resetSessionIfNeeded();
  return {
    productClicks: Object.fromEntries(
      Array.from(sessionTracker.productClicks.entries()).map(([key, value]) => [
        key,
        { ...value, lastClickTime: new Date(value.lastClickTime).toISOString() },
      ])
    ),
    cartClicks: Object.fromEntries(
      Array.from(sessionTracker.cartClicks.entries()).map(([key, value]) => [
        key,
        { ...value, lastClickTime: new Date(value.lastClickTime).toISOString() },
      ])
    ),
    sessionDuration: Date.now() - sessionTracker.sessionStart,
    totalSessionClicks: getTotalSessionClicks(),
    sessionStart: new Date(sessionTracker.sessionStart).toISOString(),
  };
};

// Manual reset session (for testing)
export const resetSession = () => {
  sessionTracker = {
    productClicks: new Map(),
    cartClicks: new Map(),
    sessionStart: Date.now(),
  };

};

// Check if product đã được click trong session
export const hasClickedProduct = (productId: string): boolean => {
  resetSessionIfNeeded();
  return sessionTracker.productClicks.has(productId);
};

export const hasClickedAddToCart = (productId: string): boolean => {
  resetSessionIfNeeded();
  return sessionTracker.cartClicks.has(productId);
};

// Get click count for specific product
export const getProductClickCount = (productId: string): number => {
  resetSessionIfNeeded();
  return sessionTracker.productClicks.get(productId)?.clickCount || 0;
};

export const getAddToCartClickCount = (productId: string): number => {
  resetSessionIfNeeded();
  return sessionTracker.cartClicks.get(productId)?.clickCount || 0;
};

// Check if we can track more clicks (for rate limiting UI feedback)
export const canTrackMoreClicks = (): boolean => {
  resetSessionIfNeeded();
  return getTotalSessionClicks() < MAX_CLICKS_PER_SESSION;
};

export const canTrackProductClick = (productId: string): boolean => {
  resetSessionIfNeeded();
  const tracker = sessionTracker.productClicks.get(productId);
  return !tracker || tracker.clickCount < MAX_CLICKS_PER_PRODUCT;
};

export const canTrackAddToCartClick = (productId: string): boolean => {
  resetSessionIfNeeded();
  const tracker = sessionTracker.cartClicks.get(productId);
  return !tracker || tracker.clickCount < MAX_CLICKS_PER_PRODUCT;
};

// Export configuration for external use
export const ANALYTICS_CONFIG = {
  CLICK_DEBOUNCE_MS,
  SESSION_TIMEOUT_MS,
  MAX_CLICKS_PER_SESSION,
  MAX_CLICKS_PER_PRODUCT,
};

// Initialize session tracking when module loads
if (typeof window !== 'undefined') {
  // Reset session on page refresh
  window.addEventListener('beforeunload', () => {
    // Optionally save session state to localStorage for persistence
    // But for security, we'll let it reset on page reload
  });

  // Debug: Add to window for development
  if (process.env.NODE_ENV === 'development') {
    (window as Window & { productAnalytics?: object }).productAnalytics = {
      getSessionStats,
      resetSession,
      canTrackMoreClicks,
      ANALYTICS_CONFIG,
    };
  }
}