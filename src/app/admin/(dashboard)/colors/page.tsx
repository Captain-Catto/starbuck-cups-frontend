"use client";

import { useColors } from "@/hooks/admin/useColors";
import { ColorsHeader } from "@/components/admin/colors/ColorsHeader";
import { ColorsSearchFilter } from "@/components/admin/colors/ColorsSearchFilter";
import { ColorsTable } from "@/components/admin/colors/ColorsTable";
import { ColorFormModal } from "@/components/admin/colors/ColorFormModal";
import { ColorConfirmModal } from "@/components/admin/colors/ColorConfirmModal";

export default function ColorsManagement() {
  const {
    // Data
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
  } = useColors();

  return (
    <div className="space-y-6 bg-gray-900 min-h-screen p-6">
      {/* Header */}
      <ColorsHeader onAddColor={handleAddColor} />

      {/* Search & Filter */}
      <ColorsSearchFilter
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        onSearchChange={setSearchQuery}
        onStatusFilterChange={setStatusFilter}
      />

      {/* Colors Table */}
      <ColorsTable
        colors={filteredColors}
        loading={loading}
        actionLoading={actionLoading}
        searchQuery={searchQuery}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />

      {/* Color Form Modal */}
      <ColorFormModal
        showModal={showModal}
        editingColor={editingColor}
        formData={formData}
        formErrors={formErrors}
        actionLoading={actionLoading}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        onFormDataChange={setFormData}
      />

      {/* Confirmation Modal */}
      <ColorConfirmModal
        confirmModal={confirmModal}
        onCancel={() =>
          setConfirmModal({
            show: false,
            color: null,
            action: "toggle",
          })
        }
        onConfirm={() => {
          if (confirmModal.color) {
            if (confirmModal.action === "delete") {
              performDelete(confirmModal.color);
            } else if (confirmModal.action === "toggle") {
              performToggleStatus(confirmModal.color);
            }
            setConfirmModal({
              show: false,
              color: null,
              action: "toggle",
            });
          }
        }}
      />
    </div>
  );
}
