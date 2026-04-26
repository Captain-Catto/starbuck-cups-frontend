"use client";

import { Package } from "lucide-react";
import { useOrderDetailEdit } from "@/hooks/admin/useOrderDetailEdit";
import { OrderDetailHeader } from "./OrderDetailHeader";
import { OrderCustomerInfo } from "./OrderCustomerInfo";
import { OrderItemsList } from "./OrderItemsList";
import { OrderProductSelector } from "./OrderProductSelector";
import { OrderTotals } from "./OrderTotals";

interface OrderDetailProps {
  orderId: string;
  isEditing: boolean;
}

export function OrderDetail({ orderId, isEditing }: OrderDetailProps) {
  const {
    order,
    loading,
    saving,
    editData,
    setEditData,
    filteredProducts,
    showProductSelector,
    setShowProductSelector,
    loadingProducts,
    productPrices,
    setProductPrices,
    productQuantities,
    setProductQuantities,
    searchTerm,
    setSearchTerm,
    selectedProduct,
    setSelectedProduct,
    saveChanges,
    updateEditData,
    updateAddress,
    updateItemQuantity,
    updateItemPrice,
    removeItem,
    calculateUpdatedTotal,
    fetchProducts,
    addProduct,
    isFreeShipping,
    formatCurrency,
    formatDate,
  } = useOrderDetailEdit(orderId);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-600 rounded w-1/4" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-600 rounded w-3/4" />
              <div className="h-4 bg-gray-600 rounded w-1/2" />
              <div className="h-4 bg-gray-600 rounded w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Không tìm thấy đơn hàng</h3>
            <p className="text-gray-300">Đơn hàng không tồn tại hoặc đã bị xóa.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleToggleProductSelector = () => {
    if (!showProductSelector) {
      fetchProducts();
    }
    setProductPrices({});
    setProductQuantities({});
    setSearchTerm("");
    setSelectedProduct(null);
    setShowProductSelector(!showProductSelector);
  };

  return (
    <div className="space-y-6">
      {/* Order summary card */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <OrderDetailHeader
          order={order}
          isEditing={isEditing}
          saving={saving}
          onSave={saveChanges}
          isFreeShipping={isFreeShipping}
          formatCurrency={formatCurrency}
        />
        <OrderCustomerInfo
          order={order}
          isEditing={isEditing}
          editData={editData}
          onUpdateAddress={updateAddress}
          onUpdateEditData={updateEditData}
          formatDate={formatDate}
        />
      </div>

      {/* Items card */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Chi tiết sản phẩm</h3>

        <OrderItemsList
          order={order}
          isEditing={isEditing}
          editData={editData}
          onUpdateQuantity={updateItemQuantity}
          onUpdatePrice={updateItemPrice}
          onRemoveItem={removeItem}
          formatCurrency={formatCurrency}
        />

        {isEditing && order.orderType === "PRODUCT" && (
          <OrderProductSelector
            show={showProductSelector}
            loading={loadingProducts}
            filteredProducts={filteredProducts}
            searchTerm={searchTerm}
            selectedProduct={selectedProduct}
            productPrices={productPrices}
            productQuantities={productQuantities}
            onToggle={handleToggleProductSelector}
            onSearch={setSearchTerm}
            onSelectProduct={setSelectedProduct}
            onAddProduct={addProduct}
            onSetPrices={setProductPrices}
            onSetQuantities={setProductQuantities}
            formatCurrency={formatCurrency}
          />
        )}

        <OrderTotals
          order={order}
          isEditing={isEditing}
          editData={editData}
          onUpdateEditData={updateEditData}
          onSetEditData={setEditData}
          calculateUpdatedTotal={calculateUpdatedTotal}
          isFreeShipping={isFreeShipping}
          formatCurrency={formatCurrency}
        />
      </div>
    </div>
  );
}
