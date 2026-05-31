import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { cartListenerMiddleware } from "./cartListener";
import authReducer from "./slices/authSlice";
import cartReducer from "./slices/cartSlice";
import customersReducer from "./slices/customersSlice";
import ordersReducer from "./slices/ordersSlice";
import productsReducer from "./slices/productsSlice";
import notificationsReducer from "./slices/notificationSlice";
import effectSettingsReducer from "./effectSettingsSlice";
import categoriesReducer from "./slices/categoriesSlice";
import capacitiesReducer from "./slices/capacitiesSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    customers: customersReducer,
    orders: ordersReducer,
    products: productsReducer,
    notifications: notificationsReducer,
    effectSettings: effectSettingsReducer,
    categories: categoriesReducer,
    capacities: capacitiesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }).prepend(cartListenerMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
