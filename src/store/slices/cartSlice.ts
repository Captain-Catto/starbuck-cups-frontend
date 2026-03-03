import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { CartItem, Product } from "@/types";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  lastAction?: {
    type: "added" | "already_exists" | "removed";
    productName?: string;
    colorRequest?: string;
  };
}

// Helper functions for localStorage
const loadCartFromStorage = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem("starbucks-cart");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveCartToStorage = (items: CartItem[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("starbucks-cart", JSON.stringify(items));
  } catch {}
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
    addToCart: (
      state,
      action: PayloadAction<{ product: Product; colorRequest?: string }>
    ) => {
      const { product } = action.payload; // Remove colorRequest usage

      // Check if product already exists (ignore color - all colors included)
      const existingItem = state.items.find(
        (item) => item.product.id === product.id
      );

      if (existingItem) {
        // Product already exists in cart (with all colors)
        state.lastAction = {
          type: "already_exists",
          productName: product.name,
          colorRequest: undefined, // No specific color since all colors included
        };
        return;
      }

      // Add product to cart (includes all available colors)
      state.items.push({ product, colorRequest: undefined });
      state.lastAction = {
        type: "added",
        productName: product.name,
        colorRequest: undefined, // No specific color since all colors included
      };

      saveCartToStorage(state.items);
    },

    removeFromCart: (
      state,
      action: PayloadAction<{ productId: string; colorRequest?: string }>
    ) => {
      const { productId } = action.payload; // Remove colorRequest usage
      state.items = state.items.filter(
        (item) => item.product.id !== productId // Only check product ID
      );
      saveCartToStorage(state.items);
    },

    clearCart: (state) => {
      state.items = [];
      saveCartToStorage(state.items);
    },

    // Clear localStorage completely (for migration)
    clearLocalStorage: (state) => {
      state.items = [];
      if (typeof window !== "undefined") {
        localStorage.removeItem("starbucks-cart");
      }
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
