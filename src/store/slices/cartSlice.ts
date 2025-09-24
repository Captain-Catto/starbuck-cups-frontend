import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { CartItem, Product } from "@/types";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

// Helper functions for localStorage
const loadCartFromStorage = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem("starbucks-cart");
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Error loading cart from localStorage:", error);
    return [];
  }
};

const saveCartToStorage = (items: CartItem[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("starbucks-cart", JSON.stringify(items));
  } catch (error) {
    console.error("Error saving cart to localStorage:", error);
  }
};

const initialState: CartState = {
  items: loadCartFromStorage(),
  isOpen: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (
      state,
      action: PayloadAction<{ product: Product; quantity?: number }>
    ) => {
      const { product, quantity = 1 } = action.payload;
      const existingItem = state.items.find(
        (item) => item.product.id === product.id
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ product, quantity });
      }

      saveCartToStorage(state.items);
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (item) => item.product.id !== action.payload
      );
      saveCartToStorage(state.items);
    },

    updateQuantity: (
      state,
      action: PayloadAction<{ productId: string; quantity: number }>
    ) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find((item) => item.product.id === productId);

      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(
            (item) => item.product.id !== productId
          );
        } else {
          item.quantity = quantity;
        }
      }

      saveCartToStorage(state.items);
    },

    clearCart: (state) => {
      state.items = [];
      saveCartToStorage(state.items);
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
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  toggleCart,
  openCart,
  closeCart,
} = cartSlice.actions;

export default cartSlice.reducer;
