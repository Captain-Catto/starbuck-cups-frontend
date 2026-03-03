"use client";

import { useCategories } from "@/hooks/admin/useCategories";
import { CategoriesHeader } from "@/components/admin/categories/CategoriesHeader";
import { CategoriesSearchFilter } from "@/components/admin/categories/CategoriesSearchFilter";
import { CategoriesTable } from "@/components/admin/categories/CategoriesTable";
import { CategoryFormModal } from "@/components/admin/categories/CategoryFormModal";
import { CategoryConfirmModal } from "@/components/admin/categories/CategoryConfirmModal";
import { Pagination } from "@/components/ui/Pagination";

export default function CategoriesManagement() {
  const {
    // Data
    filteredCategories,

    // Pagination
    pagination,

    // State
    loading,
    searchQuery,
    statusFilter,

    // Modal state
    showModal,
    editingCategory,
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
    handleAddCategory,
    setFormData,
    setConfirmModal,
    performToggleStatus,
    performDelete,

    // Pagination actions
    onPageChange,
  } = useCategories();

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <CategoriesHeader onAddCategory={handleAddCategory} />

        {/* Search & Filter */}
        <CategoriesSearchFilter
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          onSearchChange={setSearchQuery}
          onStatusFilterChange={setStatusFilter}
        />

        {/* Categories Table */}
        <CategoriesTable
          categories={filteredCategories}
          loading={loading}
          actionLoading={actionLoading}
          searchQuery={searchQuery}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
        />

        {/* Pagination */}
        {pagination && !loading ? (
          <div className="mt-6 flex justify-center">
            <Pagination
              data={pagination}
              onPageChange={onPageChange}
              className="bg-gray-800 rounded-lg"
            />
          </div>
        ) : (
          <div className="mt-6 text-center text-gray-400">
            {loading ? "Đang tải..." : "Không có dữ liệu phân trang"}
          </div>
        )}
      </div>

      {/* Form Modal */}
      <CategoryFormModal
        showModal={showModal}
        editingCategory={editingCategory}
        formData={formData}
        formErrors={formErrors}
        actionLoading={actionLoading}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        onFormDataChange={setFormData}
      />

      {/* Confirmation Modal */}
      <CategoryConfirmModal
        confirmModal={confirmModal}
        onCancel={() =>
          setConfirmModal({
            show: false,
            category: null,
            action: "toggle",
          })
        }
        onConfirm={() => {
          if (confirmModal.category) {
            if (confirmModal.action === "delete") {
              performDelete(confirmModal.category);
            } else {
              performToggleStatus(confirmModal.category);
            }
            setConfirmModal({
              show: false,
              category: null,
              action: "toggle",
            });
          }
        }}
      />
    </div>
  );
}
