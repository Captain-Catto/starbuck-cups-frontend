"use client";

import { useProducts } from "@/hooks/admin/useProducts";
import { ProductsHeader } from "@/components/admin/products/ProductsHeader";
import { ProductsFilters } from "@/components/admin/products/ProductsFilters";
import { ProductsBulkActions } from "@/components/admin/products/ProductsBulkActions";
import { ProductsTable } from "@/components/admin/products/ProductsTable";
import { ProductsPagination } from "@/components/admin/products/ProductsPagination";
import ProductModal from "@/components/admin/ProductModal";
import { ProductConfirmModal } from "@/components/admin/products/ProductConfirmModal";

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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(products.map((p) => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts((prev) => [...prev, productId]);
    } else {
      setSelectedProducts((prev) => prev.filter((id) => id !== productId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <ProductsHeader onCreateProduct={handleCreateProduct} />

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
      </div>

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
