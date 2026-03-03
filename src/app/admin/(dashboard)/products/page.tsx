"use client";

import dynamic from "next/dynamic";
import { useProducts } from "@/hooks/admin/useProducts";
import { LoadingSpinner } from "@/components/LoadingSpinner";

// Dynamic imports for better performance
const ProductsHeader = dynamic(
  () => import("@/components/admin/products/ProductsHeader").then(mod => ({ default: mod.ProductsHeader })),
  { loading: () => <div className="h-16 bg-gray-100 animate-pulse rounded" /> }
);

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
