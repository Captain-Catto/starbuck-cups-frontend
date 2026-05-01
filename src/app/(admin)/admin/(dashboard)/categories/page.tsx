"use client";

import { Plus } from "lucide-react";
import { useCategories } from "@/hooks/admin/useCategories";
import { PageHeader } from "@/components/admin/PageHeader";
import { SearchFilter } from "@/components/admin/SearchFilter";
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
    <div className="space-y-6 bg-gray-900 min-h-screen p-6">
      <PageHeader
        title="Quản lý danh mục"
        description="Quản lý các danh mục sản phẩm"
        action={
          <button
            onClick={handleAddCategory}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Thêm danh mục
          </button>
        }
      />

      {/* Search & Filter */}
      <SearchFilter
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        onSearchChange={setSearchQuery}
        onStatusFilterChange={setStatusFilter}
        searchPlaceholder="Tìm kiếm danh mục..."
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
        <div className="flex justify-center">
          <Pagination
            data={pagination}
            onPageChange={onPageChange}
            className="bg-gray-800 rounded-lg"
          />
        </div>
      ) : (
        <div className="text-center text-gray-400">
          {loading ? "Đang tải..." : ""}
        </div>
      )}

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
