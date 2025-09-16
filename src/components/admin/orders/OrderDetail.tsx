"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { useAppSelector } from "@/store";
import {
  User,
  Package,
  MapPin,
  Calendar,
  FileText,
  Save,
  X,
  Plus,
  Minus,
} from "lucide-react";

interface OrderDetailData {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    fullName?: string;
    phone?: string;
    email?: string;
    messengerId?: string;
  };
  orderType: "PRODUCT" | "CUSTOM";
  status: string;
  totalAmount: string;
  originalShippingCost: string;
  shippingDiscount: string;
  shippingCost: string;
  customDescription?: string;
  deliveryAddress?: {
    city?: string;
    district?: string;
    addressLine?: string;
    postalCode?: string;
  };
  notes?: string;
  items?: Array<{
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    productSnapshot: {
      id: string;
      name: string;
      slug: string;
      color: {
        id: string;
        name: string;
        hexCode: string;
      };
      images: Array<{
        url: string;
        order: number;
      }>;
      capacity: {
        id: string;
        name: string;
        volumeMl: number;
      };
      category: {
        id: string;
        name: string;
        slug: string;
      };
      unitPrice: number;
      capturedAt: string;
      description: string;
    };
    product: {
      id: string;
      name: string;
      slug: string;
      isActive: boolean;
    };
  }>;
  _count?: {
    items: number;
  };
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  completedAt?: string;
}

interface OrderDetailProps {
  orderId: string;
  isEditing: boolean;
}

interface EditableOrderData {
  deliveryAddress?: {
    addressLine?: string;
    district?: string;
    city?: string;
    postalCode?: string;
  };
  originalShippingCost: string;
  shippingDiscount: string;
  shippingCost: string;
  notes?: string;
  items?: Array<{
    productId: string;
    quantity: number;
    unitPrice?: number;
    requestedColor?: string;
    updateBasePrice?: boolean; // Flag to update product's base price
  }>;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  stockQuantity: number;
  unitPrice: number; // Now required with default price
  color: {
    id: string;
    name: string;
    hexCode: string;
  };
  capacity: {
    id: string;
    name: string;
    volumeMl: number;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  productImages: Array<{
    url: string;
    order: number;
  }>;
  isActive: boolean;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Chờ xử lý", color: "bg-yellow-100 text-yellow-800" },
  CONFIRMED: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-800" },
  PROCESSING: { label: "Đang xử lý", color: "bg-purple-100 text-purple-800" },
  SHIPPED: { label: "Đang giao", color: "bg-orange-100 text-orange-800" },
  DELIVERED: { label: "Đã giao", color: "bg-green-100 text-green-800" },
  CANCELLED: { label: "Đã hủy", color: "bg-red-100 text-red-800" },
  pending: { label: "Chờ xử lý", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-800" },
  processing: { label: "Đang xử lý", color: "bg-purple-100 text-purple-800" },
  shipped: { label: "Đang giao", color: "bg-orange-100 text-orange-800" },
  delivered: { label: "Đã giao", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-800" },
};

export function OrderDetail({ orderId, isEditing }: OrderDetailProps) {
  const [order, setOrder] = useState<OrderDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<EditableOrderData>({
    deliveryAddress: {},
    originalShippingCost: "0",
    shippingDiscount: "0",
    shippingCost: "0",
    notes: "",
    items: [],
  });

  // Get auth token from Redux
  const { token } = useAppSelector((state) => state.auth);

  // Product selection state
  const [products, setProducts] = useState<Product[]>([]);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productPrices, setProductPrices] = useState<{ [key: string]: string }>(
    {}
  );
  const [productQuantities, setProductQuantities] = useState<{
    [key: string]: number;
  }>({});

  // Helper function to check if shipping is free
  const isFreeShipping = (orderData: OrderDetailData) => {
    return (
      Number(orderData.shippingDiscount) ===
      Number(orderData.originalShippingCost)
    );
  };

  useEffect(() => {
    const fetchOrder = async () => {
      if (!token) return; // Don't fetch if no token

      setLoading(true);
      try {
        const response = await fetch(`/api/admin/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        console.log("Order detail API response:", data);

        if (data.success) {
          setOrder(data.data);
          // Initialize edit data with current order data
          setEditData({
            deliveryAddress: data.data.deliveryAddress || {},
            originalShippingCost: data.data.originalShippingCost || "0",
            shippingDiscount: data.data.shippingDiscount || "0",
            shippingCost: data.data.shippingCost || "0",
            notes: data.data.notes || "",
            items:
              data.data.items?.map(
                (item: NonNullable<OrderDetailData["items"]>[number]) => ({
                  productId: item.productId,
                  quantity: item.quantity,
                  unitPrice: item.productSnapshot.unitPrice,
                })
              ) || [],
          });
        } else {
          console.error("Failed to fetch order:", data.message);
          setOrder(null);
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, token]);

  // Save order changes
  const saveChanges = async () => {
    if (!order || !token) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editData),
      });

      const data = await response.json();
      if (data.success) {
        setOrder(data.data);
        toast.success("Đơn hàng đã được cập nhật thành công!");
      } else {
        // Handle specific error codes
        if (data.error?.code === "ORDER_NOT_EDITABLE") {
          toast.error(
            "Đơn hàng chỉ có thể chỉnh sửa khi ở trạng thái 'Chờ xử lý' hoặc 'Đã xác nhận'"
          );
        } else if (data.error?.code === "VALIDATION_ERROR") {
          toast.error("Dữ liệu nhập vào không hợp lệ. Vui lòng kiểm tra lại!");
        } else {
          toast.error(data.message || "Có lỗi xảy ra khi cập nhật đơn hàng");
        }
        console.log("lỗi", data);
      }
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Có lỗi xảy ra khi cập nhật đơn hàng");
    } finally {
      setSaving(false);
    }
  };

  // Update edit data
  const updateEditData = (
    field: keyof EditableOrderData,
    value: string | number
  ) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Update address field
  const updateAddress = (field: string, value: string) => {
    setEditData((prev) => ({
      ...prev,
      deliveryAddress: {
        ...prev.deliveryAddress,
        [field]: value,
      },
    }));
  };

  // Update item quantity
  const updateItemQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return;

    setEditData((prev) => ({
      ...prev,
      items: (prev.items || []).map((item, i) =>
        i === index ? { ...item, quantity } : item
      ),
    }));
  };

  // Remove item
  const removeItem = (index: number) => {
    setEditData((prev) => ({
      ...prev,
      items: (prev.items || []).filter((_, i) => i !== index),
    }));
  };

  // Fetch products for selection
  const fetchProducts = async () => {
    if (!token) return;

    setLoadingProducts(true);
    try {
      const response = await fetch("/api/admin/products", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("Products fetch response:", data);
      if (data.success && data.data && data.data.items) {
        setProducts(
          data.data.items.filter(
            (product: Product) => product.stockQuantity > 0 && product.isActive
          )
        );
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Có lỗi khi tải danh sách sản phẩm");
    } finally {
      setLoadingProducts(false);
    }
  };

  // Add product to order
  const addProduct = (
    product: Product,
    quantity: number = 1,
    customPrice?: number
  ) => {
    const finalPrice = customPrice || product.unitPrice;

    // Validate price
    if (!finalPrice || finalPrice <= 0) {
      toast.error("Giá sản phẩm không hợp lệ");
      return;
    }

    // Check if product already exists in items
    const existingItemIndex = editData.items?.findIndex(
      (item) => item.productId === product.id
    );

    if (existingItemIndex !== undefined && existingItemIndex >= 0) {
      // Update quantity if product already exists
      updateItemQuantity(
        existingItemIndex,
        (editData.items?.[existingItemIndex]?.quantity || 0) + quantity
      );
    } else {
      // Add new product with specified price
      setEditData((prev) => ({
        ...prev,
        items: [
          ...(prev.items || []),
          {
            productId: product.id,
            quantity,
            unitPrice: finalPrice,
          },
        ],
      }));
    }

    // Clear the price and quantity for this product
    setProductPrices((prev) => {
      const newPrices = { ...prev };
      delete newPrices[product.id];
      return newPrices;
    });
    setProductQuantities((prev) => {
      const newQuantities = { ...prev };
      delete newQuantities[product.id];
      return newQuantities;
    });

    setShowProductSelector(false);
    const priceMessage = customPrice
      ? `Đã thêm ${product.name} với giá tùy chỉnh ${formatCurrency(
          finalPrice
        )}`
      : `Đã thêm ${product.name} với giá ${formatCurrency(finalPrice)}`;
    toast.success(priceMessage);
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(typeof amount === "string" ? Number(amount) : amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không tìm thấy đơn hàng
            </h3>
            <p className="text-gray-600">
              Đơn hàng không tồn tại hoặc đã bị xóa.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {isEditing && (
          <div className="flex justify-end mb-4">
            <button
              onClick={saveChanges}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        )}

        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Đơn hàng #{order.orderNumber}
            </h2>
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  statusConfig[order.status]?.color ||
                  "bg-gray-100 text-gray-800"
                }`}
              >
                {statusConfig[order.status]?.label || order.status}
              </span>
              <span className="text-gray-500">
                {order.orderType === "CUSTOM"
                  ? "Đơn tùy chỉnh"
                  : "Đơn sản phẩm"}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(
                Number(order.totalAmount) +
                  (isFreeShipping(order) ? 0 : Number(order.shippingCost))
              )}
            </div>
            <div className="text-sm text-gray-500">
              {isFreeShipping(order)
                ? `Miễn phí vận chuyển (Giảm: ${formatCurrency(
                    order.originalShippingCost
                  )})`
                : `+ ${formatCurrency(order.shippingCost)} ship`}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Customer Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-400" />
              <h3 className="font-medium text-gray-900">
                Thông tin khách hàng
              </h3>
            </div>
            <div className="space-y-1">
              <div className="font-medium">
                {order.customer.fullName || "Khách hàng"}
              </div>
              <div className="text-gray-700">{order.customer.phone}</div>
              {order.customer.email && (
                <div className="text-gray-600">{order.customer.email}</div>
              )}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-400" />
              <h3 className="font-medium text-gray-900">Địa chỉ giao hàng</h3>
            </div>
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Địa chỉ"
                  value={editData.deliveryAddress?.addressLine || ""}
                  onChange={(e) => updateAddress("addressLine", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Quận/Huyện"
                  value={editData.deliveryAddress?.district || ""}
                  onChange={(e) => updateAddress("district", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Thành phố"
                  value={editData.deliveryAddress?.city || ""}
                  onChange={(e) => updateAddress("city", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Mã bưu điện"
                  value={editData.deliveryAddress?.postalCode || ""}
                  onChange={(e) => updateAddress("postalCode", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ) : order.deliveryAddress ? (
              <div className="space-y-1">
                <div className="font-medium">
                  {order.deliveryAddress.city || "Chưa có địa chỉ"}
                </div>
                <div className="text-gray-700">
                  {order.deliveryAddress.addressLine}
                </div>
                <div className="text-gray-600">
                  {[order.deliveryAddress.district, order.deliveryAddress.city]
                    .filter(Boolean)
                    .join(", ")}
                </div>
              </div>
            ) : (
              <div className="text-gray-500">Chưa có địa chỉ giao hàng</div>
            )}
          </div>

          {/* Order Timeline */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <h3 className="font-medium text-gray-900">Thời gian</h3>
            </div>
            <div className="space-y-1">
              <div className="text-sm">
                <span className="text-gray-600">Tạo:</span>{" "}
                {formatDate(order.createdAt)}
              </div>
              {order.confirmedAt && (
                <div className="text-sm">
                  <span className="text-gray-600">Xác nhận:</span>{" "}
                  {formatDate(order.confirmedAt)}
                </div>
              )}
              {order.completedAt && (
                <div className="text-sm">
                  <span className="text-gray-600">Hoàn thành:</span>{" "}
                  {formatDate(order.completedAt)}
                </div>
              )}
            </div>
          </div>
        </div>

        {(order.notes || isEditing) && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-gray-400" />
              <h3 className="font-medium text-gray-900">Ghi chú</h3>
            </div>
            {isEditing ? (
              <textarea
                placeholder="Nhập ghi chú..."
                value={editData.notes || ""}
                onChange={(e) => updateEditData("notes", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-700">{order.notes}</p>
            )}
          </div>
        )}
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Chi tiết sản phẩm
        </h3>

        {order.orderType === "CUSTOM" ? (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-5 h-5 text-gray-600" />
              <h4 className="font-medium text-gray-900">Đơn hàng tùy chỉnh</h4>
            </div>
            <p className="text-gray-700">
              {order.customDescription || "Không có mô tả"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {order.items?.map((item, index) => (
              <div
                key={item.id}
                className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg"
              >
                {item.productSnapshot.images.length > 0 && (
                  <Image
                    src={item.productSnapshot.images[0].url}
                    alt={item.productSnapshot.name}
                    width={64}
                    height={64}
                    className="object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {item.productSnapshot.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {item.productSnapshot.color.name} •{" "}
                        {item.productSnapshot.capacity.name} •{" "}
                        {item.productSnapshot.category.name}
                      </p>
                    </div>
                    <div className="text-right">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateItemQuantity(
                                index,
                                (editData.items?.[index]?.quantity ||
                                  item.quantity) - 1
                              )
                            }
                            className="p-1 text-gray-500 hover:text-gray-700"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <input
                            type="number"
                            value={
                              editData.items?.[index]?.quantity || item.quantity
                            }
                            onChange={(e) =>
                              updateItemQuantity(
                                index,
                                parseInt(e.target.value) || 1
                              )
                            }
                            min="1"
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <button
                            onClick={() =>
                              updateItemQuantity(
                                index,
                                (editData.items?.[index]?.quantity ||
                                  item.quantity) + 1
                              )
                            }
                            className="p-1 text-gray-500 hover:text-gray-700"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeItem(index)}
                            className="p-1 text-red-500 hover:text-red-700 ml-2"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="font-medium">
                            {formatCurrency(item.productSnapshot.unitPrice)}
                          </div>
                          <div className="text-sm text-gray-500">
                            x {item.quantity}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Màu: {item.productSnapshot.color.name}
                    </div>
                    <div className="font-medium">
                      {formatCurrency(
                        (editData.items?.[index]?.quantity || item.quantity) *
                          item.productSnapshot.unitPrice
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Product Button (only in editing mode for product orders) */}
        {isEditing && order.orderType === "PRODUCT" && (
          <div className="mt-4">
            <button
              onClick={() => {
                if (!showProductSelector) {
                  fetchProducts();
                  // Reset prices and quantities when opening
                  setProductPrices({});
                  setProductQuantities({});
                } else {
                  // Clear state when closing
                  setProductPrices({});
                  setProductQuantities({});
                }
                setShowProductSelector(!showProductSelector);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="w-4 h-4" />
              Thêm sản phẩm
            </button>

            {/* Product Selector */}
            {showProductSelector && (
              <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-3">
                  Chọn sản phẩm để thêm:
                </h4>
                {loadingProducts ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-2">
                      Đang tải sản phẩm...
                    </p>
                  </div>
                ) : products.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 max-h-80 overflow-y-auto">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="p-4 bg-white border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-start gap-4">
                          {/* Product Image */}
                          {product.productImages.length > 0 && (
                            <Image
                              src={product.productImages[0].url}
                              alt={product.name}
                              width={60}
                              height={60}
                              className="object-cover rounded-lg flex-shrink-0"
                            />
                          )}

                          {/* Product Info */}
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 mb-1">
                              {product.name}
                            </h5>
                            <p className="text-sm text-gray-600 mb-1">
                              {product.color.name} • {product.capacity.name}
                            </p>
                            <p className="text-sm text-gray-500 mb-3">
                              Còn: {product.stockQuantity} • Giá:{" "}
                              {formatCurrency(product.unitPrice)}
                            </p>{" "}
                            {/* Price and Quantity Inputs */}
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Giá (VND) - Mặc định:{" "}
                                  {formatCurrency(product.unitPrice)}
                                </label>
                                <input
                                  type="number"
                                  placeholder={`Mặc định: ${product.unitPrice}`}
                                  value={productPrices[product.id] || ""}
                                  onChange={(e) =>
                                    setProductPrices((prev) => ({
                                      ...prev,
                                      [product.id]: e.target.value,
                                    }))
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">
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
                                  value={productQuantities[product.id] || 1}
                                  onChange={(e) =>
                                    setProductQuantities((prev) => ({
                                      ...prev,
                                      [product.id]:
                                        parseInt(e.target.value) || 1,
                                    }))
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                            </div>
                            {/* Add Button */}
                            <button
                              onClick={() => {
                                const customPrice = productPrices[product.id]
                                  ? parseFloat(productPrices[product.id])
                                  : undefined;
                                const quantity =
                                  productQuantities[product.id] || 1;
                                addProduct(product, quantity, customPrice);
                              }}
                              className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                            >
                              Thêm vào đơn hàng
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Không có sản phẩm nào còn hàng
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Order Summary */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Tạm tính:</span>
              <span className="font-medium">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phí vận chuyển:</span>
              {isEditing ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Gốc:</span>
                    <input
                      type="number"
                      value={editData.originalShippingCost}
                      onChange={(e) =>
                        updateEditData("originalShippingCost", e.target.value)
                      }
                      className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Giảm:</span>
                    <input
                      type="number"
                      value={editData.shippingDiscount}
                      onChange={(e) =>
                        updateEditData("shippingDiscount", e.target.value)
                      }
                      className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Thực:</span>
                    <input
                      type="number"
                      value={editData.shippingCost}
                      onChange={(e) =>
                        updateEditData("shippingCost", e.target.value)
                      }
                      className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ) : (
                <span className="font-medium">
                  {isFreeShipping(order) ? (
                    <span>
                      <span className="text-green-600">Miễn phí</span>
                      <span className="text-gray-500 text-sm ml-2">
                        (Giảm: {formatCurrency(order.originalShippingCost)})
                      </span>
                    </span>
                  ) : (
                    formatCurrency(order.shippingCost)
                  )}
                </span>
              )}
            </div>
            <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2">
              <span>Tổng cộng:</span>
              <span>
                {isEditing
                  ? formatCurrency(
                      Number(order.totalAmount) + Number(editData.shippingCost)
                    )
                  : formatCurrency(
                      Number(order.totalAmount) +
                        (isFreeShipping(order) ? 0 : Number(order.shippingCost))
                    )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
