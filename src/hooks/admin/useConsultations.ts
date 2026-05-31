"use client";

import { useState, useEffect, useCallback, useReducer } from "react";
import { useAppSelector } from "@/store";
import type { Consultation, ConsultationStatus, PaginationMeta } from "@/types";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/api-config";

interface ConsultationFilters {
  status: string;
  dateFrom: string;
  dateTo: string;
  search: string;
}

const DEFAULT_PAGINATION: PaginationMeta = {
  current_page: 1,
  has_next: false,
  has_prev: false,
  per_page: 10,
  total_items: 0,
  total_pages: 0,
};

interface ConsultationsDataState {
  consultations: Consultation[];
  loading: boolean;
  pagination: PaginationMeta;
}

type ConsultationsDataAction =
  | { type: "FETCH_START" }
  | {
      type: "FETCH_SUCCESS";
      consultations: Consultation[];
      pagination?: PaginationMeta;
    }
  | { type: "FETCH_ERROR" }
  | { type: "SET_PAGINATION"; payload: React.SetStateAction<PaginationMeta> }
  | { type: "REMOVE_CONSULTATION"; payload: string };

const initialConsultationsDataState: ConsultationsDataState = {
  consultations: [],
  loading: true,
  pagination: DEFAULT_PAGINATION,
};

function resolveStateValue<T>(value: React.SetStateAction<T>, current: T): T {
  return typeof value === "function"
    ? (value as (previous: T) => T)(current)
    : value;
}

function consultationsDataReducer(
  state: ConsultationsDataState,
  action: ConsultationsDataAction
): ConsultationsDataState {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return {
        consultations: action.consultations,
        loading: false,
        pagination: action.pagination || state.pagination,
      };
    case "FETCH_ERROR":
      return { ...state, loading: false };
    case "SET_PAGINATION":
      return {
        ...state,
        pagination: resolveStateValue(action.payload, state.pagination),
      };
    case "REMOVE_CONSULTATION":
      return {
        ...state,
        consultations: state.consultations.filter(
          (consultation) => consultation.id !== action.payload
        ),
      };
    default:
      return state;
  }
}

export interface UseConsultationsReturn {
  // Data
  consultations: Consultation[];

  // State
  loading: boolean;
  selectedConsultation: Consultation | null;
  filters: ConsultationFilters;
  pagination: PaginationMeta;

  // Modal state
  isDetailModalOpen: boolean;
  isDeleteModalOpen: boolean;
  consultationToDelete: string | null;
  adminResponse: string;
  selectedStatus: ConsultationStatus;
  actionLoading: string | null;

  // Actions
  handleFilterChange: (field: keyof ConsultationFilters, value: string) => void;
  handleViewConsultation: (consultation: Consultation) => void;
  handleCloseDetailModal: () => void;
  handleUpdateConsultation: () => Promise<void>;
  handleDeleteConsultation: (consultationId: string) => void;
  confirmDeleteConsultation: () => Promise<void>;
  cancelDeleteConsultation: () => void;
  setPagination: React.Dispatch<React.SetStateAction<PaginationMeta>>;
  setAdminResponse: React.Dispatch<React.SetStateAction<string>>;
  setSelectedStatus: React.Dispatch<React.SetStateAction<ConsultationStatus>>;
}

export function useConsultations(): UseConsultationsReturn {
  const apiBaseUrl = getApiUrl("");
  const { token } = useAppSelector((state) => state.auth);
  const [{ consultations, loading, pagination }, dispatchData] = useReducer(
    consultationsDataReducer,
    initialConsultationsDataState
  );
  const [selectedConsultation, setSelectedConsultation] =
    useState<Consultation | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [consultationToDelete, setConsultationToDelete] = useState<
    string | null
  >(null);
  const [adminResponse, setAdminResponse] = useState("");
  const [selectedStatus, setSelectedStatus] =
    useState<ConsultationStatus>("PENDING");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filters, setFilters] = useState<ConsultationFilters>({
    status: "",
    dateFrom: "",
    dateTo: "",
    search: "",
  });

  const setPagination = useCallback(
    (value: React.SetStateAction<PaginationMeta>) => {
      dispatchData({ type: "SET_PAGINATION", payload: value });
    },
    []
  );

  const getAuthHeaders = useCallback((): Record<string, string> => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  const fetchConsultations = useCallback(async () => {
    try {
      dispatchData({ type: "FETCH_START" });
      const params = new URLSearchParams({
        page: (pagination.current_page || 1).toString(),
        limit: (pagination.per_page || 10).toString(),
        ...(filters.status && { status: filters.status }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
        ...(filters.search && { search: filters.search }),
      });

      const headers = getAuthHeaders();


      const response = await fetch(`${apiBaseUrl}/admin/consultations?${params}`, {
        headers,
      });
      const data = await response.json();

      if (data.success) {
        dispatchData({
          type: "FETCH_SUCCESS",
          consultations: data.data?.items || [],
          pagination: data.data?.pagination,
        });
      } else {

        toast.error(data.message || "Không thể tải danh sách tư vấn");
      }
    } catch {
      toast.error("Có lỗi xảy ra khi tải danh sách tư vấn");
      dispatchData({ type: "FETCH_ERROR" });
    }
  }, [apiBaseUrl, filters, pagination.current_page, pagination.per_page, getAuthHeaders]);

  useEffect(() => {
    fetchConsultations();
  }, [fetchConsultations]);

  const handleUpdateConsultation = useCallback(async () => {
    if (!selectedConsultation) return;

    try {
      setActionLoading("response");

      const updateData = {
        status: selectedStatus,
        notes: adminResponse.trim() || null,
      };

      const response = await fetch(
        `${apiBaseUrl}/admin/consultations/${selectedConsultation.id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(updateData),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Cập nhật consultation thành công!");
        setAdminResponse("");
        fetchConsultations();
        setIsDetailModalOpen(false);
        setSelectedConsultation(null);
      } else {
        toast.error(data.message || "Có lỗi xảy ra");
      }
    } catch {
      toast.error("Có lỗi xảy ra khi cập nhật consultation");
    } finally {
      setActionLoading(null);
    }
  }, [selectedConsultation, selectedStatus, adminResponse, apiBaseUrl, getAuthHeaders, fetchConsultations]);

  const handleViewConsultation = useCallback((consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setAdminResponse(consultation.notes || "");
    setSelectedStatus(consultation.status);
    setIsDetailModalOpen(true);
  }, []);

  const handleCloseDetailModal = useCallback(() => {
    setIsDetailModalOpen(false);
    setSelectedConsultation(null);
    setAdminResponse("");
  }, []);

  const handleFilterChange = useCallback((
    field: keyof ConsultationFilters,
    value: string
  ) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  }, [setPagination]);

  const handleDeleteConsultation = useCallback((consultationId: string) => {
    setConsultationToDelete(consultationId);
    setIsDeleteModalOpen(true);
  }, []);

  const confirmDeleteConsultation = useCallback(async () => {
    if (!consultationToDelete) return;

    try {
      setActionLoading("delete");

      const response = await fetch(
        `${apiBaseUrl}/admin/consultations/${consultationToDelete}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Xóa consultation thành công");
        dispatchData({
          type: "REMOVE_CONSULTATION",
          payload: consultationToDelete,
        });
        setIsDeleteModalOpen(false);
        setConsultationToDelete(null);
      } else {
        toast.error(data.message || "Có lỗi xảy ra khi xóa consultation");
      }
    } catch {
      toast.error("Có lỗi xảy ra khi xóa consultation");
    } finally {
      setActionLoading(null);
    }
  }, [consultationToDelete, apiBaseUrl, getAuthHeaders]);

  const cancelDeleteConsultation = useCallback(() => {
    setIsDeleteModalOpen(false);
    setConsultationToDelete(null);
  }, []);

  return {
    // Data
    consultations,

    // State
    loading,
    selectedConsultation,
    filters,
    pagination,

    // Modal state
    isDetailModalOpen,
    isDeleteModalOpen,
    consultationToDelete,
    adminResponse,
    selectedStatus,
    actionLoading,

    // Actions
    handleFilterChange,
    handleViewConsultation,
    handleCloseDetailModal,
    handleUpdateConsultation,
    handleDeleteConsultation,
    confirmDeleteConsultation,
    cancelDeleteConsultation,
    setPagination,
    setAdminResponse,
    setSelectedStatus,
  };
}
