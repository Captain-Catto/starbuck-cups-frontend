"use client";

import { Plus } from "lucide-react";
import { useCapacities } from "@/hooks/admin/useCapacities";
import { PageHeader } from "@/components/admin/PageHeader";
import { SearchFilter } from "@/components/admin/SearchFilter";
import { CapacitiesTable } from "@/components/admin/capacities/CapacitiesTable";
import { CapacityFormModal } from "@/components/admin/capacities/CapacityFormModal";
import { CapacityDeleteModal } from "@/components/admin/capacities/CapacityDeleteModal";
import { CapacityConfirmModal } from "@/components/admin/capacities/CapacityConfirmModal";

export default function CapacitiesManagement() {
  const {
    // Data
    filteredCapacities,

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
    setSearchQuery,
    setStatusFilter,
    handleEdit,
    handleDelete,
    handleSubmit,
    handleToggleStatus,
    handleCloseModal,
    handleAddCapacity,
    confirmDelete,
    cancelDelete,
    setFormData,
    performToggleStatus,
    setConfirmModal,
    onPageChange,
  } = useCapacities();

  return (
    <div className="space-y-6 bg-gray-900 min-h-screen p-6">
      <PageHeader
        title="Quản lý dung tích"
        description="Quản lý các loại dung tích cốc và ly"
        action={
          <button
            onClick={handleAddCapacity}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Thêm dung tích
          </button>
        }
      />

      {/* Search & Filter */}
      <SearchFilter
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        onSearchChange={setSearchQuery}
        onStatusFilterChange={setStatusFilter}
        searchPlaceholder="Tìm kiếm dung tích..."
      />

      {/* Capacities Table */}
      <CapacitiesTable
        capacities={filteredCapacities}
        loading={loading}
        actionLoading={actionLoading}
        searchQuery={searchQuery}
        pagination={pagination}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        onPageChange={onPageChange}
      />

      {/* Form Modal */}
      <CapacityFormModal
        showModal={showModal}
        editingCapacity={editingCapacity}
        formData={formData}
        formErrors={formErrors}
        actionLoading={actionLoading}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        onFormDataChange={setFormData}
      />

      {/* Delete Confirmation Modal */}
      <CapacityDeleteModal
        showModal={showDeleteModal}
        deleteName={deleteName}
        actionLoading={actionLoading}
        deleteId={deleteId}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {/* Toggle Confirmation Modal */}
      <CapacityConfirmModal
        confirmModal={confirmModal}
        onCancel={() =>
          setConfirmModal({
            show: false,
            capacity: null,
            action: "toggle",
          })
        }
        onConfirm={() => {
          if (confirmModal.capacity) {
            performToggleStatus(confirmModal.capacity);
            setConfirmModal({
              show: false,
              capacity: null,
              action: "toggle",
            });
          }
        }}
      />
    </div>
  );
}
