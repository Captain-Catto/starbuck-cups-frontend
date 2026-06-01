"use client";

import { useReducer, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useAppSelector } from "@/hooks/redux";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  colors: Array<{
    id: string;
    name: string;
    hexCode: string;
  }>;
  capacities: Array<{
    id: string;
    size: string;
    unit: string;
  }>;
  categories: Array<{
    id: string;
    name: string;
  }>;
}

export interface ProductFilters {
  categoryId?: string;
  colorId?: string;
  capacityId?: string;
  isActive?: boolean;
  search?: string;
}

export interface ProductPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UseProductsOptions {
  initialPage?: number;
  initialLimit?: number;
  initialFilters?: ProductFilters;
  autoFetch?: boolean;
}

export interface CreateProductData {
  name: string;
  description?: string;
  images: string[];
  colorId: string;
  capacityId: string;
  categoryId: string;
  stockQuantity?: number;
  productUrl?: string;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}

export interface UseProductsReturn {
  products: Product[];
  pagination: ProductPagination;
  filters: ProductFilters;
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setFilters: (filters: Partial<ProductFilters>) => void;
  clearFilters: () => void;
  refetch: () => Promise<void>;
  toggleProductStatus: (productId: string) => Promise<void>;
  createProduct: (data: CreateProductData) => Promise<Product>;
  updateProduct: (data: UpdateProductData) => Promise<Product>;
  deleteProduct: (productId: string) => Promise<void>;
}

interface ProductState {
  products: Product[];
  pagination: ProductPagination;
  filters: ProductFilters;
  loading: boolean;
  error: string | null;
}

type ProductAction =
  | { type: "FETCH_START" }
  | {
      type: "FETCH_SUCCESS";
      products: Product[];
      pagination?: Partial<ProductPagination>;
    }
  | { type: "FETCH_ERROR"; error: string }
  | { type: "SET_PAGE"; page: number }
  | { type: "SET_LIMIT"; limit: number }
  | { type: "SET_FILTERS"; filters: Partial<ProductFilters> }
  | { type: "CLEAR_FILTERS" }
  | { type: "TOGGLE_STATUS"; productId: string }
  | { type: "CREATE_PRODUCT"; product: Product }
  | { type: "UPDATE_PRODUCT"; product: Product }
  | { type: "DELETE_PRODUCT"; productId: string };

function productReducer(state: ProductState, action: ProductAction): ProductState {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return {
        ...state,
        products: action.products,
        pagination: action.pagination
          ? { ...state.pagination, ...action.pagination }
          : state.pagination,
        loading: false,
      };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.error };
    case "SET_PAGE":
      return {
        ...state,
        pagination: { ...state.pagination, page: action.page },
      };
    case "SET_LIMIT":
      return {
        ...state,
        pagination: { ...state.pagination, limit: action.limit, page: 1 },
      };
    case "SET_FILTERS":
      return {
        ...state,
        filters: { ...state.filters, ...action.filters },
        pagination: { ...state.pagination, page: 1 },
      };
    case "CLEAR_FILTERS":
      return {
        ...state,
        filters: {},
        pagination: { ...state.pagination, page: 1 },
      };
    case "TOGGLE_STATUS":
      return {
        ...state,
        products: state.products.map((product) =>
          product.id === action.productId
            ? { ...product, isActive: !product.isActive }
            : product
        ),
      };
    case "CREATE_PRODUCT":
      return { ...state, products: [action.product, ...state.products] };
    case "UPDATE_PRODUCT":
      return {
        ...state,
        products: state.products.map((product) =>
          product.id === action.product.id ? action.product : product
        ),
      };
    case "DELETE_PRODUCT":
      return {
        ...state,
        products: state.products.filter((product) => product.id !== action.productId),
      };
    default:
      return state;
  }
}

export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const {
    initialPage = 1,
    initialLimit = 12,
    initialFilters = {},
    autoFetch = true,
  // react-doctor-disable-next-line react-doctor/no-event-handler -- initialization fetch re-runs on pagination/filter change, not a user event
  } = options;

  const { token } = useAppSelector((state) => state.auth);

  const [state, dispatch] = useReducer(productReducer, {
    products: [],
    pagination: {
      page: initialPage,
      limit: initialLimit,
      total: 0,
      totalPages: 0,
    },
    filters: initialFilters,
    loading: true,
    error: null,
  });
  const { products, pagination, filters, loading, error } = state;

  const getAuthHeaders = useCallback((): Record<string, string> => {


    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  const fetchProducts = useCallback(async () => {
    try {
      dispatch({ type: "FETCH_START" });

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...Object.entries(filters).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null) {
            acc[key] = value.toString();
          }
          return acc;
        }, {} as Record<string, string>),
      });

      const isAdminRequest = window.location.pathname.startsWith('/admin');
      const endpoint = isAdminRequest ? '/api/admin/products' : '/api/products';

      const response = await fetch(`${endpoint}?${params}`, {
        headers: isAdminRequest ? getAuthHeaders() : {},
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        dispatch({
          type: "FETCH_SUCCESS",
          products: data.data.items || data.data || [],
          pagination: data.data?.pagination
            ? {
            total: data.data.pagination.total_items || 0,
            totalPages: data.data.pagination.total_pages || 0,
              }
            : undefined,
        });
      } else {
        const errorMsg = data.message || "Không thể tải danh sách sản phẩm";
        dispatch({ type: "FETCH_ERROR", error: errorMsg });
        toast.error(errorMsg);
      }
    } catch (err) {
      const errorMsg = "Có lỗi xảy ra khi tải danh sách sản phẩm";
      dispatch({ type: "FETCH_ERROR", error: errorMsg });
      toast.error(errorMsg);

    }
  }, [pagination.page, pagination.limit, filters, getAuthHeaders]);

  const setPage = useCallback((page: number) => {
    dispatch({ type: "SET_PAGE", page });
  }, []);

  const setLimit = useCallback((limit: number) => {
    dispatch({ type: "SET_LIMIT", limit });
  }, []);

  const setFilters = useCallback((newFilters: Partial<ProductFilters>) => {
    dispatch({ type: "SET_FILTERS", filters: newFilters });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: "CLEAR_FILTERS" });
  }, []);

  const refetch = useCallback(() => {
    return fetchProducts();
  }, [fetchProducts]);

  const toggleProductStatus = useCallback(async (productId: string) => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) {
        throw new Error("Không tìm thấy sản phẩm");
      }

      const response = await fetch(`/api/admin/products/${productId}/toggle-status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        dispatch({
          type: "UPDATE_PRODUCT",
          product: {
            ...product,
            ...data.data,
            isActive: data.data?.isActive ?? !product.isActive,
          },
        });
        toast.success(
          product.isActive
            ? "Đã ẩn sản phẩm"
            : "Đã hiển thị sản phẩm"
        );
      } else {
        throw new Error(data.message || "Không thể cập nhật trạng thái sản phẩm");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Có lỗi xảy ra khi cập nhật trạng thái";
      toast.error(errorMsg);
      throw err;
    }
  }, [products, getAuthHeaders]);

  const createProduct = useCallback(async (data: CreateProductData): Promise<Product> => {
    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        const newProduct = result.data;
        dispatch({ type: "CREATE_PRODUCT", product: newProduct });
        toast.success("Tạo sản phẩm thành công");
        return newProduct;
      } else {
        throw new Error(result.message || "Không thể tạo sản phẩm");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Có lỗi xảy ra khi tạo sản phẩm";
      toast.error(errorMsg);
      throw err;
    }
  }, [getAuthHeaders]);

  const updateProduct = useCallback(async (data: UpdateProductData): Promise<Product> => {
    try {
      const { id, ...updateData } = data;

      const response = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        const updatedProduct = result.data;
        dispatch({ type: "UPDATE_PRODUCT", product: updatedProduct });
        toast.success("Cập nhật sản phẩm thành công");
        return updatedProduct;
      } else {
        throw new Error(result.message || "Không thể cập nhật sản phẩm");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Có lỗi xảy ra khi cập nhật sản phẩm";
      toast.error(errorMsg);
      throw err;
    }
  }, [getAuthHeaders]);

  const deleteProduct = useCallback(async (productId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        dispatch({ type: "DELETE_PRODUCT", productId });
        toast.success("Xóa sản phẩm thành công");
      } else {
        throw new Error(result.message || "Không thể xóa sản phẩm");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Có lỗi xảy ra khi xóa sản phẩm";
      toast.error(errorMsg);
      throw err;
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    if (autoFetch) {
      // react-doctor-disable-next-line react-doctor/no-pass-data-to-parent -- initialization fetch, data flows down via hook return value
      fetchProducts();
    }
  }, [pagination.page, pagination.limit, filters, autoFetch, fetchProducts]);

  return {
    products,
    pagination,
    filters,
    loading,
    error,
    fetchProducts,
    setPage,
    setLimit,
    setFilters,
    clearFilters,
    refetch,
    toggleProductStatus,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}
