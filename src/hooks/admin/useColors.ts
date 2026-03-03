import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type { Color } from "@/types";

interface ColorWithCount extends Color {
  _count?: {
    productColors: number;
  };
}

interface ColorFormData {
  name: string;
  hexCode: string;
  isActive: boolean;
}

interface ColorFormErrors {
  name?: string;
  hexCode?: string;
  isActive?: string;
}

interface ConfirmModal {
  show: boolean;
  color: ColorWithCount | null;
  action: "toggle" | "delete";
}

export interface UseColorsReturn {
  // Data
  colors: ColorWithCount[];
  filteredColors: ColorWithCount[];

  // State
  loading: boolean;
  searchQuery: string;
  statusFilter: "all" | "active" | "inactive";

  // Modal state
  showModal: boolean;
  editingColor: Color | null;
  formData: ColorFormData;
  formErrors: ColorFormErrors;
  actionLoading: string | null;

  // Confirmation modal state
  confirmModal: ConfirmModal;

  // Actions
  setSearchQuery: (query: string) => void;
  setStatusFilter: (filter: "all" | "active" | "inactive") => void;
  fetchColors: () => Promise<void>;
  handleEdit: (color: ColorWithCount) => void;
  handleDelete: (color: ColorWithCount) => Promise<void>;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleToggleStatus: (color: ColorWithCount) => Promise<void>;
  handleCloseModal: () => void;
  handleAddColor: () => void;
  setFormData: (data: ColorFormData) => void;
  setConfirmModal: (modal: ConfirmModal) => void;
  performToggleStatus: (color: ColorWithCount) => Promise<void>;
  performDelete: (color: ColorWithCount) => Promise<void>;
}

export function useColors(): UseColorsReturn {
  const [colors, setColors] = useState<ColorWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingColor, setEditingColor] = useState<Color | null>(null);
  const [formData, setFormData] = useState<ColorFormData>({
    name: "",
    hexCode: "#000000",
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState<ColorFormErrors>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<ConfirmModal>({
    show: false,
    color: null,
    action: "toggle",
  });

  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem("admin_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchColors = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/colors", {
        headers: getAuthHeaders(),
      });
      const data = await response.json();

      if (data.success) {
        setColors(data.data?.items || []);
      } else {
        toast.error(data.message || "Không thể tải danh sách màu sắc");
      }
    } catch {
      toast.error("Có lỗi xảy ra khi tải màu sắc");
    } finally {
      setLoading(false);
    }
  }, []);

  const validateForm = (): boolean => {
    const errors: ColorFormErrors = {};

    if (!formData.name.trim()) {
      errors.name = "Tên màu là bắt buộc";
    } else if (formData.name.length > 100) {
      errors.name = "Tên màu không được vượt quá 100 ký tự";
    }

    const hexRegex = /^#[0-9A-F]{6}$/i;
    if (!hexRegex.test(formData.hexCode)) {
      errors.hexCode = "Mã màu phải có định dạng #RRGGBB";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setActionLoading("save");
    try {
      const url = editingColor
        ? `/api/admin/colors/${editingColor.id}`
        : "/api/admin/colors";

      const method = editingColor ? "PUT" : "POST";

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
          editingColor ? "Cập nhật màu thành công" : "Tạo màu thành công"
        );
        handleCloseModal();
        fetchColors();
      } else {
        // Xử lý lỗi 409 (conflict) - trùng lặp
        if (response.status === 409) {
          const errorMessage = data.error?.message || "";
          if (errorMessage.includes("name")) {
            setFormErrors({ name: "Tên màu đã tồn tại" });
          } else if (
            errorMessage.includes("hex code") ||
            errorMessage.includes("hexCode")
          ) {
            setFormErrors({ hexCode: "Mã màu này đã được sử dụng" });
          } else {
            setFormErrors({ name: "Thông tin màu đã tồn tại" });
          }
          toast.error("Thông tin màu bị trùng lặp");
        } else {
          toast.error(data.error?.message || data.message || "Có lỗi xảy ra");
        }
      }
    } catch {
      toast.error("Có lỗi xảy ra khi lưu màu");
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = (color: ColorWithCount) => {
    setEditingColor(color);
    setFormData({
      name: color.name,
      hexCode: color.hexCode,
      isActive: color.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (color: ColorWithCount) => {
    // Luôn hiển thị confirmation modal
    setConfirmModal({
      show: true,
      color: color,
      action: "delete",
    });
  };

  const performDelete = async (color: ColorWithCount) => {
    setActionLoading(`delete-${color.id}`);
    try {
      const response = await fetch(`/api/admin/colors/${color.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Đã xóa màu "${color.name}" thành công`);
        fetchColors();
      } else {
        toast.error(data.message || "Có lỗi xảy ra khi xóa");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa màu");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (color: ColorWithCount) => {
    // Nếu tắt màu đang có products sử dụng, hiển thị modal xác nhận
    const productCount = color._count?.productColors || 0;
    if (color.isActive && productCount > 0) {
      setConfirmModal({
        show: true,
        color: color,
        action: "toggle",
      });
      return;
    }

    // Nếu không có products hoặc đang kích hoạt lại, thực hiện ngay
    await performToggleStatus(color);
  };

  const performToggleStatus = async (color: ColorWithCount) => {
    setActionLoading(`toggle-${color.id}`);

    // Optimistic update - cập nhật UI ngay lập tức
    const updatedColors = colors.map((c) =>
      c.id === color.id ? { ...c, isActive: !c.isActive } : c
    );
    setColors(updatedColors);

    try {
      const response = await fetch(
        `/api/admin/colors/${color.id}/toggle-status`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (data.success) {
        const statusText = !color.isActive ? "kích hoạt" : "tắt";
        const productCount = color._count?.productColors || 0;
        const productInfo =
          productCount > 0 ? ` (${productCount} sản phẩm vẫn giữ màu này)` : "";
        toast.success(`Đã ${statusText} màu "${color.name}"${productInfo}`);
      } else {
        // Rollback nếu có lỗi
        setColors(colors);
        toast.error(data.error?.message || data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      // Rollback nếu có lỗi network
      setColors(colors);

      toast.error("Có lỗi xảy ra khi thay đổi trạng thái màu");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingColor(null);
    setFormData({
      name: "",
      hexCode: "#000000",
      isActive: true,
    });
    setFormErrors({});
  };

  const handleAddColor = () => {
    handleCloseModal();
    setShowModal(true);
  };

  const filteredColors = colors.filter((color) => {
    const matchesSearch = color.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && color.isActive) ||
      (statusFilter === "inactive" && !color.isActive);

    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    fetchColors();
  }, [fetchColors]);

  return {
    // Data
    colors,
    filteredColors,

    // State
    loading,
    searchQuery,
    statusFilter,

    // Modal state
    showModal,
    editingColor,
    formData,
    formErrors,
    actionLoading,

    // Confirmation modal state
    confirmModal,

    // Actions
    setSearchQuery,
    setStatusFilter,
    fetchColors,
    handleEdit,
    handleDelete,
    handleSubmit,
    handleToggleStatus,
    handleCloseModal,
    handleAddColor,
    setFormData,
    setConfirmModal,
    performToggleStatus,
    performDelete,
  };
}
