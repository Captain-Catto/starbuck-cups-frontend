"use client";

import { useState, useEffect, useCallback } from "react";
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

export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const {
    initialPage = 1,
    initialLimit = 12,
    initialFilters = {},
    autoFetch = true,
  } = options;

  const { token } = useAppSelector((state) => state.auth);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<ProductPagination>({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFiltersState] = useState<ProductFilters>(initialFilters);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    console.log("getAuthHeaders: Redux token exists?", !!token);
    console.log("getAuthHeaders: Redux token preview:", token?.substring(0, 20) + "...");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

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
        setProducts(data.data.items || data.data || []);
        if (data.data?.pagination) {
          setPagination(prev => ({
            ...prev,
            total: data.data.pagination.total_items || 0,
            totalPages: data.data.pagination.total_pages || 0,
          }));
        }
      } else {
        const errorMsg = data.message || "Không thể tải danh sách sản phẩm";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      const errorMsg = "Có lỗi xảy ra khi tải danh sách sản phẩm";
      setError(errorMsg);
      toast.error(errorMsg);
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters, getAuthHeaders]);

  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  const setFilters = useCallback((newFilters: Partial<ProductFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({});
    setPagination(prev => ({ ...prev, page: 1 }));
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

      const response = await fetch(`/api/admin/products/${productId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ isActive: !product.isActive }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setProducts(prevProducts =>
          prevProducts.map(p =>
            p.id === productId ? { ...p, isActive: !p.isActive } : p
          )
        );
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
        setProducts(prevProducts => [newProduct, ...prevProducts]);
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
        setProducts(prevProducts =>
          prevProducts.map(p => p.id === id ? updatedProduct : p)
        );
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
        setProducts(prevProducts =>
          prevProducts.filter(p => p.id !== productId)
        );
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