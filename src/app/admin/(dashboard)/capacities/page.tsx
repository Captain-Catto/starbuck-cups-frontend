"use client";

import { useCapacities } from "@/hooks/admin/useCapacities";
import { CapacitiesHeader } from "@/components/admin/capacities/CapacitiesHeader";
import { CapacitiesSearchFilter } from "@/components/admin/capacities/CapacitiesSearchFilter";
import { CapacitiesTable } from "@/components/admin/capacities/CapacitiesTable";
import { CapacityFormModal } from "@/components/admin/capacities/CapacityFormModal";
import { CapacityDeleteModal } from "@/components/admin/capacities/CapacityDeleteModal";
import { CapacityConfirmModal } from "@/components/admin/capacities/CapacityConfirmModal";

export default function CapacitiesManagement() {
  const {
    // Data
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
  } = useCapacities();

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <CapacitiesHeader onAddCapacity={handleAddCapacity} />

        {/* Search & Filter */}
        <CapacitiesSearchFilter
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          onSearchChange={setSearchQuery}
          onStatusFilterChange={setStatusFilter}
        />

        {/* Capacities Table */}
        <CapacitiesTable
          capacities={filteredCapacities}
          loading={loading}
          actionLoading={actionLoading}
          searchQuery={searchQuery}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
        />
      </div>

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
