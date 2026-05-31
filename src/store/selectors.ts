import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "./index";

// Cart selectors
export const selectCartItems = (state: RootState) => state.cart.items;

export const selectCartCount = createSelector(
  selectCartItems,
  (items) => items.length
);

export const selectCartOpen = (state: RootState) => state.cart.isOpen;
export const selectCartLastAction = (state: RootState) => state.cart.lastAction;

// Auth selectors
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthToken = (state: RootState) => state.auth.token;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectSessionChecked = (state: RootState) => state.auth.sessionChecked;

// Products selectors
export const selectProducts = (state: RootState) => state.products.products;
export const selectCurrentProduct = (state: RootState) => state.products.currentProduct;
export const selectRelatedProducts = (state: RootState) => state.products.relatedProducts;
export const selectProductsLoading = (state: RootState) => state.products.productsLoading;
export const selectProductsPagination = createSelector(
  (state: RootState) => state.products.currentPage,
  (state: RootState) => state.products.totalPages,
  (state: RootState) => state.products.totalItems,
  (currentPage, totalPages, totalItems) => ({ currentPage, totalPages, totalItems })
);

// Orders selectors
export const selectOrders = (state: RootState) => state.orders.orders;
export const selectSelectedOrder = (state: RootState) => state.orders.selectedOrder;
export const selectOrdersLoading = (state: RootState) => state.orders.loading;
export const selectOrderStats = (state: RootState) => state.orders.stats;
export const selectOrdersPagination = createSelector(
  (state: RootState) => state.orders.currentPage,
  (state: RootState) => state.orders.totalPages,
  (state: RootState) => state.orders.totalCount,
  (currentPage, totalPages, totalCount) => ({ currentPage, totalPages, totalCount })
);

// Customers selectors
export const selectCustomers = (state: RootState) => state.customers.customers;
export const selectSelectedCustomer = (state: RootState) => state.customers.selectedCustomer;
export const selectCustomersLoading = (state: RootState) => state.customers.loading;

// Notifications selectors
export const selectNotifications = (state: RootState) => state.notifications.notifications;
export const selectUnreadCount = (state: RootState) => state.notifications.unreadCount;
export const selectIsSocketConnected = (state: RootState) => state.notifications.isConnected;
