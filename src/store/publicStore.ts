import { configureStore } from "@reduxjs/toolkit";
import { cartListenerMiddleware } from "./cartListener";
import publicAuthReducer from "./slices/publicAuthSlice";
import cartReducer from "./slices/cartSlice";
import productsReducer from "./slices/productsSlice";
import effectSettingsReducer from "./effectSettingsSlice";

// Subset of the full store used on public pages so visitors never download
// the admin slices (orders/customers/notifications/categories/capacities)
// or the full authSlice (which drags in @/lib/client-api). Those state keys
// are UNDEFINED here — public components must never select them. TypeScript
// will NOT catch a violation because hooks are typed against the full
// RootState; enforce via review and the no-restricted-imports lint rule.
export const publicStore = configureStore({
  reducer: {
    auth: publicAuthReducer, // read-only token for SettingsSocketProvider
    cart: cartReducer,
    products: productsReducer,
    effectSettings: effectSettingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }).prepend(cartListenerMiddleware.middleware),
});
