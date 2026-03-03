import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { CartItem, Product } from "@/types";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  lastAction?: {
    type: 'added' | 'already_exists' | 'removed';
    productName?: string;
  };
}

// Helper functions for localStorage
const loadCartFromStorage = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem("starbucks-cart");
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    return [];
  }
};

const saveCartToStorage = (items: CartItem[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("starbucks-cart", JSON.stringify(items));
  } catch (error) {
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
    addToCart: (
      state,
      action: PayloadAction<{ product: Product }>
    ) => {
      const { product } = action.payload;
      const existingItem = state.items.find(
        (item) => item.product.id === product.id
      );

      if (!existingItem) {
        state.items.push({ product });
        state.lastAction = {
          type: 'added',
          productName: product.name
        };
        saveCartToStorage(state.items);
      } else {
        state.lastAction = {
          type: 'already_exists',
          productName: product.name
        };
      }
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (item) => item.product.id !== action.payload
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
