import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import type { Capacity, PaginationMeta } from "@/types";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  fetchCapacitiesThunk,
  toggleCapacityStatusThunk,
  deleteCapacityThunk,
  setSearchQuery,
  setStatusFilter,
  setCurrentPage,
  setCapacitiesDirectly,
} from "@/store/slices/capacitiesSlice";

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

interface ConfirmModal {
  show: boolean;
  capacity: CapacityWithCount | null;
  action: "delete" | "toggle";
}

export interface UseCapacitiesReturn {
  // Data
  capacities: CapacityWithCount[];

  // Pagination
  pagination: PaginationMeta | null;

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

  // Confirmation modal state
  confirmModal: ConfirmModal;

  // Actions
  setSearchQuery: (query: string) => void;
  setStatusFilter: (filter: "all" | "active" | "inactive") => void;
  fetchCapacities: () => Promise<void>;
  handleEdit: (capacity: Capacity) => void;
  handleDelete: (capacity: CapacityWithCount) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleToggleStatus: (capacity: CapacityWithCount) => void;
  performToggleStatus: (capacity: CapacityWithCount) => Promise<void>;
  handleCloseModal: () => void;
  handleAddCapacity: () => void;
  confirmDelete: () => Promise<void>;
  cancelDelete: () => void;
  setFormData: (data: CapacityFormData) => void;
  setConfirmModal: React.Dispatch<React.SetStateAction<ConfirmModal>>;

  // Pagination actions
  onPageChange: (page: number) => void;
}

export function useCapacities(): UseCapacitiesReturn {
  const dispatch = useAppDispatch();
  const {
    items: capacities,
    pagination,
    loading,
    searchQuery,
    statusFilter,
    currentPage,
  } = useAppSelector((state) => state.capacities);

  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

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

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<ConfirmModal>({
    show: false,
    capacity: null,
    action: "toggle",
  });

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const token = useAppSelector((state) => state.auth.token);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

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

  const fetchCapacities = useCallback(async () => {
    dispatch(
      fetchCapacitiesThunk({
        page: currentPage,
        search: debouncedSearchQuery || undefined,
        statusFilter: statusFilter || undefined,
      })
    );
  }, [dispatch, currentPage, debouncedSearchQuery, statusFilter]);

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
    } catch {
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
      const resultAction = await dispatch(
        deleteCapacityThunk(deleteId)
      );

      if (deleteCapacityThunk.fulfilled.match(resultAction)) {
        toast.success("Xóa dung tích thành công");
        fetchCapacities();
        setShowDeleteModal(false);
        setDeleteId(null);
        setDeleteName("");
      } else {
        const errorPayload = resultAction.payload as string;
        toast.error(errorPayload || "Có lỗi xảy ra khi xóa");
      }
    } catch {
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

  const handleToggleStatus = (capacity: CapacityWithCount) => {
    // Nếu đang tắt dung tích có products sử dụng, hiển thị modal xác nhận
    const productCount = capacity._count?.products || 0;
    if (capacity.isActive && productCount > 0) {
      setConfirmModal({
        show: true,
        capacity: capacity,
        action: "toggle",
      });
      return;
    }

    // Nếu không có products hoặc đang kích hoạt lại, thực hiện ngay
    performToggleStatus(capacity);
  };

  const performToggleStatus = async (capacity: CapacityWithCount) => {
    setActionLoading(capacity.id);

    // Store original state for potential rollback
    const originalCapacities = [...capacities];

    // Optimistic update
    const optimisticCapacities = capacities.map((c: typeof capacity) =>
      c.id === capacity.id ? { ...c, isActive: !c.isActive } : c
    );
    dispatch(setCapacitiesDirectly(optimisticCapacities));

    try {
      const resultAction = await dispatch(
        toggleCapacityStatusThunk(capacity)
      );

      if (toggleCapacityStatusThunk.fulfilled.match(resultAction)) {
        toast.success(
          `Đã ${!capacity.isActive ? "kích hoạt" : "tắt"} dung tích "${capacity.name}"`
        );
      } else {
        // Rollback
        dispatch(setCapacitiesDirectly(originalCapacities));
        const errorPayload = resultAction.payload as string;
        toast.error(errorPayload || "Có lỗi xảy ra");
      }
    } catch {
      // Rollback on network error
      dispatch(setCapacitiesDirectly(originalCapacities));
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

  // Pagination handler
  const onPageChange = useCallback((page: number) => {
    dispatch(setCurrentPage(page));
  }, [dispatch]);

  useEffect(() => {
    fetchCapacities();
  }, [fetchCapacities]);

  return {
    // Data
    capacities,
    // Pagination
    pagination,

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

    // Confirmation modal state
    confirmModal,

    // Actions
    setSearchQuery: updateSearchQuery,
    setStatusFilter: updateStatusFilter,
    fetchCapacities,
    handleEdit,
    handleDelete,
    handleSubmit,
    handleToggleStatus,
    performToggleStatus,
    handleCloseModal,
    handleAddCapacity,
    confirmDelete,
    cancelDelete,
    setFormData,
    setConfirmModal,

    // Pagination actions
    onPageChange,
  };
}
