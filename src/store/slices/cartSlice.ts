import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { CartItem, Product } from "@/types";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  lastAction?: {
    type: "added" | "already_exists" | "removed";
    productName?: string;
  };
}

const CART_STORAGE_KEY = "starbucks-cart:v1";
const LEGACY_CART_STORAGE_KEY = "starbucks-cart";

const loadCartFromStorage = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const saved =
      localStorage.getItem(CART_STORAGE_KEY) ||
      localStorage.getItem(LEGACY_CART_STORAGE_KEY);
    if (saved && !localStorage.getItem(CART_STORAGE_KEY)) {
      localStorage.setItem(CART_STORAGE_KEY, saved);
      localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
    }
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const initialState: CartState = {
  items: loadCartFromStorage(),
  isOpen: false,
  lastAction: undefined,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ product: Product }>) => {
      const { product } = action.payload;
      const existingItem = state.items.find(
        (item) => item.product.id === product.id
      );
      if (existingItem) {
        state.lastAction = { type: "already_exists", productName: product.name };
        return;
      }
      state.items.push({ product });
      state.lastAction = { type: "added", productName: product.name };
    },

    removeFromCart: (state, action: PayloadAction<{ productId: string }>) => {
      state.items = state.items.filter(
        (item) => item.product.id !== action.payload.productId
      );
    },

    clearCart: (state) => {
      state.items = [];
    },

    clearLocalStorage: (state) => {
      state.items = [];
    },

    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },

    openCart: (state) => {
      state.isOpen = true;
    },

    closeCart: (state) => {
      state.isOpen = false;
    },

    clearLastAction: (state) => {
      state.lastAction = undefined;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  clearCart,
  clearLocalStorage,
  toggleCart,
  openCart,
  closeCart,
  clearLastAction,
} = cartSlice.actions;

export default cartSlice.reducer;
