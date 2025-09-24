"use client";

import { useProducts } from "@/hooks/admin/useProducts";
import { ProductsHeader } from "@/components/admin/products/ProductsHeader";
import { ProductsFilters } from "@/components/admin/products/ProductsFilters";
import { ProductsBulkActions } from "@/components/admin/products/ProductsBulkActions";
import { ProductsTable } from "@/components/admin/products/ProductsTable";
import { ProductsPagination } from "@/components/admin/products/ProductsPagination";
import ProductModal from "@/components/admin/ProductModal";

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

    // Actions
    handleFilterChange,
    handleBulkAction,
    handleProductAction,
    handleCreateProduct,
    handleEditProduct,
    handleCloseModal,
    handleModalSuccess,
    getProductStatus,
    setSelectedProducts,
    setPagination,

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
    </div>
  );
}
