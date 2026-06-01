import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import { useReducer, type SetStateAction } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import type { RootState } from "@/store";
import type {
  Product,
  Category,
  Color,
  Capacity,
  PaginationMeta,
} from "@/types";
import { clientApi } from "@/lib/client-api";
import { invalidateProductDependentCaches } from "@/lib/adminCacheInvalidation";

interface ProductListItem extends Product {
  isActive: boolean;
  stock: number;
}

interface ProductFilters {
  search: string;
  category: string;
  color: string;
  minCapacity: string;
  maxCapacity: string;
  status: "all" | "active" | "inactive" | "low_stock";
  sortBy: string;
  sortOrder: "asc" | "desc";
}

interface SearchParamReader {
  get(name: string): string | null;
}

const DEFAULT_SEARCH_PARAMS: SearchParamReader = {
  get: () => null,
};

const DEFAULT_PAGINATION: PaginationMeta = {
  current_page: 1,
  has_next: false,
  has_prev: false,
  per_page: 10,
  total_items: 0,
  total_pages: 0,
};

interface ProductListState {
  products: ProductListItem[];
  categories: Category[];
  colors: Color[];
  capacities: Capacity[];
  loading: boolean;
  filters: ProductFilters;
  pagination: PaginationMeta;
  debouncedSearch: string;
}

type ProductListAction =
  | { type: "SET_DEBOUNCED_SEARCH"; search: string }
  | { type: "LOAD_PRODUCTS_START" }
  | {
      type: "LOAD_PRODUCTS_SUCCESS";
      products: ProductListItem[];
      pagination?: PaginationMeta;
    }
  | { type: "LOAD_PRODUCTS_FINISH" }
  | {
      type: "LOAD_FILTER_OPTIONS_SUCCESS";
      categories: Category[];
      colors: Color[];
      capacities: Capacity[];
    }
  | { type: "LOAD_FILTER_OPTIONS_ERROR" }
  | { type: "SET_FILTER"; field: keyof ProductFilters; value: string }
  | { type: "SET_PAGINATION"; value: SetStateAction<PaginationMeta> }
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_PRODUCTS"; value: SetStateAction<ProductListItem[]> };

function resolveStateValue<T>(value: SetStateAction<T>, current: T): T {
  return typeof value === "function"
    ? (value as (previous: T) => T)(current)
    : value;
}

function createInitialFilters(searchParams: SearchParamReader): ProductFilters {
  return {
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    color: searchParams.get("color") || "",
    minCapacity: searchParams.get("minCapacity") || "",
    maxCapacity: searchParams.get("maxCapacity") || "",
    status: (searchParams.get("status") as ProductFilters["status"]) || "all",
    sortBy: searchParams.get("sortBy") || "createdAt",
    sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
  };
}

function productListReducer(
  state: ProductListState,
  action: ProductListAction
): ProductListState {
  switch (action.type) {
    case "SET_DEBOUNCED_SEARCH":
      return { ...state, debouncedSearch: action.search };
    case "LOAD_PRODUCTS_START":
      return { ...state, loading: true };
    case "LOAD_PRODUCTS_SUCCESS":
      return {
        ...state,
        products: action.products,
        pagination: action.pagination ?? state.pagination,
      };
    case "LOAD_PRODUCTS_FINISH":
      return { ...state, loading: false };
    case "LOAD_FILTER_OPTIONS_SUCCESS":
      return {
        ...state,
        categories: action.categories,
        colors: action.colors,
        capacities: action.capacities,
      };
    case "LOAD_FILTER_OPTIONS_ERROR":
      return { ...state, categories: [], colors: [], capacities: [] };
    case "SET_FILTER":
      return {
        ...state,
        filters: { ...state.filters, [action.field]: action.value },
        pagination: { ...state.pagination, current_page: 1 },
      };
    case "SET_PAGINATION":
      return {
        ...state,
        pagination: resolveStateValue(action.value, state.pagination),
      };
    case "SET_LOADING":
      return { ...state, loading: action.loading };
    case "SET_PRODUCTS":
      return {
        ...state,
        products: resolveStateValue(action.value, state.products),
      };
    default:
      return state;
  }
}

export interface UseProductsReturn {
  // Data
  products: ProductListItem[];
  categories: Category[];
  colors: Color[];
  capacities: Capacity[];

  // State
  loading: boolean;
  actionLoading: string | null;
  selectedProducts: string[];
  filters: ProductFilters;
  pagination: PaginationMeta;

  // Modal state
  isModalOpen: boolean;
  editingProduct: ProductListItem | null;

  // Confirmation modal state
  confirmModal: {
    show: boolean;
    product: ProductListItem | null;
    action: "toggle" | "delete";
  };

  // Actions
  loadProducts: () => Promise<void>;
  loadFilterOptions: () => Promise<void>;
  handleFilterChange: (field: keyof ProductFilters, value: string) => void;
  handleBulkAction: (
    action: "activate" | "deactivate" | "delete"
  ) => Promise<void>;
  handleProductAction: (
    productId: string,
    action: "activate" | "deactivate" | "delete"
  ) => Promise<void>;
  performProductAction: (
    productId: string,
    action: "activate" | "deactivate" | "delete"
  ) => Promise<void>;
  handleCreateProduct: () => void;
  handleEditProduct: (product: ProductListItem) => void;
  handleCloseModal: () => void;
  handleModalSuccess: () => void;
  getProductStatus: (product: ProductListItem) => {
    type: "active" | "inactive" | "low-stock" | "out-of-stock";
    label: string;
  };
  setSelectedProducts: React.Dispatch<React.SetStateAction<string[]>>;
  setPagination: React.Dispatch<React.SetStateAction<PaginationMeta>>;
  setConfirmModal: React.Dispatch<
    React.SetStateAction<{
      show: boolean;
      product: ProductListItem | null;
      action: "toggle" | "delete";
    }>
  >;

  // Selection helpers
  isAllSelected: boolean;
  isIndeterminate: boolean;
}

export function useProducts(
  searchParams: SearchParamReader = DEFAULT_SEARCH_PARAMS
): UseProductsReturn {
  const router = useRouter();
  const pathname = usePathname();
  const token = useSelector((state: RootState) => state.auth.token);

  const [listState, dispatchList] = useReducer(productListReducer, {
    products: [],
    categories: [],
    colors: [],
    capacities: [],
    loading: true,
    filters: createInitialFilters(searchParams),
    pagination: DEFAULT_PAGINATION,
    debouncedSearch: "",
  });
  const {
    products,
    categories,
    colors,
    capacities,
    loading,
    filters,
    pagination,
    debouncedSearch,
  } = listState;
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductListItem | null>(
    null
  );

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    product: ProductListItem | null;
    action: "toggle" | "delete";
  }>({
    show: false,
    product: null,
    action: "toggle",
  });

  const searchDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const productsRequestControllerRef = useRef<AbortController | null>(null);

  const setProducts = useCallback((value: SetStateAction<ProductListItem[]>) => {
    dispatchList({ type: "SET_PRODUCTS", value });
  }, []);

  const setPagination = useCallback((value: SetStateAction<PaginationMeta>) => {
    dispatchList({ type: "SET_PAGINATION", value });
  }, []);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  // Debounce search query (500ms delay)
  useEffect(() => {
    if (searchDebounceTimerRef.current) {
      clearTimeout(searchDebounceTimerRef.current);
    }

    searchDebounceTimerRef.current = setTimeout(() => {
      dispatchList({ type: "SET_DEBOUNCED_SEARCH", search: filters.search });
    }, 500);

    return () => {
      const timer = searchDebounceTimerRef.current;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [filters.search]);

  const loadProducts = useCallback(async () => {
    if (productsRequestControllerRef.current) {
      productsRequestControllerRef.current.abort();
    }
    const controller = new AbortController();
    productsRequestControllerRef.current = controller;

    try {
      dispatchList({ type: "LOAD_PRODUCTS_START" });

      const params = new URLSearchParams({
        page: pagination.current_page.toString(),
        limit: pagination.per_page.toString(),
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(filters.category && { categorySlug: filters.category }),
        ...(filters.color && { colorSlug: filters.color }),
        ...(filters.minCapacity && { minCapacity: filters.minCapacity }),
        ...(filters.maxCapacity && { maxCapacity: filters.maxCapacity }),
        ...(filters.status === "active" && { isActive: "true" }),
        ...(filters.status === "inactive" && { isActive: "false" }),
        ...(filters.status === "low_stock" && {
          lowStock: "true",
          lowStockThreshold: "1",
        }),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });

      const response = await fetch(`/api/admin/products?${params}`, {
        headers: getAuthHeaders(),
        signal: controller.signal,
      });
      const data = await response.json();

      if (data.success) {
        // Map API response to match our interface
        const mappedProducts = (data.data?.items || []).map(
          (item: Product & { stockQuantity: number }) => ({
            ...item,
            stock: item.stockQuantity, // Map stockQuantity to stock
            // Ensure isActive is boolean
            isActive: Boolean(item.isActive),
            // Ensure backward compatibility - convert productImages to images array
            images:
              item.productImages?.map(
                (img: { url: string; order: number }) => img.url
              ) || [],
          })
        );

        dispatchList({
          type: "LOAD_PRODUCTS_SUCCESS",
          products: mappedProducts,
          pagination: data.data?.pagination,
        });
      } else {

        toast.error(data.message || "Không thể tải danh sách sản phẩm");
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      toast.error("Có lỗi xảy ra khi tải sản phẩm");
    } finally {
      if (!controller.signal.aborted) {
        dispatchList({ type: "LOAD_PRODUCTS_FINISH" });
      }
    }
  }, [getAuthHeaders, debouncedSearch, filters.category, filters.color, filters.minCapacity, filters.maxCapacity, filters.status, filters.sortBy, filters.sortOrder, pagination.current_page, pagination.per_page]);

  const loadFilterOptions = useCallback(async () => {
    try {
      const headers = getAuthHeaders();

      const [categoriesRes, colorsRes, capacitiesRes] = await Promise.all([
        fetch("/api/admin/categories?limit=-1", { headers }),
        fetch("/api/admin/colors?limit=-1", { headers }),
        fetch("/api/admin/capacities?limit=-1", { headers }),
      ]);

      const [categoriesData, colorsData, capacitiesData] = await Promise.all([
        categoriesRes.json(),
        colorsRes.json(),
        capacitiesRes.json(),
      ]);

      dispatchList({
        type: "LOAD_FILTER_OPTIONS_SUCCESS",
        categories:
          categoriesData.success && Array.isArray(categoriesData.data?.items)
            ? categoriesData.data.items
            : [],
        colors:
          colorsData.success && Array.isArray(colorsData.data?.items)
            ? colorsData.data.items
            : [],
        capacities:
          capacitiesData.success && Array.isArray(capacitiesData.data?.items)
            ? capacitiesData.data.items
            : [],
      });
    } catch {
      dispatchList({ type: "LOAD_FILTER_OPTIONS_ERROR" });
    }
  }, [getAuthHeaders]);

  const handleFilterChange = useCallback((field: keyof ProductFilters, value: string) => {
    const next = { ...filters, [field]: value };
    // Sync to URL so filters survive page refresh and can be shared
    const params = new URLSearchParams();
    if (next.search) params.set("search", next.search);
    if (next.category) params.set("category", next.category);
    if (next.color) params.set("color", next.color);
    if (next.minCapacity) params.set("minCapacity", next.minCapacity);
    if (next.maxCapacity) params.set("maxCapacity", next.maxCapacity);
    if (next.status && next.status !== "all") params.set("status", next.status);
    if (next.sortBy && next.sortBy !== "createdAt") params.set("sortBy", next.sortBy);
    if (next.sortOrder && next.sortOrder !== "desc") params.set("sortOrder", next.sortOrder);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    dispatchList({ type: "SET_FILTER", field, value });
  }, [filters, router, pathname]);

  const handleBulkAction = useCallback(async (
    action: "activate" | "deactivate" | "delete"
  ) => {
    if (selectedProducts.length === 0) {
      toast.error("Vui lòng chọn ít nhất một sản phẩm");
      return;
    }

    try {
      dispatchList({ type: "SET_LOADING", loading: true });
      const promises = selectedProducts.map(async (productId) => {
        if (action === "delete") {
          return clientApi.adminDeleteProduct(productId);
        } else {
          // For activate/deactivate, we need to check current status first
          const product = products.find((p) => p.id === productId);
          if (!product) return Promise.resolve();

          const shouldToggle =
            (action === "activate" && !product.isActive) ||
            (action === "deactivate" && product.isActive);

          if (shouldToggle) {
            return clientApi.toggleProductStatus(productId);
          }
          return Promise.resolve();
        }
      });

      await Promise.all(promises);
      invalidateProductDependentCaches();

      toast.success(
        `Đã ${
          action === "delete"
            ? "xóa"
            : action === "activate"
            ? "kích hoạt"
            : "vô hiệu hóa"
        } ${selectedProducts.length} sản phẩm`
      );
      setSelectedProducts([]);
      loadProducts();
    } catch {
      toast.error(
        `Lỗi khi ${
          action === "delete"
            ? "xóa"
            : action === "activate"
            ? "kích hoạt"
            : "vô hiệu hóa"
        } sản phẩm`
      );
    } finally {
      dispatchList({ type: "SET_LOADING", loading: false });
    }
  }, [selectedProducts, products, loadProducts]);

  const handleProductAction = useCallback(async (
    productId: string,
    action: "activate" | "deactivate" | "delete"
  ) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    if (action === "delete") {
      // Show confirmation modal for delete
      setConfirmModal({
        show: true,
        product,
        action: "delete",
      });
      return;
    }

    if (action === "activate" || action === "deactivate") {
      // Show confirmation modal for status toggle
      setConfirmModal({
        show: true,
        product,
        action: "toggle",
      });
      return;
    }
  }, [products]);

  const performProductAction = useCallback(async (
    productId: string,
    action: "activate" | "deactivate" | "delete"
  ) => {
    if (actionLoading) return;

    setActionLoading(`${action}-${productId}`);

    try {
      if (action === "delete") {
        const result = await clientApi.adminDeleteProduct(productId);
        if (result.success) {
          invalidateProductDependentCaches();
          toast.success("Đã xóa sản phẩm thành công");
          loadProducts();
        } else {
          toast.error(result.error || "Có lỗi xảy ra");
        }
        return;
      }

      // Handle toggle status with optimistic updates
      const originalProducts = [...products];

      try {
        // Optimistic update: set the correct isActive status based on action
        const optimisticProducts = products.map((product) =>
          product.id === productId
            ? { ...product, isActive: action === "activate" }
            : product
        );
        setProducts(optimisticProducts);

        const result = await clientApi.toggleProductStatus(productId);

        if (result.success) {
          invalidateProductDependentCaches();
          const actionText =
            action === "activate" ? "kích hoạt" : "vô hiệu hóa";
          toast.success(`Đã ${actionText} sản phẩm thành công`);

          // Update with actual data from server
          if (result.data) {

            const serverUpdatedProducts = optimisticProducts.map((product) =>
              product.id === productId
                ? { ...product, isActive: result.data.isActive }
                : product
            );
            setProducts(serverUpdatedProducts);
          }
        } else {
          // Rollback on API error
          setProducts(originalProducts);
          toast.error(result.error || "Có lỗi xảy ra");
        }
      } catch {
        setProducts(originalProducts);
        toast.error("Có lỗi xảy ra khi thực hiện hành động");
      }
    } catch {
      toast.error("Có lỗi xảy ra");
    } finally {
      setActionLoading(null);
    }
  }, [actionLoading, products, loadProducts, setProducts]);

  const handleCreateProduct = useCallback(() => {
    setEditingProduct(null);
    setIsModalOpen(true);
  }, []);

  const handleEditProduct = useCallback((product: ProductListItem) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingProduct(null);
  }, []);

  const handleModalSuccess = useCallback(() => {
    invalidateProductDependentCaches();
    loadProducts();
  }, [loadProducts]);

  const getProductStatus = useCallback((
    product: ProductListItem
  ): {
    type: "active" | "inactive" | "low-stock" | "out-of-stock";
    label: string;
  } => {
    if (!product.isActive) {
      return { type: "inactive", label: "Không hoạt động" };
    }
    if (product.stock === 0) {
      return { type: "out-of-stock", label: "Hết hàng" };
    }
    if (product.stock <= 1) {
      return { type: "low-stock", label: "Sắp hết hàng" };
    }
    return { type: "active", label: "Hoạt động" };
  }, []);

  const isAllSelected = useMemo(
    () => selectedProducts.length === products.length && products.length > 0,
    [selectedProducts.length, products.length]
  );
  const isIndeterminate = useMemo(
    () => selectedProducts.length > 0 && selectedProducts.length < products.length,
    [selectedProducts.length, products.length]
  );

  // Load products when filters or pagination change
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Load filter options once on mount
  useEffect(() => {
    loadFilterOptions();
  }, [loadFilterOptions]);

  // Cleanup pending request
  useEffect(() => {
    const currentController = productsRequestControllerRef.current;
    return () => {
      if (currentController) {
        currentController.abort();
      }
    };
  }, []);

  return {
    // Data
    products,
    categories,
    colors,
    capacities,

    // State
    loading,
    actionLoading,
    selectedProducts,
    filters,
    pagination,

    // Modal state
    isModalOpen,
    editingProduct,

    // Confirmation modal state
    confirmModal,

    // Actions
    loadProducts,
    loadFilterOptions,
    handleFilterChange,
    handleBulkAction,
    handleProductAction,
    performProductAction,
    handleCreateProduct,
    handleEditProduct,
    handleCloseModal,
    handleModalSuccess,
    getProductStatus,
    setSelectedProducts,
    setPagination,
    setConfirmModal,

    // Selection helpers
    isAllSelected,
    isIndeterminate,
  };
}
