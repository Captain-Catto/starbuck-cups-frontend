"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppSelector } from "@/store";
import type { Consultation, ConsultationStatus, PaginationMeta } from "@/types";
import { toast } from "sonner";

interface ConsultationFilters {
  status: string;
  dateFrom: string;
  dateTo: string;
  search: string;
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
  const { token } = useAppSelector((state) => state.auth);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
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

  const [pagination, setPagination] = useState<PaginationMeta>({
    current_page: 1,
    has_next: false,
    has_prev: false,
    per_page: 10,
    total_items: 0,
    total_pages: 0,
  });

  const getAuthHeaders = useCallback((): Record<string, string> => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  const fetchConsultations = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: (pagination.current_page || 1).toString(),
        limit: (pagination.per_page || 10).toString(),
        ...(filters.status && { status: filters.status }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
        ...(filters.search && { search: filters.search }),
      });

      const headers = getAuthHeaders();


      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
      const response = await fetch(`${apiUrl}/admin/consultations?${params}`, {
        headers,
      });
      const data = await response.json();

      if (data.success) {
        setConsultations(data.data?.items || []);
        if (data.data?.pagination) {
          setPagination(data.data.pagination);
        }
      } else {

        toast.error(data.message || "Không thể tải danh sách tư vấn");
      }
    } catch (error) {

      toast.error("Có lỗi xảy ra khi tải danh sách tư vấn");
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.current_page, pagination.per_page, getAuthHeaders]);

  useEffect(() => {
    fetchConsultations();
  }, [fetchConsultations]);

  const handleUpdateConsultation = async () => {
    if (!selectedConsultation) return;

    try {
      setActionLoading("response");

      // Update status and notes
      const updateData = {
        status: selectedStatus,
        notes: adminResponse.trim() || null,
      };


      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
      const response = await fetch(
        `${apiUrl}/admin/consultations/${selectedConsultation.id}/status`,
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
    } catch (error) {

      toast.error("Có lỗi xảy ra khi cập nhật consultation");
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewConsultation = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setAdminResponse(consultation.notes || "");
    setSelectedStatus(consultation.status);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedConsultation(null);
    setAdminResponse("");
  };

  const handleFilterChange = (
    field: keyof ConsultationFilters,
    value: string
  ) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleDeleteConsultation = (consultationId: string) => {
    setConsultationToDelete(consultationId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteConsultation = async () => {
    if (!consultationToDelete) return;

    try {
      setActionLoading("delete");

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
      const response = await fetch(
        `${apiUrl}/consultations/${consultationToDelete}`,
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
        setConsultations((prev) =>
          prev.filter((c) => c.id !== consultationToDelete)
        );
        setIsDeleteModalOpen(false);
        setConsultationToDelete(null);
      } else {
        toast.error(data.message || "Có lỗi xảy ra khi xóa consultation");
      }
    } catch (error) {

      toast.error("Có lỗi xảy ra khi xóa consultation");
    } finally {
      setActionLoading(null);
    }
  };

  const cancelDeleteConsultation = () => {
    setIsDeleteModalOpen(false);
    setConsultationToDelete(null);
  };

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
