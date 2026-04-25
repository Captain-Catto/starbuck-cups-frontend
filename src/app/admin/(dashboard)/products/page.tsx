"use client";

import { useCallback } from "react";
import { Plus } from "lucide-react";
import dynamic from "next/dynamic";
import { useProducts } from "@/hooks/admin/useProducts";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PageHeader } from "@/components/admin/PageHeader";

const ProductsFilters = dynamic(
  () => import("@/components/admin/products/ProductsFilters").then(mod => ({ default: mod.ProductsFilters })),
  { loading: () => <div className="h-12 bg-gray-100 animate-pulse rounded" /> }
);

const ProductsBulkActions = dynamic(
  () => import("@/components/admin/products/ProductsBulkActions").then(mod => ({ default: mod.ProductsBulkActions })),
  { loading: () => <div className="h-10 bg-gray-100 animate-pulse rounded" /> }
);

const ProductsTable = dynamic(
  () => import("@/components/admin/products/ProductsTable").then(mod => ({ default: mod.ProductsTable })),
  { loading: () => <LoadingSpinner /> }
);

const ProductsPagination = dynamic(
  () => import("@/components/admin/products/ProductsPagination").then(mod => ({ default: mod.ProductsPagination })),
  { loading: () => <div className="h-8 bg-gray-100 animate-pulse rounded" /> }
);

const ProductModal = dynamic(
  () => import("@/components/admin/ProductModal"),
  { ssr: false, loading: () => <LoadingSpinner /> }
);

const ProductConfirmModal = dynamic(
  () => import("@/components/admin/products/ProductConfirmModal").then(mod => ({ default: mod.ProductConfirmModal })),
  { ssr: false }
);

export default function AdminProductsPage() {
  const {
    // Data
    products,
    categories,
    colors,
    capacities,

    // State
    loading,
    actionLoading,
    selectedProducts,
    filters,
    pagination,

    // Modal state
    isModalOpen,
    editingProduct,

    // Confirmation modal state
    confirmModal,

    // Actions
    handleFilterChange,
    handleBulkAction,
    handleProductAction,
    performProductAction,
    handleCreateProduct,
    handleEditProduct,
    handleCloseModal,
    handleModalSuccess,
    getProductStatus,
    setSelectedProducts,
    setPagination,
    setConfirmModal,

    // Selection helpers
    isAllSelected,
    isIndeterminate,
  } = useProducts();

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedProducts(products.map((p) => p.id));
    } else {
      setSelectedProducts([]);
    }
  }, [products, setSelectedProducts]);

  const handleSelectProduct = useCallback((productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts((prev) => [...prev, productId]);
    } else {
      setSelectedProducts((prev) => prev.filter((id) => id !== productId));
    }
  }, [setSelectedProducts]);

  return (
    <div className="space-y-6 bg-gray-900 min-h-screen p-6">
      <PageHeader
        title="Quản lý sản phẩm"
        description="Quản lý danh sách sản phẩm, tồn kho và trạng thái"
        action={
          <button
            onClick={handleCreateProduct}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Thêm sản phẩm
          </button>
        }
      />

      {/* Filters */}
      <ProductsFilters
        filters={filters}
        categories={categories}
        colors={colors}
        capacities={capacities}
        onFilterChange={handleFilterChange}
      />

      {/* Bulk Actions */}
      <ProductsBulkActions
        selectedCount={selectedProducts.length}
        onBulkAction={handleBulkAction}
      />

      {/* Products Table */}
      <ProductsTable
        products={products}
        loading={loading}
        actionLoading={actionLoading}
        selectedProducts={selectedProducts}
        isAllSelected={isAllSelected}
        isIndeterminate={isIndeterminate}
        onSelectAll={handleSelectAll}
        onSelectProduct={handleSelectProduct}
        onEditProduct={handleEditProduct}
        onProductAction={handleProductAction}
        getProductStatus={getProductStatus}
      />

      {/* Pagination */}
      <ProductsPagination
        pagination={pagination}
        onPageChange={(page) =>
          setPagination((prev) => ({ ...prev, current_page: page }))
        }
      />

      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleModalSuccess}
        product={editingProduct}
        categories={Array.isArray(categories) ? categories : []}
        colors={Array.isArray(colors) ? colors : []}
        capacities={Array.isArray(capacities) ? capacities : []}
      />

      {/* Product Confirmation Modal */}
      <ProductConfirmModal
        confirmModal={confirmModal}
        onCancel={() => {
          setConfirmModal({
            show: false,
            product: null,
            action: "delete",
          });
        }}
        onConfirm={() => {
          if (confirmModal.product) {
            performProductAction(
              confirmModal.product.id,
              confirmModal.action === "toggle" ? "deactivate" : "delete"
            );
            setConfirmModal({
              show: false,
              product: null,
              action: "delete",
            });
          }
        }}
      />
    </div>
  );
}
