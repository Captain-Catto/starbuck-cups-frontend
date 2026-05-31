import { StepProps, Product, OrderItem } from "@/types/orders";
import { useProductSearch } from "@/hooks/admin/useProductSearch";
import OptimizedImage from "@/components/OptimizedImage";

interface OrderDetailsStepProps extends StepProps {
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onUpdateItem: (
    index: number,
    field: string,
    value: string | number | Product
  ) => void;
}

function ProductMetaBadges({ product }: { product: Product }) {
  return (
    <div className="text-xs text-gray-400 flex flex-wrap gap-1">
      {product.productColors && product.productColors.length > 0
        ? product.productColors.slice(0, 2).map((colorRelation) => (
            <span
              key={colorRelation.color?.id}
              className="bg-blue-900/20 text-blue-300 px-1 rounded"
            >
              {colorRelation.color?.name || "Unknown"}
            </span>
          ))
        : product.colors && product.colors.length > 0
        ? product.colors.slice(0, 2).map((color) => (
            <span
              key={color.id}
              className="bg-blue-900/20 text-blue-300 px-1 rounded"
            >
              {color.name}
            </span>
          ))
        : product.color
        ? (
            <span className="bg-blue-900/20 text-blue-300 px-1 rounded">
              {product.color.name}
            </span>
          )
        : null}

      {product.productColors && product.productColors.length > 2 ? (
        <span className="text-gray-500">+{product.productColors.length - 2}</span>
      ) : product.colors && product.colors.length > 2 ? (
        <span className="text-gray-500">+{product.colors.length - 2}</span>
      ) : null}

      {product.capacity && (
        <span className="bg-purple-900/20 text-purple-300 px-1 rounded">
          {product.capacity.name}
        </span>
      )}

      {product.productCategories && product.productCategories.length > 0
        ? product.productCategories.slice(0, 1).map((categoryRelation) => (
            <span
              key={categoryRelation.category?.id}
              className="bg-gray-700/50 text-gray-300 px-1 rounded"
            >
              {categoryRelation.category?.name || "Unknown"}
            </span>
          ))
        : product.categories && product.categories.length > 0
        ? product.categories.slice(0, 1).map((category) => (
            <span
              key={category.id}
              className="bg-gray-700/50 text-gray-300 px-1 rounded"
            >
              {category.name}
            </span>
          ))
        : product.category
        ? (
            <span className="bg-gray-700/50 text-gray-300 px-1 rounded">
              {product.category.name}
            </span>
          )
        : null}

      {product.productCategories && product.productCategories.length > 1 ? (
        <span className="text-gray-500">
          +{product.productCategories.length - 1}
        </span>
      ) : product.categories && product.categories.length > 1 ? (
        <span className="text-gray-500">+{product.categories.length - 1}</span>
      ) : null}
    </div>
  );
}

function ProductSearchDropdown({
  index,
  activeItemIndex,
  showProductDropdown,
  productSearchResults,
  productSearchTerm,
  searchingProducts,
  onSelectProduct,
}: {
  index: number;
  activeItemIndex: number | null;
  showProductDropdown: boolean;
  productSearchResults: Product[];
  productSearchTerm: string;
  searchingProducts: boolean;
  onSelectProduct: (product: Product, itemIndex: number) => void;
}) {
  if (!showProductDropdown || activeItemIndex !== index) {
    return null;
  }

  if (productSearchResults.length === 0 && productSearchTerm && !searchingProducts) {
    return (
      <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg p-4 text-center text-gray-400">
        Không tìm thấy sản phẩm nào
      </div>
    );
  }

  if (productSearchResults.length === 0) {
    return null;
  }

  return (
    <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
      {productSearchResults.map((product) => (
        <button
          type="button"
          key={product.id}
          onClick={() => onSelectProduct(product, index)}
          className="w-full text-left p-3 hover:bg-gray-600 border-b border-gray-600 last:border-b-0 block focus:outline-none focus:bg-gray-600"
        >
          <div className="flex items-center gap-3">
            <div className="size-12 flex-shrink-0">
              {product.productImages && product.productImages.length > 0 ? (
                <OptimizedImage
                  src={product.productImages[0].url}
                  alt={product.name}
                  width={48}
                  height={48}
                  className="size-full object-cover rounded-lg"
                />
              ) : (
                <div className="size-full bg-gray-600 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-xs">No img</span>
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="text-white font-medium">{product.name}</div>
              <ProductMetaBadges product={product} />
            </div>

            <div className="text-sm text-gray-300">
              {product.unitPrice ? product.unitPrice.toLocaleString() : "0"}đ
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

function SelectedProductSummary({ item }: { item: { product?: Product; quantity: number } }) {
  const product = item.product;
  if (!product || !product.id) {
    return null;
  }

  return (
    <div
      className={`mt-3 p-3 rounded-lg ${
        item.quantity > product.stockQuantity
          ? "bg-red-900/20 border border-red-700"
          : "bg-gray-700"
      }`}
    >
      <div className="flex items-start gap-3 mb-2">
        <div className="size-16 flex-shrink-0">
          {product.productImages && product.productImages.length > 0 ? (
            <OptimizedImage
              src={product.productImages[0].url}
              alt={product.name}
              width={64}
              height={64}
              className="size-full object-cover rounded-lg"
            />
          ) : (
            <div className="size-full bg-gray-600 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-xs">No img</span>
            </div>
          )}
        </div>

        <div className="flex-1">
          <h5 className="text-white font-medium">{product.name}</h5>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-white">Tồn kho:</span>
          <span
            className={`text-sm font-medium px-2 py-1 rounded ${
              item.quantity > product.stockQuantity
                ? "bg-red-900/30 text-red-400"
                : product.stockQuantity <= 1
                ? "bg-yellow-900/30 text-yellow-400"
                : "bg-green-900/30 text-green-400"
            }`}
          >
            {product.stockQuantity}
            {item.quantity > product.stockQuantity && " - KHÔNG ĐỦ HÀNG!"}
            {product.stockQuantity <= 1 && product.stockQuantity > 0 && " - SẮP HẾT!"}
            {product.stockQuantity === 0 && " - HẾT HÀNG!"}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400">Màu:</span>
            {product.productColors && Array.isArray(product.productColors) ? (
              product.productColors.map((colorRelation) => (
                <span
                  key={colorRelation.color?.id}
                  className="text-xs bg-blue-900/30 text-blue-300 px-2 py-1 rounded"
                >
                  {colorRelation.color?.name || "Unknown"}
                </span>
              ))
            ) : product.color ? (
              <span className="text-xs bg-blue-900/30 text-blue-300 px-2 py-1 rounded">
                {product.color.name}
              </span>
            ) : (
              <span className="text-xs text-gray-500">N/A</span>
            )}
          </div>

          {product.capacity && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-400">Dung tích:</span>
              <span className="text-xs bg-purple-900/30 text-purple-300 px-2 py-1 rounded">
                {product.capacity.name}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400">Danh mục:</span>
            {product.productCategories && Array.isArray(product.productCategories) ? (
              product.productCategories.map((categoryRelation) => (
                <span
                  key={categoryRelation.category?.id}
                  className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
                >
                  {categoryRelation.category?.name || "Unknown"}
                </span>
              ))
            ) : product.category ? (
              <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                {product.category.name}
              </span>
            ) : (
              <span className="text-xs text-gray-500">N/A</span>
            )}
          </div>
        </div>

        {(!product.isActive || product.isDeleted) && (
          <div className="flex items-center gap-2 flex-wrap">
            {!product.isActive && (
              <span className="text-xs bg-red-900/30 text-red-400 px-2 py-1 rounded font-medium">
                KHÔNG HOẠT ĐỘNG
              </span>
            )}
            {product.isDeleted && (
              <span className="text-xs bg-red-900/30 text-red-400 px-2 py-1 rounded font-medium">
                ĐÃ XÓA
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CustomOrderDescription({
  value,
  error,
  onChange,
}: {
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="orderdetailsstep-m-t-chi-ti-t-y-u-c-u-c-a-kh-ch-">
        Mô tả chi tiết <span className="text-red-400">*</span>
      </label>
      <textarea aria-label="Mô tả chi tiết yêu cầu của khách hàng (màu sắc, kích thước, thiết kế, logo, v.v.)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        className={`w-full px-3 py-2 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-gray-500 text-white placeholder-gray-400 ${
          error ? "border-red-500" : "border-gray-600"
        }`}
        placeholder="Mô tả chi tiết yêu cầu của khách hàng (màu sắc, kích thước, thiết kế, logo, v.v.)" id="orderdetailsstep-m-t-chi-ti-t-y-u-c-u-c-a-kh-ch-"
      />
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}

function ProductItemValidationErrors({
  errors,
  index,
}: {
  errors: Record<string, string>;
  index: number;
}) {
  const productError = errors[`item_${index}_product`];
  const stockError = errors[`item_${index}_stock`];
  const activeError = errors[`item_${index}_active`];
  const deletedError = errors[`item_${index}_deleted`];

  if (!productError && !stockError && !activeError && !deletedError) {
    return null;
  }

  return (
    <div className="mt-2 space-y-1">
      {productError && <p className="text-xs text-red-400">{productError}</p>}
      {stockError && (
        <p className="text-xs text-red-400">
          <span className="font-bold">⚠️</span> {stockError}
        </p>
      )}
      {activeError && (
        <p className="text-xs text-red-400">
          <span className="font-bold">⚠️</span> {activeError}
        </p>
      )}
      {deletedError && (
        <p className="text-xs text-red-400">
          <span className="font-bold">⚠️</span> {deletedError}
        </p>
      )}
    </div>
  );
}

function ProductSearchField({
  item,
  index,
  activeItemIndex,
  productSearchTerm,
  searchingProducts,
  productSearchResults,
  showProductDropdown,
  onSearch,
  onClearSearch,
  onSelectProduct,
  onUpdateItem,
  setActiveItemIndex,
  setProductSearchTerm,
  setShowProductDropdown,
}: {
  item: OrderItem;
  index: number;
  activeItemIndex: number | null;
  productSearchTerm: string;
  searchingProducts: boolean;
  productSearchResults: Product[];
  showProductDropdown: boolean;
  onSearch: (term: string, itemIndex: number) => void;
  onClearSearch: () => void;
  onSelectProduct: (product: Product, itemIndex: number) => void;
  onUpdateItem: OrderDetailsStepProps["onUpdateItem"];
  setActiveItemIndex: (index: number | null) => void;
  setProductSearchTerm: (term: string) => void;
  setShowProductDropdown: (show: boolean) => void;
}) {
  const hasSelectedProduct = Boolean(item.product?.id);

  const clearSelectedProduct = () => {
    onUpdateItem(index, "productId", "");
    onUpdateItem(index, "product", { id: "", name: "" } as Product);
    onUpdateItem(index, "unitPrice", 0);
    onClearSearch();
  };

  return (
    <div className="relative">
      <label
        className="block text-sm font-medium text-gray-300 mb-1"
        htmlFor="orderdetailsstep-nh-p-t-n-s-n-ph-m-t-m-ki-m"
      >
        Tìm kiếm sản phẩm <span className="text-red-400">*</span>
      </label>
      <div className="relative">
        <input
          aria-label="Nhập tên sản phẩm để tìm kiếm..."
          type="text"
          value={
            activeItemIndex === index
              ? productSearchTerm
              : hasSelectedProduct
              ? item.product?.name
              : ""
          }
          onChange={(e) => {
            const searchTerm = e.target.value;

            if (searchTerm === "" && hasSelectedProduct) {
              clearSelectedProduct();
              return;
            }

            if (!hasSelectedProduct) {
              onSearch(searchTerm, index);
            }
          }}
          onFocus={() => {
            setActiveItemIndex(index);

            if (hasSelectedProduct && item.product) {
              setProductSearchTerm(item.product.name);
            }

            if (!hasSelectedProduct && productSearchResults.length > 0) {
              setShowProductDropdown(true);
            }
          }}
          onKeyDown={(e) => {
            if (!hasSelectedProduct) {
              return;
            }

            const isEditingKey =
              e.key.length === 1 ||
              e.key === "Backspace" ||
              e.key === "Delete" ||
              e.key === "Enter" ||
              (e.ctrlKey && (e.key === "v" || e.key === "a"));

            if (isEditingKey) {
              clearSelectedProduct();
            }
          }}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 text-white placeholder-gray-400"
          placeholder="Nhập tên sản phẩm để tìm kiếm..."
          id="orderdetailsstep-nh-p-t-n-s-n-ph-m-t-m-ki-m"
        />

        {searchingProducts && activeItemIndex === index && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="size-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      <ProductSearchDropdown
        index={index}
        activeItemIndex={activeItemIndex}
        showProductDropdown={showProductDropdown}
        productSearchResults={productSearchResults}
        productSearchTerm={productSearchTerm}
        searchingProducts={searchingProducts}
        onSelectProduct={onSelectProduct}
      />
    </div>
  );
}

function ProductItemInputs({
  item,
  index,
  errors,
  onUpdateItem,
}: {
  item: OrderItem;
  index: number;
  errors: Record<string, string>;
  onUpdateItem: OrderDetailsStepProps["onUpdateItem"];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label
          className="block text-sm font-medium text-gray-300 mb-1"
          htmlFor="orderdetailsstep-number"
        >
          Số lượng <span className="text-red-400">*</span>
        </label>
        <input
          aria-label="number"
          type="number"
          min="1"
          value={item.quantity}
          onChange={(e) =>
            onUpdateItem(index, "quantity", parseInt(e.target.value) || 0)
          }
          className={`w-full px-3 py-2 bg-gray-700 border rounded-lg focus:ring-2 focus:ring-gray-500 text-white ${
            errors[`item_${index}_quantity`]
              ? "border-red-500"
              : "border-gray-600"
          }`}
          id="orderdetailsstep-number"
        />
        {errors[`item_${index}_quantity`] && (
          <p className="text-xs text-red-400 mt-1">
            {errors[`item_${index}_quantity`]}
          </p>
        )}
      </div>

      <div>
        <label
          className="block text-sm font-medium text-gray-300 mb-1"
          htmlFor="orderdetailsstep-number-2"
        >
          Giá đơn vị (VND) <span className="text-red-400">*</span>
          <span className="text-xs text-gray-400 ml-1">(0 = tặng)</span>
        </label>
        <input
          aria-label="number"
          type="number"
          min="0"
          value={item.unitPrice}
          onChange={(e) =>
            onUpdateItem(index, "unitPrice", parseInt(e.target.value) || 0)
          }
          className={`w-full px-3 py-2 bg-gray-700 border rounded-lg focus:ring-2 focus:ring-gray-500 text-white ${
            errors[`item_${index}_price`] ? "border-red-500" : "border-gray-600"
          }`}
          id="orderdetailsstep-number-2"
        />
        {errors[`item_${index}_price`] && (
          <p className="text-xs text-red-400 mt-1">
            {errors[`item_${index}_price`]}
          </p>
        )}
      </div>

      <div>
        <label
          className="block text-sm font-medium text-gray-300 mb-1"
          htmlFor="orderdetailsstep-tr-ng-n-u-d-ng-m-u-m-c-nh"
        >
          Màu yêu cầu
        </label>
        <input
          aria-label="Để trống nếu dùng màu mặc định"
          type="text"
          value={item.requestedColor || ""}
          onChange={(e) => onUpdateItem(index, "requestedColor", e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 text-white placeholder-gray-400"
          placeholder="Để trống nếu dùng màu mặc định"
          id="orderdetailsstep-tr-ng-n-u-d-ng-m-u-m-c-nh"
        />
      </div>
    </div>
  );
}

function ProductOrderItem({
  item,
  index,
  itemCount,
  errors,
  productSearchTerm,
  searchingProducts,
  productSearchResults,
  showProductDropdown,
  activeItemIndex,
  onSearch,
  onClearSearch,
  onSelectProduct,
  onRemoveItem,
  onUpdateItem,
  setActiveItemIndex,
  setProductSearchTerm,
  setShowProductDropdown,
}: {
  item: OrderItem;
  index: number;
  itemCount: number;
  errors: Record<string, string>;
  productSearchTerm: string;
  searchingProducts: boolean;
  productSearchResults: Product[];
  showProductDropdown: boolean;
  activeItemIndex: number | null;
  onSearch: (term: string, itemIndex: number) => void;
  onClearSearch: () => void;
  onSelectProduct: (product: Product, itemIndex: number) => void;
  onRemoveItem: (index: number) => void;
  onUpdateItem: OrderDetailsStepProps["onUpdateItem"];
  setActiveItemIndex: (index: number | null) => void;
  setProductSearchTerm: (term: string) => void;
  setShowProductDropdown: (show: boolean) => void;
}) {
  return (
    <div className="border border-gray-600 rounded-lg p-4 bg-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-white">Sản phẩm {index + 1}</h4>
        {itemCount > 1 && (
          <button
            type="button"
            onClick={() => onRemoveItem(index)}
            className="text-red-400 hover:text-red-300"
          >
            Xóa
          </button>
        )}
      </div>

      <div className="space-y-4">
        <ProductSearchField
          item={item}
          index={index}
          activeItemIndex={activeItemIndex}
          productSearchTerm={productSearchTerm}
          searchingProducts={searchingProducts}
          productSearchResults={productSearchResults}
          showProductDropdown={showProductDropdown}
          onSearch={onSearch}
          onClearSearch={onClearSearch}
          onSelectProduct={onSelectProduct}
          onUpdateItem={onUpdateItem}
          setActiveItemIndex={setActiveItemIndex}
          setProductSearchTerm={setProductSearchTerm}
          setShowProductDropdown={setShowProductDropdown}
        />

        {errors[`item_${index}_product`] && (
          <p className="text-xs text-red-400">
            {errors[`item_${index}_product`]}
          </p>
        )}

        <ProductItemInputs
          item={item}
          index={index}
          errors={errors}
          onUpdateItem={onUpdateItem}
        />
      </div>

      <SelectedProductSummary item={item} />
      <ProductItemValidationErrors errors={errors} index={index} />
    </div>
  );
}

function ProductItemsSection({
  items,
  errors,
  productSearchTerm,
  searchingProducts,
  productSearchResults,
  showProductDropdown,
  activeItemIndex,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  onSearch,
  onClearSearch,
  onSelectProduct,
  setActiveItemIndex,
  setProductSearchTerm,
  setShowProductDropdown,
}: {
  items: OrderItem[];
  errors: Record<string, string>;
  productSearchTerm: string;
  searchingProducts: boolean;
  productSearchResults: Product[];
  showProductDropdown: boolean;
  activeItemIndex: number | null;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onUpdateItem: OrderDetailsStepProps["onUpdateItem"];
  onSearch: (term: string, itemIndex: number) => void;
  onClearSearch: () => void;
  onSelectProduct: (product: Product, itemIndex: number) => void;
  setActiveItemIndex: (index: number | null) => void;
  setProductSearchTerm: (term: string) => void;
  setShowProductDropdown: (show: boolean) => void;
}) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <ProductOrderItem
          key={item.key || index}
          item={item}
          index={index}
          itemCount={items.length}
          errors={errors}
          productSearchTerm={productSearchTerm}
          searchingProducts={searchingProducts}
          productSearchResults={productSearchResults}
          showProductDropdown={showProductDropdown}
          activeItemIndex={activeItemIndex}
          onSearch={onSearch}
          onClearSearch={onClearSearch}
          onSelectProduct={onSelectProduct}
          onRemoveItem={onRemoveItem}
          onUpdateItem={onUpdateItem}
          setActiveItemIndex={setActiveItemIndex}
          setProductSearchTerm={setProductSearchTerm}
          setShowProductDropdown={setShowProductDropdown}
        />
      ))}

      <button
        type="button"
        onClick={onAddItem}
        className="w-full p-3 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
      >
        + Thêm sản phẩm
      </button>

      {errors.items && <p className="text-sm text-red-400">{errors.items}</p>}
    </div>
  );
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
          productSearchTerm={productSearchTerm}
          searchingProducts={searchingProducts}
          productSearchResults={productSearchResults}
          showProductDropdown={showProductDropdown}
          activeItemIndex={activeItemIndex}
          onAddItem={onAddItem}
          onRemoveItem={onRemoveItem}
          onUpdateItem={onUpdateItem}
          onSearch={handleProductSearch}
          onClearSearch={clearProductSearch}
          onSelectProduct={handleSelectProduct}
          setActiveItemIndex={setActiveItemIndex}
          setProductSearchTerm={setProductSearchTerm}
          setShowProductDropdown={setShowProductDropdown}
        />
      )}
    </div>
  );
}
