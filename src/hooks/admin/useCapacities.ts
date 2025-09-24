import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type { Capacity } from "@/types";

interface CapacityWithCount extends Capacity {
  _count?: {
    products: number;
  };
}

interface CapacityFormData {
  name: string;
  volumeMl: number;
  isActive: boolean;
}

interface CapacityFormErrors {
  name?: string;
  volumeMl?: string;
  isActive?: string;
}

export interface UseCapacitiesReturn {
  // Data
  capacities: CapacityWithCount[];
  filteredCapacities: CapacityWithCount[];

  // State
  loading: boolean;
  searchQuery: string;
  statusFilter: "all" | "active" | "inactive";

  // Modal state
  showModal: boolean;
  editingCapacity: Capacity | null;
  formData: CapacityFormData;
  formErrors: CapacityFormErrors;
  actionLoading: string | null;

  // Delete modal state
  showDeleteModal: boolean;
  deleteId: string | null;
  deleteName: string;

  // Actions
  setSearchQuery: (query: string) => void;
  setStatusFilter: (filter: "all" | "active" | "inactive") => void;
  fetchCapacities: () => Promise<void>;
  handleEdit: (capacity: Capacity) => void;
  handleDelete: (capacity: CapacityWithCount) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleToggleStatus: (id: string) => Promise<void>;
  handleCloseModal: () => void;
  handleAddCapacity: () => void;
  confirmDelete: () => Promise<void>;
  cancelDelete: () => void;
  setFormData: (data: CapacityFormData) => void;
}

export function useCapacities(): UseCapacitiesReturn {
  const [capacities, setCapacities] = useState<CapacityWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingCapacity, setEditingCapacity] = useState<Capacity | null>(null);
  const [formData, setFormData] = useState<CapacityFormData>({
    name: "",
    volumeMl: 0,
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState<CapacityFormErrors>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState<string>("");

  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem("admin_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchCapacities = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/capacities", {
        headers: getAuthHeaders(),
      });
      const data = await response.json();

      if (data.success) {
        setCapacities(data.data?.items || []);
      } else {
        console.error("API Error:", data);
        toast.error(data.message || "Không thể tải danh sách dung tích");
      }
    } catch (error) {
      console.error("Error fetching capacities:", error);
      toast.error("Có lỗi xảy ra khi tải dung tích");
    } finally {
      setLoading(false);
    }
  }, []);

  const validateForm = (): boolean => {
    const errors: CapacityFormErrors = {};

    if (!formData.name.trim()) {
      errors.name = "Tên dung tích là bắt buộc";
    } else if (formData.name.length > 100) {
      errors.name = "Tên dung tích không được vượt quá 100 ký tự";
    }

    if (!formData.volumeMl || formData.volumeMl <= 0) {
      errors.volumeMl = "Dung tích phải lớn hơn 0";
    } else if (formData.volumeMl > 10000) {
      errors.volumeMl = "Dung tích không được vượt quá 10,000ml";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setActionLoading("submit");

      const url = editingCapacity
        ? `/api/admin/capacities/${editingCapacity.id}`
        : "/api/admin/capacities";

      const method = editingCapacity ? "PUT" : "POST";

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
          editingCapacity
            ? "Cập nhật dung tích thành công"
            : "Tạo dung tích thành công"
        );
        handleCloseModal();
        fetchCapacities();
      } else {
        toast.error(data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error saving capacity:", error);
      toast.error("Có lỗi xảy ra khi lưu dung tích");
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = (capacity: Capacity) => {
    setEditingCapacity(capacity);
    setFormData({
      name: capacity.name,
      volumeMl: capacity.volumeMl,
      isActive: capacity.isActive,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleDelete = (capacity: CapacityWithCount) => {
    setDeleteId(capacity.id);
    setDeleteName(capacity.name);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      setActionLoading(deleteId);
      const response = await fetch(`/api/admin/capacities/${deleteId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Xóa dung tích thành công");
        fetchCapacities();
        setShowDeleteModal(false);
        setDeleteId(null);
        setDeleteName("");
      } else {
        toast.error(data.message || "Có lỗi xảy ra khi xóa");
      }
    } catch (error) {
      console.error("Error deleting capacity:", error);
      toast.error("Có lỗi xảy ra khi xóa dung tích");
    } finally {
      setActionLoading(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
    setDeleteName("");
  };

  const handleToggleStatus = async (id: string) => {
    const capacity = capacities.find((c) => c.id === id);
    if (!capacity) return;

    setActionLoading(id);

    // Optimistic update
    const updatedCapacities = capacities.map((c) =>
      c.id === id ? { ...c, isActive: !c.isActive } : c
    );
    setCapacities(updatedCapacities);

    try {
      const response = await fetch(
        `/api/admin/capacities/${id}/toggle-status`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success(
          `Đã ${!capacity.isActive ? "kích hoạt" : "tắt"} dung tích "${
            capacity.name
          }"`
        );
      } else {
        // Rollback on error
        setCapacities(capacities);
        toast.error(data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      // Rollback on network error
      setCapacities(capacities);
      console.error("Error toggling status:", error);
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCapacity(null);
    setFormData({
      name: "",
      volumeMl: 0,
      isActive: true,
    });
    setFormErrors({});
  };

  const handleAddCapacity = () => {
    handleCloseModal();
    setShowModal(true);
  };

  const filteredCapacities = capacities.filter((capacity) => {
    const matchesSearch = capacity.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && capacity.isActive) ||
      (statusFilter === "inactive" && !capacity.isActive);

    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    fetchCapacities();
  }, [fetchCapacities]);

  return {
    // Data
    capacities,
    filteredCapacities,

    // State
    loading,
    searchQuery,
    statusFilter,

    // Modal state
    showModal,
    editingCapacity,
    formData,
    formErrors,
    actionLoading,

    // Delete modal state
    showDeleteModal,
    deleteId,
    deleteName,

    // Actions
    setSearchQuery,
    setStatusFilter,
    fetchCapacities,
    handleEdit,
    handleDelete,
    handleSubmit,
    handleToggleStatus,
    handleCloseModal,
    handleAddCapacity,
    confirmDelete,
    cancelDelete,
    setFormData,
  };
}
