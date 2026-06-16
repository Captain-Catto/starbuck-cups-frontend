import { StepProps, Product } from "@/types/orders";
import { useProductSearch } from "@/hooks/admin/useProductSearch";
import { CustomOrderDescription } from "./order-details/CustomOrderDescription";
import { ProductItemsSection } from "./order-details/ProductItemsSection";
import {
  ProductSearchControls,
  UpdateItemHandler,
} from "./order-details/types";

interface OrderDetailsStepProps extends StepProps {
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onUpdateItem: UpdateItemHandler;
}

export function OrderDetailsStep({
  formData,
  setFormData,
  errors,
  setErrors,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
}: OrderDetailsStepProps) {
  const {
    productSearchTerm,
    searchingProducts,
    productSearchResults,
    showProductDropdown,
    activeItemIndex,
    handleProductSearch,
    selectProduct,
    setShowProductDropdown,
    setActiveItemIndex,
    setProductSearchTerm,
    clearProductSearch,
  } = useProductSearch();

  const handleSelectProduct = (product: Product, itemIndex: number) => {
    const { product: selectedProduct } = selectProduct(product);

    onUpdateItem(itemIndex, "productId", selectedProduct.id);
    onUpdateItem(itemIndex, "product", selectedProduct);
    onUpdateItem(itemIndex, "unitPrice", 0); // Set to 0 for easier handling

    setProductSearchTerm(selectedProduct.name);
    setShowProductDropdown(false);
    setActiveItemIndex(null);

    // Clear product-related errors when product is selected
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`item_${itemIndex}_product`];
      return newErrors;
    });
  };

  const search: ProductSearchControls = {
    productSearchTerm,
    searchingProducts,
    productSearchResults,
    showProductDropdown,
    activeItemIndex,
    onSearch: handleProductSearch,
    onClearSearch: clearProductSearch,
    onSelectProduct: handleSelectProduct,
    setActiveItemIndex,
    setProductSearchTerm,
    setShowProductDropdown,
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          Chi tiết đơn hàng
        </h3>
        <p className="text-gray-300 mb-6">
          {formData.orderType === "custom"
            ? "Mô tả chi tiết yêu cầu tùy chỉnh của khách hàng."
            : "Chọn sản phẩm, số lượng và giá cho đơn hàng."}
        </p>
      </div>

      {formData.orderType === "custom" ? (
        <CustomOrderDescription
          value={formData.customDescription}
          error={errors.customDescription}
          onChange={(value) =>
            setFormData((prev) => ({
              ...prev,
              customDescription: value,
            }))
          }
        />
      ) : (
        <ProductItemsSection
          items={formData.items}
          errors={errors}
          search={search}
          onAddItem={onAddItem}
          onRemoveItem={onRemoveItem}
          onUpdateItem={onUpdateItem}
        />
      )}
    </div>
  );
}
