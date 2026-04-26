import { type Dispatch, type SetStateAction } from "react";
import { Plus } from "lucide-react";
import OptimizedImage from "@/components/OptimizedImage";
import { getFirstProductImageUrl } from "@/lib/utils/image";
import type { SelectableProduct } from "@/hooks/admin/useOrderDetailEdit";

interface ProductColor { color?: { name?: string } }

interface OrderProductSelectorProps {
  show: boolean;
  loading: boolean;
  filteredProducts: SelectableProduct[];
  searchTerm: string;
  selectedProduct: SelectableProduct | null;
  productPrices: Record<string, string>;
  productQuantities: Record<string, number>;
  onToggle: () => void;
  onSearch: (term: string) => void;
  onSelectProduct: (product: SelectableProduct | null) => void;
  onAddProduct: (product: SelectableProduct, quantity: number, customPrice?: number) => void;
  onSetPrices: Dispatch<SetStateAction<Record<string, string>>>;
  onSetQuantities: Dispatch<SetStateAction<Record<string, number>>>;
  formatCurrency: (amount: string | number) => string;
}

export function OrderProductSelector({
  show,
  loading,
  filteredProducts,
  searchTerm,
  selectedProduct,
  productPrices,
  productQuantities,
  onToggle,
  onSearch,
  onSelectProduct,
  onAddProduct,
  onSetPrices,
  onSetQuantities,
  formatCurrency,
}: OrderProductSelectorProps) {
  return (
    <div className="mt-4">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        <Plus className="w-4 h-4" />
        Thêm sản phẩm
      </button>

      {show && (
        <div className="mt-4 p-4 border border-gray-700 rounded-lg bg-gray-700">
          <h4 className="font-medium text-white mb-3">Tìm kiếm sản phẩm để thêm:</h4>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Nhập tên sản phẩm để tìm kiếm..."
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto" />
              <p className="text-sm text-gray-300 mt-2">Đang tìm kiếm sản phẩm...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <>
              <p className="text-sm text-gray-300 mb-3">
                Tìm thấy {filteredProducts.length} sản phẩm
              </p>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="p-3 bg-gray-800 border border-gray-700 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onSelectProduct(product)}
                  >
                    <div className="flex items-center gap-3">
                      {getFirstProductImageUrl(product.productImages) && (
                        <OptimizedImage
                          src={getFirstProductImageUrl(product.productImages)}
                          alt={product.name}
                          width={50}
                          height={50}
                          className="object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      <div className="flex-1">
                        <h5 className="font-medium text-white mb-1">{product.name}</h5>
                        <p className="text-sm text-gray-300 mb-1">
                          {/* @ts-expect-error - product has productColors array at runtime */}
                          {product.productColors?.map((pc: ProductColor) => pc.color?.name).join(", ") || "N/A"}
                          {" • "}
                          {product.capacity?.name || "N/A"}
                        </p>
                        <p className="text-sm text-gray-400">
                          Còn: {product.stockQuantity} • Giá: {formatCurrency(product.unitPrice)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); onSelectProduct(product); }}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Chọn
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : searchTerm ? (
            <p className="text-gray-400 text-center py-4">
              Không tìm thấy sản phẩm nào với từ khóa &quot;{searchTerm}&quot;
            </p>
          ) : (
            <p className="text-gray-400 text-center py-4">
              Nhập tên sản phẩm để bắt đầu tìm kiếm
            </p>
          )}

          {selectedProduct && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h5 className="font-medium text-white mb-3">
                Sản phẩm đã chọn: {selectedProduct.name}
              </h5>
              <div className="flex items-start gap-4">
                {getFirstProductImageUrl(selectedProduct.productImages) && (
                  <OptimizedImage
                    src={getFirstProductImageUrl(selectedProduct.productImages)}
                    alt={selectedProduct.name}
                    width={80}
                    height={80}
                    className="object-cover rounded-lg flex-shrink-0"
                  />
                )}
                <div className="flex-1">
                  <p className="text-sm text-gray-300 mb-1">
                    {/* @ts-expect-error */}
                    {selectedProduct.productColors?.map((pc: any) => pc.color?.name).join(", ") || "N/A"}
                    {" • "}
                    {selectedProduct.capacity?.name || "N/A"}
                  </p>
                  <p className="text-sm text-gray-400 mb-3">
                    Còn: {selectedProduct.stockQuantity} • Giá gốc:{" "}
                    {formatCurrency(selectedProduct.unitPrice)}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Giá (VND) - Mặc định: {formatCurrency(selectedProduct.unitPrice)}
                      </label>
                      <input
                        type="number"
                        placeholder={`Mặc định: ${selectedProduct.unitPrice}`}
                        value={productPrices[selectedProduct.id] || ""}
                        onChange={(e) =>
                          onSetPrices((prev) => ({ ...prev, [selectedProduct.id]: e.target.value }))
                        }
                        className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Để trống để sử dụng giá mặc định
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Số lượng
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={productQuantities[selectedProduct.id] || 1}
                        onChange={(e) =>
                          onSetQuantities((prev) => ({
                            ...prev,
                            [selectedProduct.id]: parseInt(e.target.value) || 1,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const customPrice = productPrices[selectedProduct.id]
                          ? parseFloat(productPrices[selectedProduct.id])
                          : undefined;
                        onAddProduct(
                          selectedProduct,
                          productQuantities[selectedProduct.id] || 1,
                          customPrice
                        );
                        onSelectProduct(null);
                        onSearch("");
                      }}
                      className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      Thêm vào đơn hàng
                    </button>
                    <button
                      onClick={() => {
                        onSetPrices((prev) => {
                          const next = { ...prev };
                          delete next[selectedProduct.id];
                          return next;
                        });
                        onSetQuantities((prev) => {
                          const next = { ...prev };
                          delete next[selectedProduct.id];
                          return next;
                        });
                        onSelectProduct(null);
                      }}
                      className="px-4 py-2 bg-gray-700 text-white text-sm rounded hover:bg-gray-600"
                    >
                      Hủy chọn
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
