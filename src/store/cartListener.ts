import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import {
  addToCart,
  removeFromCart,
  clearCart,
  clearLocalStorage,
} from "./slices/cartSlice";
import type { RootState } from "./index";

const CART_STORAGE_KEY = "starbucks-cart:v1";
const LEGACY_CART_STORAGE_KEY = "starbucks-cart";

export const cartListenerMiddleware = createListenerMiddleware();

cartListenerMiddleware.startListening({
  matcher: isAnyOf(addToCart, removeFromCart, clearCart),
  effect: (_action, listenerApi) => {
    if (typeof window === "undefined") return;
    const items = (listenerApi.getState() as RootState).cart.items;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
    } catch {}
  },
});

cartListenerMiddleware.startListening({
  actionCreator: clearLocalStorage,
  effect: () => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
    } catch {}
  },
});
