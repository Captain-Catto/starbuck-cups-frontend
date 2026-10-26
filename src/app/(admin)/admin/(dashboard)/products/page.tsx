"use client";

import { Suspense, useCallback } from "react";
import { Plus } from "lucide-react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useProducts } from "@/hooks/admin/useProducts";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PageHeader } from "@/components/admin/PageHeader";
import ProductsLoading from "./loading";
// Rendered on first paint, so imported statically: dynamic() would add a chunk round trip
// after the route chunk, delaying the table behind a spinner.
import { ProductsFilters } from "@/components/admin/products/ProductsFilters";
import { ProductsBulkActions } from "@/components/admin/products/ProductsBulkActions";
import { ProductsTable } from "@/components/admin/products/ProductsTable";
import { ProductsPagination } from "@/components/admin/products/ProductsPagination";

const ProductModal = dynamic(
  () => import("@/components/admin/ProductModal"),
  { ssr: false, loading: () => <LoadingSpinner /> }
);

const ProductConfirmModal = dynamic(
  () => import("@/components/admin/products/ProductConfirmModal").then(mod => ({ default: mod.ProductConfirmModal })),
  { ssr: false }
);

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <AdminProductsContent />
    </Suspense>
  );
}

function AdminProductsContent() {
  const searchParams = useSearchParams();
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
    handleTogglePin,
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
  } = useProducts(searchParams);

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
    <div className="min-h-screen space-y-4 bg-gray-900 sm:space-y-6 sm:p-6">
      <PageHeader
        title="Quản lý sản phẩm"
        description="Quản lý danh sách sản phẩm, tồn kho và trạng thái"
        action={
          <button type="button"
            onClick={handleCreateProduct}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <Plus className="size-4" />
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
        onTogglePin={handleTogglePin}
        getProductStatus={getProductStatus}
        onCategoryClick={(slug) => handleFilterChange("category", slug)}
        onColorClick={(slug) => handleFilterChange("color", slug)}
        onCapacityClick={(volumeMl) => {
          handleFilterChange("minCapacity", volumeMl.toString());
          handleFilterChange("maxCapacity", volumeMl.toString());
        }}
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
              confirmModal.action === "toggle"
                ? confirmModal.product.isActive ? "deactivate" : "activate"
                : "delete"
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
