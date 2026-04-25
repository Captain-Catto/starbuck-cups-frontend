"use client";

import { useConsultations } from "@/hooks/admin/useConsultations";
import { PageHeader } from "@/components/admin/PageHeader";
import { ConsultationsFilters } from "@/components/admin/consultations/ConsultationsFilters";
import { ConsultationsTable } from "@/components/admin/consultations/ConsultationsTable";
import { ConsultationDetailModal } from "@/components/admin/consultations/ConsultationDetailModal";
import { ConsultationDeleteModal } from "@/components/admin/consultations/ConsultationDeleteModal";

export default function ConsultationsManagement() {
  const {
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
  } = useConsultations();

  return (
    <div className="space-y-6 bg-gray-900 min-h-screen p-6">
      <PageHeader
        title="Quản lý tư vấn khách hàng"
        description="Xử lý các yêu cầu tư vấn từ khách hàng qua Messenger"
      />

      {/* Filters */}
      <ConsultationsFilters
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Consultations Table */}
      <ConsultationsTable
        consultations={consultations}
        loading={loading}
        pagination={pagination}
        onViewConsultation={handleViewConsultation}
        onDeleteConsultation={handleDeleteConsultation}
        onPageChange={(page) =>
          setPagination((prev) => ({ ...prev, current_page: page }))
        }
      />

      {/* Consultation Detail Modal */}
      <ConsultationDetailModal
        isOpen={isDetailModalOpen}
        consultation={selectedConsultation}
        adminResponse={adminResponse}
        selectedStatus={selectedStatus}
        actionLoading={actionLoading}
        onClose={handleCloseDetailModal}
        onUpdate={handleUpdateConsultation}
        onAdminResponseChange={setAdminResponse}
        onStatusChange={setSelectedStatus}
      />

      {/* Delete Confirmation Modal */}
      <ConsultationDeleteModal
        isOpen={isDeleteModalOpen}
        actionLoading={actionLoading}
        onConfirm={confirmDeleteConsultation}
        onCancel={cancelDeleteConsultation}
      />
    </div>
  );
}
