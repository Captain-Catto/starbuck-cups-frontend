import { StepProps, Product } from "@/types/orders";
import { useProductSearch } from "@/hooks/admin/useProductSearch";
import Image from "next/image";

interface OrderDetailsStepProps extends StepProps {
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onUpdateItem: (
    index: number,
    field: string,
    value: string | number | Product
  ) => void;
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
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Mô tả chi tiết <span className="text-red-400">*</span>
          </label>
          <textarea
            value={formData.customDescription}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                customDescription: e.target.value,
              }))
            }
            rows={6}
            className={`w-full px-3 py-2 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-gray-500 text-white placeholder-gray-400 ${
              errors.customDescription ? "border-red-500" : "border-gray-600"
            }`}
            placeholder="Mô tả chi tiết yêu cầu của khách hàng (màu sắc, kích thước, thiết kế, logo, v.v.)"
          />
          {errors.customDescription && (
            <p className="mt-1 text-sm text-red-400">
              {errors.customDescription}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {formData.items.map((item, index) => (
            <div
              key={index}
              className="border border-gray-600 rounded-lg p-4 bg-gray-800"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-white">Sản phẩm {index + 1}</h4>
                {formData.items.length > 1 && (
                  <button
                    onClick={() => onRemoveItem(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Xóa
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {/* Search Input Section */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Tìm kiếm sản phẩm <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={
                        activeItemIndex === index
                          ? productSearchTerm
                          : item.product &&
                            item.product.id &&
                            item.product.id !== ""
                          ? item.product.name
                          : ""
                      }
                      onChange={(e) => {
                        const searchTerm = e.target.value;

                        // If user clears the input (empty string), clear the product
                        if (
                          searchTerm === "" &&
                          item.product &&
                          item.product.id &&
                          item.product.id !== ""
                        ) {
                          console.log(
                            "🗑️ User cleared input, clearing product for item",
                            index
                          );

                          // Reset product selection
                          onUpdateItem(index, "productId", "");
                          onUpdateItem(index, "product", {
                            id: "",
                            name: "",
                          } as Product);
                          onUpdateItem(index, "unitPrice", 0);

                          // Reset search state
                          clearProductSearch();
                          return;
                        }

                        // Normal search logic
                        if (
                          !item.product ||
                          !item.product.id ||
                          item.product.id === ""
                        ) {
                          handleProductSearch(searchTerm, index);
                        }
                      }}
                      onFocus={() => {
                        setActiveItemIndex(index);

                        // If product is selected, set search term to product name so user can edit
                        if (
                          item.product &&
                          item.product.id &&
                          item.product.id !== ""
                        ) {
                          setProductSearchTerm(item.product.name);
                        }

                        // Show dropdown if there are results and no product selected
                        if (
                          (!item.product ||
                            !item.product.id ||
                            item.product.id === "") &&
                          productSearchResults.length > 0
                        ) {
                          setShowProductDropdown(true);
                        }
                      }}
                      onKeyDown={(e) => {
                        // If user starts editing when product is selected, clear it first
                        if (
                          item.product &&
                          item.product.id &&
                          item.product.id !== ""
                        ) {
                          const isEditingKey =
                            e.key.length === 1 || // Regular characters
                            e.key === "Backspace" ||
                            e.key === "Delete" ||
                            e.key === "Enter" ||
                            (e.ctrlKey && (e.key === "v" || e.key === "a")); // Ctrl+V, Ctrl+A

                          if (isEditingKey) {
                            console.log(
                              "🔤 User editing text, clearing product for item",
                              index,
                              "key:",
                              e.key
                            );

                            // Reset product selection
                            onUpdateItem(index, "productId", "");
                            onUpdateItem(index, "product", {
                              id: "",
                              name: "",
                            } as Product);
                            onUpdateItem(index, "unitPrice", 0);

                            // Reset search state
                            clearProductSearch();
                          }
                        }
                      }}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 text-white placeholder-gray-400"
                      placeholder="Nhập tên sản phẩm để tìm kiếm..."
                    />

                    {searchingProducts && activeItemIndex === index && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>

                  {/* Product Search Results Dropdown */}
                  {showProductDropdown &&
                    activeItemIndex === index &&
                    productSearchResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {productSearchResults.map((product) => (
                          <div
                            key={product.id}
                            onClick={() => handleSelectProduct(product, index)}
                            className="p-3 hover:bg-gray-600 cursor-pointer border-b border-gray-600 last:border-b-0"
                          >
                            <div className="flex items-center gap-3">
                              {/* Product Image */}
                              <div className="w-12 h-12 flex-shrink-0">
                                {product.productImages &&
                                product.productImages.length > 0 ? (
                                  <Image
                                    src={product.productImages[0].url}
                                    alt={product.name}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover rounded-lg"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-600 rounded-lg flex items-center justify-center">
                                    <span className="text-gray-400 text-xs">
                                      No img
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Product Info */}
                              <div className="flex-1">
                                <div className="text-white font-medium">
                                  {product.name}
                                </div>
                                <div className="text-xs text-gray-400 flex flex-wrap gap-1">
                                  {/* Colors */}
                                  {product.productColors &&
                                  product.productColors.length > 0 ? (
                                    product.productColors
                                      .slice(0, 2)
                                      .map((colorRelation, idx) => (
                                        <span
                                          key={idx}
                                          className="bg-blue-900/20 text-blue-300 px-1 rounded"
                                        >
                                          {colorRelation.color?.name ||
                                            "Unknown"}
                                        </span>
                                      ))
                                  ) : product.colors &&
                                    product.colors.length > 0 ? (
                                    product.colors
                                      .slice(0, 2)
                                      .map((color, idx) => (
                                        <span
                                          key={idx}
                                          className="bg-blue-900/20 text-blue-300 px-1 rounded"
                                        >
                                          {color.name}
                                        </span>
                                      ))
                                  ) : product.color ? (
                                    <span className="bg-blue-900/20 text-blue-300 px-1 rounded">
                                      {product.color.name}
                                    </span>
                                  ) : null}

                                  {/* Show more colors indicator */}
                                  {product.productColors &&
                                  product.productColors.length > 2 ? (
                                    <span className="text-gray-500">
                                      +{product.productColors.length - 2}
                                    </span>
                                  ) : product.colors &&
                                    product.colors.length > 2 ? (
                                    <span className="text-gray-500">
                                      +{product.colors.length - 2}
                                    </span>
                                  ) : null}

                                  {/* Capacity */}
                                  {product.capacity && (
                                    <span className="bg-purple-900/20 text-purple-300 px-1 rounded">
                                      {product.capacity.name}
                                    </span>
                                  )}

                                  {/* Categories */}
                                  {product.productCategories &&
                                  product.productCategories.length > 0 ? (
                                    product.productCategories
                                      .slice(0, 1)
                                      .map((categoryRelation, idx) => (
                                        <span
                                          key={idx}
                                          className="bg-gray-700/50 text-gray-300 px-1 rounded"
                                        >
                                          {categoryRelation.category?.name ||
                                            "Unknown"}
                                        </span>
                                      ))
                                  ) : product.categories &&
                                    product.categories.length > 0 ? (
                                    product.categories
                                      .slice(0, 1)
                                      .map((category, idx) => (
                                        <span
                                          key={idx}
                                          className="bg-gray-700/50 text-gray-300 px-1 rounded"
                                        >
                                          {category.name}
                                        </span>
                                      ))
                                  ) : product.category ? (
                                    <span className="bg-gray-700/50 text-gray-300 px-1 rounded">
                                      {product.category.name}
                                    </span>
                                  ) : null}

                                  {/* Show more categories indicator */}
                                  {product.productCategories &&
                                  product.productCategories.length > 1 ? (
                                    <span className="text-gray-500">
                                      +{product.productCategories.length - 1}
                                    </span>
                                  ) : product.categories &&
                                    product.categories.length > 1 ? (
                                    <span className="text-gray-500">
                                      +{product.categories.length - 1}
                                    </span>
                                  ) : null}
                                </div>
                              </div>

                              {/* Price */}
                              <div className="text-sm text-gray-300">
                                {product.unitPrice
                                  ? product.unitPrice.toLocaleString()
                                  : "0"}
                                đ
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  {/* No results message */}
                  {showProductDropdown &&
                    activeItemIndex === index &&
                    productSearchTerm &&
                    productSearchResults.length === 0 &&
                    !searchingProducts && (
                      <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg p-4 text-center text-gray-400">
                        Không tìm thấy sản phẩm nào
                      </div>
                    )}
                </div>

                {/* Product selection error */}
                {errors[`item_${index}_product`] && (
                  <p className="text-xs text-red-400">
                    {errors[`item_${index}_product`]}
                  </p>
                )}

                {/* Other form fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Số lượng <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        onUpdateItem(
                          index,
                          "quantity",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className={`w-full px-3 py-2 bg-gray-700 border rounded-lg focus:ring-2 focus:ring-gray-500 text-white ${
                        errors[`item_${index}_quantity`]
                          ? "border-red-500"
                          : "border-gray-600"
                      }`}
                    />
                    {errors[`item_${index}_quantity`] && (
                      <p className="text-xs text-red-400 mt-1">
                        {errors[`item_${index}_quantity`]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Giá đơn vị (VND) <span className="text-red-400">*</span>
                      <span className="text-xs text-gray-400 ml-1">
                        (0 = tặng)
                      </span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={item.unitPrice}
                      onChange={(e) =>
                        onUpdateItem(
                          index,
                          "unitPrice",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className={`w-full px-3 py-2 bg-gray-700 border rounded-lg focus:ring-2 focus:ring-gray-500 text-white ${
                        errors[`item_${index}_price`]
                          ? "border-red-500"
                          : "border-gray-600"
                      }`}
                    />
                    {errors[`item_${index}_price`] && (
                      <p className="text-xs text-red-400 mt-1">
                        {errors[`item_${index}_price`]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Màu yêu cầu
                    </label>
                    <input
                      type="text"
                      value={item.requestedColor || ""}
                      onChange={(e) =>
                        onUpdateItem(index, "requestedColor", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 text-white placeholder-gray-400"
                      placeholder="Để trống nếu dùng màu mặc định"
                    />
                  </div>
                </div>
              </div>

              {item.product && item.product.id && item.product.id !== "" && (
                <div
                  className={`mt-3 p-3 rounded-lg ${
                    item.quantity > item.product.stockQuantity
                      ? "bg-red-900/20 border border-red-700"
                      : "bg-gray-700"
                  }`}
                >
                  {/* Debug logs */}
                  {(function () {
                    console.log("🔍 Product data for item", index, ":");
                    console.log("📋 Full product object:", item.product);
                    console.log(
                      "🔑 All product keys:",
                      Object.keys(item.product)
                    );
                    console.log("🎨 Color data:", {
                      color: item.product.color,
                      colors: item.product.colors,
                      productColors: item.product.productColors,
                      hasColor: "color" in item.product,
                      hasColors: "colors" in item.product,
                      hasProductColors: "productColors" in item.product,
                    });
                    console.log("📂 Category data:", {
                      category: item.product.category,
                      categories: item.product.categories,
                      productCategories: item.product.productCategories,
                      hasCategory: "category" in item.product,
                      hasCategories: "categories" in item.product,
                      hasProductCategories: "productCategories" in item.product,
                    });
                    return null;
                  })()}

                  <div className="flex items-start gap-3 mb-2">
                    {/* Product Image */}
                    <div className="w-16 h-16 flex-shrink-0">
                      {item.product.productImages &&
                      item.product.productImages.length > 0 ? (
                        <Image
                          src={item.product.productImages[0].url}
                          alt={item.product.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-600 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No img</span>
                        </div>
                      )}
                    </div>

                    {/* Product Name */}
                    <div className="flex-1">
                      <h5 className="text-white font-medium">
                        {item.product.name}
                      </h5>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {/* Stock Information */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-white">
                        Tồn kho:
                      </span>
                      <span
                        className={`text-sm font-medium px-2 py-1 rounded ${
                          item.quantity > item.product.stockQuantity
                            ? "bg-red-900/30 text-red-400"
                            : item.product.stockQuantity <= 1
                            ? "bg-yellow-900/30 text-yellow-400"
                            : "bg-green-900/30 text-green-400"
                        }`}
                      >
                        {item.product.stockQuantity}
                        {item.quantity > item.product.stockQuantity &&
                          " - KHÔNG ĐỦ HÀNG!"}
                        {item.product.stockQuantity <= 1 &&
                          item.product.stockQuantity > 0 &&
                          " - SẮP HẾT!"}
                        {item.product.stockQuantity === 0 && " - HẾT HÀNG!"}
                      </span>
                    </div>

                    {/* Product Details */}
                    <div className="space-y-2">
                      {/* Colors */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-gray-400">Màu:</span>
                        {(function () {
                          const productColors = item.product.productColors;
                          console.log("🎨 Color check for item", index, ":", {
                            hasProductColors: !!productColors,
                            isProductColorsArray: Array.isArray(productColors),
                            productColorsLength: productColors?.length,
                            productColorsData: productColors,
                          });
                          return null;
                        })()}
                        {item.product.productColors &&
                        Array.isArray(item.product.productColors) ? (
                          item.product.productColors.map(
                            (colorRelation, idx: number) => (
                              <span
                                key={idx}
                                className="text-xs bg-blue-900/30 text-blue-300 px-2 py-1 rounded"
                              >
                                {colorRelation.color?.name || "Unknown"}
                              </span>
                            )
                          )
                        ) : item.product.color ? (
                          <span className="text-xs bg-blue-900/30 text-blue-300 px-2 py-1 rounded">
                            {item.product.color.name}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">N/A</span>
                        )}
                      </div>

                      {/* Capacity */}
                      {item.product.capacity && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-gray-400">
                            Dung tích:
                          </span>
                          <span className="text-xs bg-purple-900/30 text-purple-300 px-2 py-1 rounded">
                            {item.product.capacity.name}
                          </span>
                        </div>
                      )}

                      {/* Categories */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-gray-400">Danh mục:</span>
                        {(function () {
                          const productCategories =
                            item.product.productCategories;
                          console.log(
                            "📂 Category check for item",
                            index,
                            ":",
                            {
                              hasProductCategories: !!productCategories,
                              isProductCategoriesArray:
                                Array.isArray(productCategories),
                              productCategoriesLength:
                                productCategories?.length,
                              productCategoriesData: productCategories,
                            }
                          );
                          return null;
                        })()}
                        {item.product.productCategories &&
                        Array.isArray(item.product.productCategories) ? (
                          item.product.productCategories.map(
                            (categoryRelation, idx: number) => (
                              <span
                                key={idx}
                                className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
                              >
                                {categoryRelation.category?.name || "Unknown"}
                              </span>
                            )
                          )
                        ) : item.product.category ? (
                          <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                            {item.product.category.name}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">N/A</span>
                        )}
                      </div>
                    </div>

                    {/* Warning badges */}
                    {(!item.product.isActive || item.product.isDeleted) && (
                      <div className="flex items-center gap-2 flex-wrap">
                        {!item.product.isActive && (
                          <span className="text-xs bg-red-900/30 text-red-400 px-2 py-1 rounded font-medium">
                            KHÔNG HOẠT ĐỘNG
                          </span>
                        )}
                        {item.product.isDeleted && (
                          <span className="text-xs bg-red-900/30 text-red-400 px-2 py-1 rounded font-medium">
                            ĐÃ XÓA
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Error messages for product validation */}
              <div className="mt-2 space-y-1">
                {errors[`item_${index}_product`] && (
                  <p className="text-xs text-red-400">
                    {errors[`item_${index}_product`]}
                  </p>
                )}
                {errors[`item_${index}_stock`] && (
                  <p className="text-xs text-red-400">
                    <span className="font-bold">⚠️</span>{" "}
                    {errors[`item_${index}_stock`]}
                  </p>
                )}
                {errors[`item_${index}_active`] && (
                  <p className="text-xs text-red-400">
                    <span className="font-bold">⚠️</span>{" "}
                    {errors[`item_${index}_active`]}
                  </p>
                )}
                {errors[`item_${index}_deleted`] && (
                  <p className="text-xs text-red-400">
                    <span className="font-bold">⚠️</span>{" "}
                    {errors[`item_${index}_deleted`]}
                  </p>
                )}
              </div>
            </div>
          ))}

          <button
            onClick={onAddItem}
            className="w-full p-3 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors"
          >
            + Thêm sản phẩm
          </button>

          {errors.items && (
            <p className="text-sm text-red-400">{errors.items}</p>
          )}
        </div>
      )}
    </div>
  );
}
