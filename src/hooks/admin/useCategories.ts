import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type { Category } from "@/types";

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
  filteredCategories: CategoryWithCount[];

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
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

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

  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem("admin_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/categories", {
        headers: getAuthHeaders(),
      });
      const data = await response.json();

      if (data.success) {
        setCategories(data.data?.items || []);
      } else {
        console.error("API Error:", data);
        toast.error(data.message || "Không thể tải danh sách danh mục");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Có lỗi xảy ra khi tải danh mục");
    } finally {
      setLoading(false);
    }
  }, []);

  const validateForm = (): boolean => {
    const errors: CategoryFormErrors = {};

    if (!formData.name.trim()) {
      errors.name = "Tên danh mục là bắt buộc";
    } else if (formData.name.length > 100) {
      errors.name = "Tên danh mục không được vượt quá 100 ký tự";
    }

    if (formData.description && formData.description.length > 500) {
      errors.description = "Mô tả không được vượt quá 500 ký tự";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

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
    } catch (error) {
      console.error("Error saving category:", error);
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
    // Luôn hiển thị confirmation modal
    setConfirmModal({
      show: true,
      category,
      action: "delete",
    });
  };

  const performDelete = async (category: CategoryWithCount) => {
    setActionLoading(`delete-${category.id}`);
    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Xóa danh mục thành công");
        fetchCategories();
      } else {
        // Xử lý lỗi 409 đặc biệt
        if (response.status === 409) {
          toast.error(
            `Không thể xóa danh mục: ${
              data.error?.message ||
              data.message ||
              "Danh mục đang được sử dụng"
            }`
          );
        } else {
          toast.error(
            data.error?.message || data.message || "Có lỗi xảy ra khi xóa"
          );
        }
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Có lỗi xảy ra khi xóa danh mục");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (category: CategoryWithCount) => {
    // Nếu tắt danh mục đang có products sử dụng, hiển thị modal xác nhận
    const productCount = category._count?.products || 0;
    if (category.isActive && productCount > 0) {
      setConfirmModal({
        show: true,
        category: category,
        action: "toggle",
      });
      return;
    }

    // Nếu không có products hoặc đang kích hoạt, thực hiện ngay
    await performToggleStatus(category);
  };

  const performToggleStatus = async (category: CategoryWithCount) => {
    setActionLoading(`toggle-${category.id}`);

    // Optimistic update
    const updatedCategories = categories.map((c) =>
      c.id === category.id ? { ...c, isActive: !c.isActive } : c
    );
    setCategories(updatedCategories);

    try {
      const response = await fetch(
        `/api/admin/categories/${category.id}/toggle-status`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (data.success) {
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
        // Rollback on error
        setCategories(categories);
        toast.error(data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      // Rollback on network error
      setCategories(categories);
      console.error("Error toggling status:", error);
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

  const filteredCategories = categories.filter((category) => {
    const matchesSearch = category.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && category.isActive) ||
      (statusFilter === "inactive" && !category.isActive);

    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    // Data
    categories,
    filteredCategories,

    // State
    loading,
    searchQuery,
    statusFilter,

    // Modal state
    showModal,
    editingCategory,
    formData,
    formErrors,
    actionLoading,

    // Confirmation modal state
    confirmModal,

    // Actions
    setSearchQuery,
    setStatusFilter,
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
  };
}
