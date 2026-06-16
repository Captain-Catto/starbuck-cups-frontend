import { OrderItem, Product } from "@/types/orders";
import OptimizedImage from "@/components/OptimizedImage";
import { ProductSearchField } from "./ProductSearchField";
import { ProductSearchControls, UpdateItemHandler } from "./types";

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

function ProductItemInputs({
  item,
  index,
  errors,
  onUpdateItem,
}: {
  item: OrderItem;
  index: number;
  errors: Record<string, string>;
  onUpdateItem: UpdateItemHandler;
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

export function ProductOrderItem({
  item,
  index,
  itemCount,
  errors,
  search,
  onRemoveItem,
  onUpdateItem,
}: {
  item: OrderItem;
  index: number;
  itemCount: number;
  errors: Record<string, string>;
  search: ProductSearchControls;
  onRemoveItem: (index: number) => void;
  onUpdateItem: UpdateItemHandler;
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
          search={search}
          onUpdateItem={onUpdateItem}
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
