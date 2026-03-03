import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import type {
  Product,
  Category,
  Color,
  Capacity,
  PaginationMeta,
} from "@/types";
import { apiService } from "@/lib/api";

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

export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [capacities, setCapacities] = useState<Capacity[]>([]);
  const [loading, setLoading] = useState(true);
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

  const [filters, setFilters] = useState<ProductFilters>({
    search: "",
    category: "",
    color: "",
    minCapacity: "",
    maxCapacity: "",
    status: "all",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Debounced search query
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [pagination, setPagination] = useState<PaginationMeta>({
    current_page: 1,
    has_next: false,
    has_prev: false,
    per_page: 10,
    total_items: 0,
    total_pages: 0,
  });

  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem("admin_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Debounce search query (500ms delay)
  useEffect(() => {
    if (searchDebounceTimerRef.current) {
      clearTimeout(searchDebounceTimerRef.current);
    }

    searchDebounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 500);

    return () => {
      if (searchDebounceTimerRef.current) {
        clearTimeout(searchDebounceTimerRef.current);
      }
    };
  }, [filters.search]);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);

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

        setProducts(mappedProducts);
        if (data.data?.pagination) {
          setPagination(data.data.pagination);
        }
      } else {

        toast.error(data.message || "Không thể tải danh sách sản phẩm");
      }
    } catch (error) {

      toast.error("Có lỗi xảy ra khi tải sản phẩm");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters.category, filters.color, filters.minCapacity, filters.maxCapacity, filters.status, filters.sortBy, filters.sortOrder, pagination.current_page, pagination.per_page]);

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

      if (categoriesData.success) {
        const cats = Array.isArray(categoriesData.data?.items)
          ? categoriesData.data.items
          : [];
        setCategories(cats);
      }
      if (colorsData.success) {
        const cols = Array.isArray(colorsData.data?.items)
          ? colorsData.data.items
          : [];
        setColors(cols);
      }
      if (capacitiesData.success) {
        const caps = Array.isArray(capacitiesData.data?.items)
          ? capacitiesData.data.items
          : [];
        setCapacities(caps);
      }
    } catch (error) {

      // Set empty arrays as fallback
      setCategories([]);
      setColors([]);
      setCapacities([]);
    }
  }, []);

  const handleFilterChange = (field: keyof ProductFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleBulkAction = async (
    action: "activate" | "deactivate" | "delete"
  ) => {
    if (selectedProducts.length === 0) {
      toast.error("Vui lòng chọn ít nhất một sản phẩm");
      return;
    }

    try {
      setLoading(true);
      const promises = selectedProducts.map(async (productId) => {
        if (action === "delete") {
          return apiService.adminDeleteProduct(productId);
        } else {
          // For activate/deactivate, we need to check current status first
          const product = products.find((p) => p.id === productId);
          if (!product) return Promise.resolve();

          const shouldToggle =
            (action === "activate" && !product.isActive) ||
            (action === "deactivate" && product.isActive);

          if (shouldToggle) {
            return apiService.toggleProductStatus(productId);
          }
          return Promise.resolve();
        }
      });

      await Promise.all(promises);

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
    } catch (error) {

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
      setLoading(false);
    }
  };

  const handleProductAction = async (
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
  };

  const performProductAction = async (
    productId: string,
    action: "activate" | "deactivate" | "delete"
  ) => {
    // Prevent double clicks by checking if already loading
    if (actionLoading) {

      return;
    }

    setActionLoading(`${action}-${productId}`);

    try {
      if (action === "delete") {
        const result = await apiService.adminDeleteProduct(productId);
        if (result.success) {
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

        const result = await apiService.toggleProductStatus(productId);

        if (result.success) {
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
      } catch (toggleError) {
        // Rollback on network error
        setProducts(originalProducts);

        toast.error("Có lỗi xảy ra khi thực hiện hành động");
      }
    } catch (error) {

      toast.error("Có lỗi xảy ra");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: ProductListItem) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleModalSuccess = () => {
    loadProducts();
  };

  const getProductStatus = (
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
  };

  const isAllSelected =
    selectedProducts.length === products.length && products.length > 0;
  const isIndeterminate =
    selectedProducts.length > 0 && selectedProducts.length < products.length;

  // Load data on component mount
  useEffect(() => {
    loadProducts();
    loadFilterOptions();
  }, [loadProducts, loadFilterOptions]);

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
