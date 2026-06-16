import { OrderItem, Product } from "@/types/orders";
import OptimizedImage from "@/components/OptimizedImage";
import { ProductSearchControls, UpdateItemHandler } from "./types";

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

export function ProductSearchField({
  item,
  index,
  search,
  onUpdateItem,
}: {
  item: OrderItem;
  index: number;
  search: ProductSearchControls;
  onUpdateItem: UpdateItemHandler;
}) {
  const {
    activeItemIndex,
    productSearchTerm,
    searchingProducts,
    productSearchResults,
    showProductDropdown,
    onSearch,
    onClearSearch,
    onSelectProduct,
    setActiveItemIndex,
    setProductSearchTerm,
    setShowProductDropdown,
  } = search;

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
