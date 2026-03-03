"use client";

import { useState, useEffect } from "react";
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
  Trash2,
} from "lucide-react";
import {
  getFirstProductImageUrl,
  getProductSnapshotImageUrl,
} from "@/lib/utils/image";
import OptimizedImage from "@/components/OptimizedImage";

interface ProductColor {
  color?: {
    name?: string;
  };
}

interface Category {
  name?: string;
}

interface Color {
  name?: string;
}

interface OrderDetailData {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    fullName?: string;
    email?: string;
    messengerId?: string;
    customerPhones?: Array<{
      id: string;
      phoneNumber: string;
      isMain: boolean;
    }>;
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
  totalAmount?: string;
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
    totalAmount: "0",
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

  // Search and selection state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Filter products based on search term
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

        if (data.success) {
          setOrder(data.data);
          // Initialize edit data with current order data
          setEditData({
            deliveryAddress: data.data.deliveryAddress || {},
            originalShippingCost: data.data.originalShippingCost || "0",
            shippingDiscount: data.data.shippingDiscount || "0",
            shippingCost: data.data.shippingCost || "0",
            totalAmount: data.data.totalAmount || "0",
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

          setOrder(null);
        }
      } catch (error) {

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

      }
    } catch (error) {

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

  // Update item price
  const updateItemPrice = (index: number, unitPrice: number) => {
    if (unitPrice < 0) return;

    setEditData((prev) => ({
      ...prev,
      items: (prev.items || []).map((item, i) =>
        i === index ? { ...item, unitPrice } : item
      ),
    }));
  };

  // Calculate updated total amount based on edited items
  const calculateUpdatedTotal = () => {
    if (!order) {
      return 0;
    }

    if (!isEditing || !editData.items || editData.items.length === 0) {
      return Number(order.totalAmount || 0);
    }

    // Calculate total from edited items
    const itemsTotal = editData.items.reduce((total, item) => {
      const quantity = item.quantity;
      const unitPrice = item.unitPrice || 0;
      return total + quantity * unitPrice;
    }, 0);

    return itemsTotal;
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

      if (data.success && data.data && data.data.items) {
        setProducts(
          data.data.items.filter(
            (product: Product) => product.stockQuantity > 0 && product.isActive
          )
        );
      }
    } catch (error) {

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
    const finalPrice =
      customPrice !== undefined ? customPrice : product.unitPrice;

    // Validate price
    if (finalPrice === null || finalPrice === undefined || finalPrice <= 0) {
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
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-600 rounded w-1/4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-600 rounded w-3/4"></div>
              <div className="h-4 bg-gray-600 rounded w-1/2"></div>
              <div className="h-4 bg-gray-600 rounded w-2/3"></div>
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
            <h3 className="text-lg font-medium text-white mb-2">
              Không tìm thấy đơn hàng
            </h3>
            <p className="text-gray-300">
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
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
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
            <h2 className="text-xl font-semibold text-white mb-2">
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
              <span className="text-gray-400">
                {order.orderType === "CUSTOM"
                  ? "Đơn tùy chỉnh"
                  : "Đơn sản phẩm"}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              {formatCurrency(
                Number(order.totalAmount) +
                  (isFreeShipping(order) ? 0 : Number(order.shippingCost))
              )}
            </div>
            <div className="text-sm text-gray-400">
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
              <h3 className="font-medium text-white">Thông tin khách hàng</h3>
            </div>
            <div className="space-y-1">
              <div className="font-medium text-white">
                {order.customer.fullName || "Khách hàng"}
              </div>
              <div className="text-gray-300">
                {order.customer.customerPhones?.find((phone) => phone.isMain)
                  ?.phoneNumber ||
                  order.customer.customerPhones?.[0]?.phoneNumber ||
                  "Chưa có số điện thoại"}
              </div>
              {order.customer.email && (
                <div className="text-gray-300">{order.customer.email}</div>
              )}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-400" />
              <h3 className="font-medium text-white">Địa chỉ giao hàng</h3>
            </div>
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Địa chỉ"
                  value={editData.deliveryAddress?.addressLine || ""}
                  onChange={(e) => updateAddress("addressLine", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Quận/Huyện"
                  value={editData.deliveryAddress?.district || ""}
                  onChange={(e) => updateAddress("district", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Thành phố"
                  value={editData.deliveryAddress?.city || ""}
                  onChange={(e) => updateAddress("city", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Mã bưu điện"
                  value={editData.deliveryAddress?.postalCode || ""}
                  onChange={(e) => updateAddress("postalCode", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ) : order.deliveryAddress ? (
              <div className="space-y-1">
                <div className="font-medium text-white">
                  {order.deliveryAddress.addressLine || "Chưa có địa chỉ"}
                </div>
                <div className="text-gray-300">
                  {[order.deliveryAddress.district, order.deliveryAddress.city]
                    .filter(Boolean)
                    .join(", ")}
                </div>
                {order.deliveryAddress.postalCode && (
                  <div className="text-gray-300">
                    {order.deliveryAddress.postalCode}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-400">Chưa có địa chỉ giao hàng</div>
            )}
          </div>

          {/* Order Timeline */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <h3 className="font-medium text-white">Thời gian</h3>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-gray-300">
                <span>Tạo:</span> {formatDate(order.createdAt)}
              </div>
              {order.confirmedAt && (
                <div className="text-sm text-gray-300">
                  <span>Xác nhận:</span> {formatDate(order.confirmedAt)}
                </div>
              )}
              {order.completedAt && (
                <div className="text-sm text-gray-300">
                  <span>Hoàn thành:</span> {formatDate(order.completedAt)}
                </div>
              )}
            </div>
          </div>
        </div>

        {(order.notes || isEditing) && (
          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-gray-400" />
              <h3 className="font-medium text-white">Ghi chú</h3>
            </div>
            {isEditing ? (
              <textarea
                placeholder="Nhập ghi chú..."
                value={editData.notes || ""}
                onChange={(e) => updateEditData("notes", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-300">{order.notes}</p>
            )}
          </div>
        )}
      </div>

      {/* Order Items */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Chi tiết sản phẩm
        </h3>

        {order.orderType === "CUSTOM" ? (
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-5 h-5 text-gray-300" />
              <h4 className="font-medium text-white">Đơn hàng tùy chỉnh</h4>
            </div>
            <p className="text-gray-700">
              {order.customDescription || "Không có mô tả"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Display existing items */}
            {order.items?.map((item, originalIndex: number) => {
              // When editing, check if this item still exists in editData
              if (isEditing && editData.items) {
                const editItemExists = originalIndex < editData.items.length;
                if (!editItemExists) return null;
              }

              return (
                <div
                  key={item.id}
                  className="flex items-start gap-4 p-4 border border-gray-700 rounded-lg"
                >
                  {(() => {
                    const imageUrl = getProductSnapshotImageUrl(
                      item.productSnapshot
                    );
                    return imageUrl ? (
                      <OptimizedImage
                        src={imageUrl}
                        alt={item.productSnapshot.name}
                        width={64}
                        height={64}
                        className="object-cover rounded-lg"
                      />
                    ) : null;
                  })()}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-white">
                          {item.productSnapshot.name}
                        </h4>
                        <div className="text-sm text-gray-300 space-y-1">
                          <div>
                            <span className="font-medium">Màu sắc: </span>
                            {/* @ts-expect-error - productSnapshot has colors array */}
                            {item.productSnapshot.colors
                              ?.map((color: Color) => color.name)
                              .join(" - ") || "N/A"}
                          </div>
                          <div>
                            <span className="font-medium">Dung tích: </span>
                            {item.productSnapshot.capacity?.name || "N/A"}
                          </div>
                          <div>
                            <span className="font-medium">Danh mục: </span>
                            {/* @ts-expect-error - productSnapshot has categories array */}
                            {item.productSnapshot.categories
                              ?.map((category: Category) => category.name)
                              .join(" - ") || "N/A"}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                updateItemQuantity(
                                  originalIndex,
                                  (editData.items?.[originalIndex]?.quantity ||
                                    item.quantity) - 1
                                )
                              }
                              className="p-1 text-gray-400 hover:text-gray-700"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <input
                              type="number"
                              value={
                                editData.items?.[originalIndex]?.quantity ||
                                item.quantity
                              }
                              onChange={(e) =>
                                updateItemQuantity(
                                  originalIndex,
                                  parseInt(e.target.value) || 1
                                )
                              }
                              min="1"
                              className="w-16 px-2 py-1 border border-gray-600 bg-gray-700 text-white rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                              onClick={() =>
                                updateItemQuantity(
                                  originalIndex,
                                  (editData.items?.[originalIndex]?.quantity ||
                                    item.quantity) + 1
                                )
                              }
                              className="p-1 text-gray-400 hover:text-gray-700"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeItem(originalIndex)}
                              className="p-1 text-red-500 hover:text-red-700 ml-2"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div>
                            <div className="font-medium text-gray-400">
                              {formatCurrency(item.productSnapshot.unitPrice)}
                            </div>
                            <div className="text-sm text-gray-400">
                              x {item.quantity}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Price Editing Section - Only show in editing mode */}
                    {isEditing && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Giá sản phẩm (VND)
                            </label>
                            <input
                              type="number"
                              value={
                                editData.items?.[originalIndex]?.unitPrice ||
                                item.productSnapshot.unitPrice
                              }
                              onChange={(e) =>
                                updateItemPrice(
                                  originalIndex,
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              min="0"
                              step="1000"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Thành tiền
                            </label>
                            <div className="px-3 py-2 bg-gray-700 border border-gray-700 rounded text-sm font-medium text-white">
                              {formatCurrency(
                                (editData.items?.[originalIndex]?.quantity ||
                                  item.quantity) *
                                  (editData.items?.[originalIndex]?.unitPrice ||
                                    item.productSnapshot.unitPrice)
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-2 flex items-center justify-end">
                      <div className="font-medium text-white">
                        {formatCurrency(
                          (editData.items?.[originalIndex]?.quantity ||
                            item.quantity) *
                            (editData.items?.[originalIndex]?.unitPrice ||
                              item.productSnapshot.unitPrice)
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Display newly added items when editing */}
            {isEditing &&
              editData.items
                ?.filter(
                  (editItem) =>
                    !order.items?.some(
                      (orderItem) => orderItem.productId === editItem.productId
                    )
                )
                .map((newItem, index) => (
                  <div
                    key={`new-${newItem.productId}-${index}`}
                    className="flex items-start gap-4 p-4 border border-gray-700 rounded-lg bg-gray-700"
                  >
                    <div className="w-16 h-16 bg-gray-600 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-lg font-medium text-white">
                            Sản phẩm mới (ID: {newItem.productId})
                          </h4>
                          <p className="text-sm text-green-600 font-medium">
                            Mới thêm vào đơn hàng
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-300">
                              Số lượng:
                            </span>
                            <input
                              type="number"
                              min="1"
                              value={newItem.quantity}
                              onChange={(e) => {
                                const newQuantity =
                                  parseInt(e.target.value) || 1;
                                const newItemIndex = editData.items?.findIndex(
                                  (item) => item.productId === newItem.productId
                                );
                                if (
                                  newItemIndex !== undefined &&
                                  newItemIndex >= 0
                                ) {
                                  updateItemQuantity(newItemIndex, newQuantity);
                                }
                              }}
                              className="w-20 px-2 py-1 text-sm border border-gray-600 bg-gray-700 text-white rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-gray-300">Đơn giá</p>
                            <p className="text-lg font-semibold text-white">
                              {formatCurrency(newItem.unitPrice || 0)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-300">Tổng</p>
                            <p className="text-lg font-semibold text-white">
                              {formatCurrency(
                                (newItem.quantity || 1) *
                                  (newItem.unitPrice || 0)
                              )}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              removeItem(
                                editData.items?.findIndex(
                                  (item) => item.productId === newItem.productId
                                ) || 0
                              )
                            }
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full"
                            title="Xóa sản phẩm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
                  // Reset all states when opening
                  setProductPrices({});
                  setProductQuantities({});
                  setSearchTerm("");
                  setSelectedProduct(null);
                } else {
                  // Clear all states when closing
                  setProductPrices({});
                  setProductQuantities({});
                  setSearchTerm("");
                  setSelectedProduct(null);
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
              <div className="mt-4 p-4 border border-gray-700 rounded-lg bg-gray-700">
                <h4 className="font-medium text-white mb-3">
                  Tìm kiếm sản phẩm để thêm:
                </h4>

                {/* Search Input */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Nhập tên sản phẩm để tìm kiếm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {loadingProducts ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-300 mt-2">
                      Đang tìm kiếm sản phẩm...
                    </p>
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
                          onClick={() => setSelectedProduct(product)}
                        >
                          <div className="flex items-center gap-3">
                            {/* Product Image */}
                            {getFirstProductImageUrl(product.productImages) && (
                              <OptimizedImage
                                src={getFirstProductImageUrl(
                                  product.productImages
                                )}
                                alt={product.name}
                                width={50}
                                height={50}
                                className="object-cover rounded-lg flex-shrink-0"
                              />
                            )}

                            {/* Product Info */}
                            <div className="flex-1">
                              <h5 className="font-medium text-white mb-1">
                                {product.name}
                              </h5>
                              <p className="text-sm text-gray-300 mb-1">
                                {/* @ts-expect-error - product now has productColors array */}
                                {product.productColors
                                  ?.map((pc: ProductColor) => pc.color?.name)
                                  .join(", ") || "N/A"}{" "}
                                • {product.capacity?.name || "N/A"}
                              </p>
                              <p className="text-sm text-gray-400">
                                Còn: {product.stockQuantity} • Giá:{" "}
                                {formatCurrency(product.unitPrice)}
                              </p>
                            </div>

                            {/* Select Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProduct(product);
                              }}
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
                    Không tìm thấy sản phẩm nào với từ khóa &quot;{searchTerm}
                    &quot;
                  </p>
                ) : (
                  <p className="text-gray-400 text-center py-4">
                    Nhập tên sản phẩm để bắt đầu tìm kiếm
                  </p>
                )}

                {/* Selected Product Details */}
                {selectedProduct && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="font-medium text-white mb-3">
                      Sản phẩm đã chọn: {selectedProduct.name}
                    </h5>

                    <div className="flex items-start gap-4">
                      {/* Product Image */}
                      {getFirstProductImageUrl(
                        selectedProduct.productImages
                      ) && (
                        <OptimizedImage
                          src={getFirstProductImageUrl(
                            selectedProduct.productImages
                          )}
                          alt={selectedProduct.name}
                          width={80}
                          height={80}
                          className="object-cover rounded-lg flex-shrink-0"
                        />
                      )}

                      {/* Product Details & Inputs */}
                      <div className="flex-1">
                        <p className="text-sm text-gray-300 mb-1">
                          {selectedProduct.color.name} •{" "}
                          {selectedProduct.capacity.name}
                        </p>
                        <p className="text-sm text-gray-400 mb-3">
                          Còn: {selectedProduct.stockQuantity} • Giá gốc:{" "}
                          {formatCurrency(selectedProduct.unitPrice)}
                        </p>

                        {/* Price and Quantity Inputs */}
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Giá (VND) - Mặc định:{" "}
                              {formatCurrency(selectedProduct.unitPrice)}
                            </label>
                            <input
                              type="number"
                              placeholder={`Mặc định: ${selectedProduct.unitPrice}`}
                              value={productPrices[selectedProduct.id] || ""}
                              onChange={(e) =>
                                setProductPrices((prev) => ({
                                  ...prev,
                                  [selectedProduct.id]: e.target.value,
                                }))
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
                                setProductQuantities((prev) => ({
                                  ...prev,
                                  [selectedProduct.id]:
                                    parseInt(e.target.value) || 1,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const customPrice = productPrices[
                                selectedProduct.id
                              ]
                                ? parseFloat(productPrices[selectedProduct.id])
                                : undefined;
                              const quantity =
                                productQuantities[selectedProduct.id] || 1;
                              addProduct(
                                selectedProduct,
                                quantity,
                                customPrice
                              );
                              setSelectedProduct(null);
                              setSearchTerm("");
                            }}
                            className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                          >
                            Thêm vào đơn hàng
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProduct(null);
                              setProductPrices((prev) => {
                                const newPrices = { ...prev };
                                delete newPrices[selectedProduct.id];
                                return newPrices;
                              });
                              setProductQuantities((prev) => {
                                const newQuantities = { ...prev };
                                delete newQuantities[selectedProduct.id];
                                return newQuantities;
                              });
                            }}
                            className="px-4 py-2 bg-gray-7000 text-white text-sm rounded hover:bg-gray-600"
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
        )}

        {/* Order Summary */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-300">Tạm tính:</span>
              {isEditing && order.orderType === "CUSTOM" ? (
                <input
                  type="number"
                  value={editData.totalAmount || 0}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      totalAmount: e.target.value,
                    })
                  }
                  className="text-right font-medium border border-gray-600 bg-gray-700 text-white rounded px-2 py-1 w-32"
                  placeholder="Nhập giá tùy chỉnh"
                />
              ) : (
                <span className="font-medium text-white">
                  {formatCurrency(order.totalAmount)}
                </span>
              )}
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Phí vận chuyển:</span>
              {isEditing ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Gốc:</span>
                    <input
                      type="number"
                      value={editData.originalShippingCost}
                      onChange={(e) =>
                        updateEditData("originalShippingCost", e.target.value)
                      }
                      className="w-24 px-2 py-1 border border-gray-600 bg-gray-700 text-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Giảm:</span>
                    <input
                      type="number"
                      value={editData.shippingDiscount}
                      onChange={(e) =>
                        updateEditData("shippingDiscount", e.target.value)
                      }
                      className="w-24 px-2 py-1 border border-gray-600 bg-gray-700 text-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Thực:</span>
                    <input
                      type="number"
                      value={editData.shippingCost}
                      onChange={(e) =>
                        updateEditData("shippingCost", e.target.value)
                      }
                      className="w-24 px-2 py-1 border border-gray-600 bg-gray-700 text-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ) : (
                <span className="font-medium text-white">
                  {isFreeShipping(order) ? (
                    <span>
                      <span className="text-green-600">Miễn phí</span>
                      <span className="text-gray-400 text-sm ml-2">
                        (Giảm: {formatCurrency(order.originalShippingCost)})
                      </span>
                    </span>
                  ) : (
                    formatCurrency(order.shippingCost)
                  )}
                </span>
              )}
            </div>
            <div className="flex justify-betw een text-lg font-semibold border-t border-gray-700 pt-2 text-white">
              <span>Tổng cộng:</span>
              <span>
                {isEditing
                  ? formatCurrency(
                      calculateUpdatedTotal() +
                        Number(
                          editData.shippingCost || order?.shippingCost || 0
                        )
                    )
                  : formatCurrency(
                      Number(order?.totalAmount || 0) +
                        (isFreeShipping(order)
                          ? 0
                          : Number(order?.shippingCost || 0))
                    )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
