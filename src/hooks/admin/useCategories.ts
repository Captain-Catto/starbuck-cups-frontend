import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import type { Category } from "@/types";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  fetchCategoriesThunk,
  toggleCategoryStatusThunk,
  deleteCategoryThunk,
  setSearchQuery,
  setStatusFilter,
  setCurrentPage,
  setCategoriesDirectly,
  type CategoryPagination,
  type CategoryStatusFilter,
} from "@/store/slices/categoriesSlice";

interface CategoryWithCount extends Category {
  _count?: {
    products: number;
  };
}

interface CategoryFormData {
  name: string;
  description: string;
  isActive: boolean;
}

interface CategoryFormErrors {
  name?: string;
  description?: string;
  isActive?: string;
}

interface ConfirmModal {
  show: boolean;
  category: CategoryWithCount | null;
  action: "toggle" | "delete";
}

export interface UseCategoriesReturn {
  // Data
  categories: CategoryWithCount[];

  // Pagination
  pagination: CategoryPagination | null;

  // State
  loading: boolean;
  searchQuery: string;
  statusFilter: "all" | "active" | "inactive";

  // Modal state
  showModal: boolean;
  editingCategory: Category | null;
  formData: CategoryFormData;
  formErrors: CategoryFormErrors;
  actionLoading: string | null;

  // Confirmation modal state
  confirmModal: ConfirmModal;

  // Actions
  setSearchQuery: (query: string) => void;
  setStatusFilter: (filter: "all" | "active" | "inactive") => void;
  fetchCategories: () => Promise<void>;
  handleEdit: (category: Category) => void;
  handleDelete: (category: CategoryWithCount) => Promise<void>;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleToggleStatus: (category: CategoryWithCount) => Promise<void>;
  handleCloseModal: () => void;
  handleAddCategory: () => void;
  setFormData: (data: CategoryFormData) => void;
  setConfirmModal: (modal: ConfirmModal) => void;
  performToggleStatus: (category: CategoryWithCount) => Promise<void>;
  performDelete: (category: CategoryWithCount) => Promise<void>;

  // Pagination actions
  onPageChange: (page: number) => void;
}

export function useCategories(): UseCategoriesReturn {
  const dispatch = useAppDispatch();
  const {
    items: categories,
    pagination,
    loading,
    searchQuery,
    statusFilter,
    currentPage,
  } = useAppSelector((state) => state.categories);

  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState<CategoryFormErrors>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<ConfirmModal>({
    show: false,
    category: null,
    action: "toggle",
  });

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const token = useAppSelector((state) => state.auth.token);

  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery]);

  const updateSearchQuery = useCallback((query: string) => {
    dispatch(setSearchQuery(query));
  }, [dispatch]);

  const updateStatusFilter = useCallback(
    (filter: "all" | "active" | "inactive") => {
      dispatch(setStatusFilter(filter));
    },
    [dispatch]
  );

  const fetchCategories = useCallback(async () => {
    dispatch(
      fetchCategoriesThunk({
        page: currentPage,
        search: debouncedSearchQuery || undefined,
        statusFilter: statusFilter || undefined,
      })
    );
  }, [dispatch, currentPage, debouncedSearchQuery, statusFilter]);

  const validateForm = (): boolean => {
    const errors: CategoryFormErrors = {};

    if (!formData.name.trim()) {
      errors.name = "Tên danh mục là bắt buộc";
    } else if (formData.name.length > 100) {
      errors.name = "Tên danh mục không được vượt quá 100 ký tự";
    }

    if (formData.description && formData.description.length > 1500) {
      errors.description = "Mô tả không được vượt quá 1500 ký tự";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getAuthHeaders = useCallback((): Record<string, string> => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setActionLoading("submit");

      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : "/api/admin/categories";

      const method = editingCategory ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          editingCategory
            ? "Cập nhật danh mục thành công"
            : "Tạo danh mục thành công"
        );
        handleCloseModal();
        fetchCategories();
      } else {
        toast.error(data.message || "Có lỗi xảy ra");
      }
    } catch {
      toast.error("Có lỗi xảy ra khi lưu danh mục");
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      isActive: category.isActive,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleDelete = async (category: CategoryWithCount) => {
    setConfirmModal({
      show: true,
      category,
      action: "delete",
    });
  };

  const performDelete = async (category: CategoryWithCount) => {
    setActionLoading(`delete-${category.id}`);
    try {
      const resultAction = await dispatch(
        deleteCategoryThunk(category.id)
      );

      if (deleteCategoryThunk.fulfilled.match(resultAction)) {
        toast.success("Xóa danh mục thành công");
        fetchCategories();
      } else {
        const errorPayload = resultAction.payload as string;
        if (errorPayload && errorPayload.includes("409")) {
          toast.error("Không thể xóa danh mục: Danh mục đang được sử dụng");
        } else {
          toast.error(errorPayload || "Có lỗi xảy ra khi xóa");
        }
      }
    } catch {
      toast.error("Có lỗi xảy ra khi xóa danh mục");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (category: CategoryWithCount) => {
    const productCount = category._count?.products || 0;
    if (category.isActive && productCount > 0) {
      setConfirmModal({
        show: true,
        category: category,
        action: "toggle",
      });
      return;
    }

    await performToggleStatus(category);
  };

  const performToggleStatus = async (category: CategoryWithCount) => {
    setActionLoading(`toggle-${category.id}`);

    // Store original state for potential rollback
    const originalCategories = [...categories];

    // Optimistic update
    const optimisticCategories = categories.map((c: typeof category) =>
      c.id === category.id ? { ...c, isActive: !c.isActive } : c
    );
    dispatch(setCategoriesDirectly(optimisticCategories));

    try {
      const resultAction = await dispatch(
        toggleCategoryStatusThunk(category)
      );

      if (toggleCategoryStatusThunk.fulfilled.match(resultAction)) {
        const statusText = !category.isActive ? "kích hoạt" : "tắt";
        const productCount = category._count?.products || 0;
        const productInfo =
          productCount > 0
            ? ` (${productCount} sản phẩm vẫn giữ danh mục này)`
            : "";
        toast.success(
          `Đã ${statusText} danh mục "${category.name}"${productInfo}`
        );
      } else {
        // Rollback
        dispatch(setCategoriesDirectly(originalCategories));
        const errorPayload = resultAction.payload as string;
        toast.error(errorPayload || "Có lỗi xảy ra");
      }
    } catch {
      // Rollback on network error
      dispatch(setCategoriesDirectly(originalCategories));
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name: "",
      description: "",
      isActive: true,
    });
    setFormErrors({});
  };

  const handleAddCategory = () => {
    handleCloseModal();
    setShowModal(true);
  };

  const onPageChange = useCallback(
    (page: number) => {
      dispatch(setCurrentPage(page));
    },
    [dispatch]
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    pagination,
    loading,
    searchQuery,
    statusFilter,
    showModal,
    editingCategory,
    formData,
    formErrors,
    actionLoading,
    confirmModal,
    setSearchQuery: updateSearchQuery,
    setStatusFilter: updateStatusFilter,
    fetchCategories,
    handleEdit,
    handleDelete,
    handleSubmit,
    handleToggleStatus,
    handleCloseModal,
    handleAddCategory,
    setFormData,
    setConfirmModal,
    performToggleStatus,
    performDelete,
    onPageChange,
  };
}
