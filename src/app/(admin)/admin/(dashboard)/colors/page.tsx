"use client";

import { Plus } from "lucide-react";
import { useColors } from "@/hooks/admin/useColors";
import { PageHeader } from "@/components/admin/PageHeader";
import { SearchFilter } from "@/components/admin/SearchFilter";
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
      <PageHeader
        title="Quản lý màu sắc"
        description="Quản lý các màu sắc cho sản phẩm"
        action={
          <button type="button"
            onClick={handleAddColor}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <Plus className="size-4" />
            Thêm màu mới
          </button>
        }
      />

      {/* Search & Filter */}
      <SearchFilter
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        onSearchChange={setSearchQuery}
        onStatusFilterChange={setStatusFilter}
        searchPlaceholder="Tìm kiếm màu sắc..."
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
