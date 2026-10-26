/**
 * Permission keys, mirroring the backend catalog (backend/src/constants/permissions.ts).
 * The API checks them on every request; the frontend only uses them to decide what to show.
 */
export const PERMISSIONS = {
  DASHBOARD_VIEW: "dashboard.view",
  PRODUCTS_VIEW: "products.view",
  PRODUCTS_MANAGE: "products.manage",
  PRODUCTS_STOCK: "products.stock",
  CATALOG_VIEW: "catalog.view",
  CATALOG_MANAGE: "catalog.manage",
  ORDERS_VIEW: "orders.view",
  ORDERS_MANAGE: "orders.manage",
  CUSTOMERS_VIEW: "customers.view",
  CUSTOMERS_MANAGE: "customers.manage",
  CONSULTATIONS_VIEW: "consultations.view",
  CONSULTATIONS_MANAGE: "consultations.manage",
  NEWS_VIEW: "news.view",
  NEWS_MANAGE: "news.manage",
  HERO_IMAGES_VIEW: "hero_images.view",
  HERO_IMAGES_MANAGE: "hero_images.manage",
  BANNERS_VIEW: "banners.view",
  BANNERS_MANAGE: "banners.manage",
  SETTINGS_MANAGE: "settings.manage",
  USERS_MANAGE: "users.manage",
  ROLES_MANAGE: "roles.manage",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/** Permission needed to open each admin section, in the order a user would land on them. */
export const SECTION_PERMISSIONS: Array<{ path: string; permission: PermissionKey }> = [
  { path: "/admin/dashboard", permission: PERMISSIONS.DASHBOARD_VIEW },
  { path: "/admin/products", permission: PERMISSIONS.PRODUCTS_VIEW },
  { path: "/admin/orders", permission: PERMISSIONS.ORDERS_VIEW },
  { path: "/admin/customers", permission: PERMISSIONS.CUSTOMERS_VIEW },
  { path: "/admin/consultations", permission: PERMISSIONS.CONSULTATIONS_VIEW },
  { path: "/admin/news", permission: PERMISSIONS.NEWS_VIEW },
];

/** First section the account may open, used when a page redirects someone away. */
export function getHomePath(permissions: readonly string[]): string {
  return SECTION_PERMISSIONS.find((s) => permissions.includes(s.permission))?.path ?? "/admin/profile";
}
