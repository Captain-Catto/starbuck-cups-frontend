import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { Product } from "@/types";

// Types
export interface ProductsState {
  // Current single product (for detail page)
  currentProduct: Product | null;
  currentProductLoading: boolean;
  currentProductError: string | null;

  // Products list (for products page, home grid)
  products: Product[];
  productsLoading: boolean;
  productsError: string | null;

  // Related products
  relatedProducts: Product[];
  relatedProductsLoading: boolean;
  relatedProductsError: string | null;

  // Pagination for products page
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

// Initial state
const initialState: ProductsState = {
  currentProduct: null,
  currentProductLoading: false,
  currentProductError: null,

  products: [],
  productsLoading: false,
  productsError: null,

  relatedProducts: [],
  relatedProductsLoading: false,
  relatedProductsError: null,

  totalPages: 1,
  currentPage: 1,
  totalItems: 0,
};

// Async thunks

// Fetch single product by slug
export const fetchProductBySlug = createAsyncThunk(
  "products/fetchProductBySlug",
  async (slug: string, { rejectWithValue }) => {
    try {

      const response = await fetch(`/api/products/public/${slug}`);

      const data = await response.json();

      if (!data.success || !data.data) {

        return rejectWithValue("Product not found");
      }

      return data.data as Product;
    } catch (error) {

      return rejectWithValue("Failed to fetch product");
    }
  }
);

// Fetch products list with filters
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      category?: string;
      color?: string;
      capacity?: string;
      sort?: string;
      inStock?: boolean;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const searchParams = new URLSearchParams();

      if (params.page) searchParams.append("page", params.page.toString());
      if (params.limit) searchParams.append("limit", params.limit.toString());
      if (params.search) searchParams.append("search", params.search);
      if (params.category) searchParams.append("category", params.category);
      if (params.color) searchParams.append("color", params.color);
      if (params.capacity) searchParams.append("capacity", params.capacity);
      if (params.sort) searchParams.append("sort", params.sort);
      if (params.inStock !== undefined)
        searchParams.append("inStock", params.inStock.toString());

      const response = await fetch(
        `/api/products/public?${searchParams.toString()}`
      );
      const data = await response.json();

      if (!data.success) {
        return rejectWithValue("Failed to fetch products");
      }

      return {
        products: data.data?.items || [],
        totalPages: data.data?.totalPages || 1,
        currentPage: data.data?.currentPage || 1,
        totalItems: data.data?.totalItems || 0,
      };
    } catch {
      return rejectWithValue("Failed to fetch products");
    }
  }
);

// Fetch related products
export const fetchRelatedProducts = createAsyncThunk(
  "products/fetchRelatedProducts",
  async (
    params: {
      categoryIds: string[];
      currentProductId?: string;
      limit?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const limit = params.limit || 8;

      // First, try to find products matching ALL categories (if multiple categories)
      let allCategoryProducts: Product[] = [];
      if (params.categoryIds.length > 1) {
        // Use the new backend API with categoryIds parameter for all-category matches
        const searchParams = new URLSearchParams();
        searchParams.append("categoryIds", params.categoryIds.join(","));
        searchParams.append("limit", "100"); // Get more to filter for exact matches
        searchParams.append("inStock", "true");
        searchParams.append("sortBy", "createdAt");
        searchParams.append("sortOrder", "desc"); // Newest first
        if (params.currentProductId) {
          searchParams.append("excludeProductId", params.currentProductId);
        }

        const allCategoryResponse = await fetch(
          `/api/products/public?${searchParams.toString()}`
        );
        const allCategoryData = await allCategoryResponse.json();

        if (allCategoryData.success) {
          const allProducts = allCategoryData.data?.items || [];

          // Filter products that have ALL the required categories
          allCategoryProducts = allProducts.filter((product: Product) => {
            if (!product.productCategories) return false;
            const productCategoryIds = product.productCategories.map(
              (pc) => pc.category.id
            );
            return params.categoryIds.every((catId) =>
              productCategoryIds.includes(catId)
            );
          });

          // Current product already excluded by backend via excludeProductId parameter
        }
      }

      // If we have enough products with all categories, use them
      if (allCategoryProducts.length >= limit) {
        // Sort by newest first before taking the limit
        const sortedProducts = allCategoryProducts.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        const normalizedProducts = sortedProducts
          .slice(0, limit)
          .map((product: Product) => ({
            ...product,
            images:
              product.productImages?.map(
                (img: { url: string; order: number }) => img.url
              ) || [],
          }));
        return normalizedProducts as Product[];
      }

      // Otherwise, fetch products that match ANY category (fallback)
      const searchParams = new URLSearchParams();
      searchParams.append("categoryIds", params.categoryIds.join(","));
      searchParams.append("limit", limit.toString());
      searchParams.append("inStock", "true");
      searchParams.append("sortBy", "createdAt");
      searchParams.append("sortOrder", "desc"); // Newest first
      if (params.currentProductId) {
        searchParams.append("excludeProductId", params.currentProductId);
      }

      const response = await fetch(
        `/api/products/public?${searchParams.toString()}`
      );
      const data = await response.json();

      if (!data.success) {
        return rejectWithValue("Failed to fetch related products");
      }

      const products = data.data?.items || [];

      // Current product already excluded by backend via excludeProductId parameter

      // Combine products: prioritize all-category matches, then any-category matches
      // Sort each group by creation date (newest first) before combining
      const sortedAllCategoryProducts = allCategoryProducts.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const anyCategoryProducts = products.filter(
        (p: Product) => !allCategoryProducts.some((ap) => ap.id === p.id)
      );
      const sortedAnyCategoryProducts = anyCategoryProducts.sort(
        (a: Product, b: Product) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const finalProducts = [
        ...sortedAllCategoryProducts,
        ...sortedAnyCategoryProducts,
      ].slice(0, limit);

      // Normalize products data to handle image structure
      const normalizedProducts = finalProducts.map((product: Product) => ({
        ...product,
        images:
          product.productImages?.map(
            (img: { url: string; order: number }) => img.url
          ) || [],
      }));

      return normalizedProducts as Product[];
    } catch {
      return rejectWithValue("Failed to fetch related products");
    }
  }
);

// Slice
const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    // Clear current product
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
      state.currentProductError = null;
    },

    // Clear products list
    clearProducts: (state) => {
      state.products = [];
      state.productsError = null;
    },

    // Clear related products
    clearRelatedProducts: (state) => {
      state.relatedProducts = [];
      state.relatedProductsError = null;
    },

    // Set current page
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },

    // Clear all errors
    clearErrors: (state) => {
      state.currentProductError = null;
      state.productsError = null;
      state.relatedProductsError = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch single product by slug
    builder
      .addCase(fetchProductBySlug.pending, (state) => {
        state.currentProductLoading = true;
        state.currentProductError = null;
      })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => {
        state.currentProductLoading = false;
        state.currentProduct = action.payload;
        state.currentProductError = null;
      })
      .addCase(fetchProductBySlug.rejected, (state, action) => {
        state.currentProductLoading = false;
        state.currentProduct = null;
        state.currentProductError = action.payload as string;
      });

    // Fetch products list
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.productsLoading = true;
        state.productsError = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.productsLoading = false;
        state.products = action.payload.products;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.totalItems = action.payload.totalItems;
        state.productsError = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.productsLoading = false;
        state.products = [];
        state.productsError = action.payload as string;
      });

    // Fetch related products
    builder
      .addCase(fetchRelatedProducts.pending, (state) => {
        state.relatedProductsLoading = true;
        state.relatedProductsError = null;
      })
      .addCase(fetchRelatedProducts.fulfilled, (state, action) => {
        state.relatedProductsLoading = false;
        state.relatedProducts = action.payload;
        state.relatedProductsError = null;
      })
      .addCase(fetchRelatedProducts.rejected, (state, action) => {
        state.relatedProductsLoading = false;
        state.relatedProducts = [];
        state.relatedProductsError = action.payload as string;
      });
  },
});

// Export actions
export const {
  clearCurrentProduct,
  clearProducts,
  clearRelatedProducts,
  setCurrentPage,
  clearErrors,
} = productsSlice.actions;

// Export reducer
export default productsSlice.reducer;
