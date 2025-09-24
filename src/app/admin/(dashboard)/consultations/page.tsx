"use client";

import { useConsultations } from "@/hooks/admin/useConsultations";
import { ConsultationsHeader } from "@/components/admin/consultations/ConsultationsHeader";
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
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <ConsultationsHeader />

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
      </div>

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
