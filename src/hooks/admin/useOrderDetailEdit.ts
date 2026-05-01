"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { useAppSelector } from "@/store";
import { invalidateOrderDependentCaches } from "@/lib/adminCacheInvalidation";

// ─── Shared types ─────────────────────────────────────────────────────────────

export interface OrderDetailFullData {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    fullName?: string;
    email?: string;
    messengerId?: string;
    customerPhones?: Array<{ id: string; phoneNumber: string; isMain: boolean }>;
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
      color: { id: string; name: string; hexCode: string };
      images: Array<{ url: string; order: number }>;
      capacity: { id: string; name: string; volumeMl: number };
      category: { id: string; name: string; slug: string };
      unitPrice: number;
      capturedAt: string;
      description: string;
      colors?: Array<{ id: string; name: string; hexCode?: string }>;
      categories?: Array<{ id: string; name: string; slug?: string }>;
    };
    product: { id: string; name: string; slug: string; isActive: boolean };
  }>;
  _count?: { items: number };
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  completedAt?: string;
}

export interface EditableOrderData {
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
    updateBasePrice?: boolean;
  }>;
}

export interface SelectableProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  stockQuantity: number;
  unitPrice: number;
  color: { id: string; name: string; hexCode: string };
  capacity: { id: string; name: string; volumeMl: number };
  category: { id: string; name: string; slug: string };
  productImages: Array<{ url: string; order: number }>;
  isActive: boolean;
  productColors?: Array<{ color: { id: string; name: string; hexCode: string } }>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useOrderDetailEdit(orderId: string) {
  const { token } = useAppSelector((state) => state.auth);

  const [order, setOrder] = useState<OrderDetailFullData | null>(null);
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

  const [products, setProducts] = useState<SelectableProduct[]>([]);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productPrices, setProductPrices] = useState<Record<string, string>>({});
  const [productQuantities, setProductQuantities] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<SelectableProduct | null>(null);

  const showProductSelectorRef = useRef(showProductSelector);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => { showProductSelectorRef.current = showProductSelector; }, [showProductSelector]);

  // Server already filters by search; expose products directly.
  const filteredProducts = products;

  // ─── Fetch ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!token) return;

    const fetchOrder = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        const data = await response.json();

        if (data.success) {
          setOrder(data.data);
          setEditData({
            deliveryAddress: data.data.deliveryAddress || {},
            originalShippingCost: data.data.originalShippingCost || "0",
            shippingDiscount: data.data.shippingDiscount || "0",
            shippingCost: data.data.shippingCost || "0",
            totalAmount: data.data.totalAmount || "0",
            notes: data.data.notes || "",
            items:
              data.data.items?.map(
                (item: NonNullable<OrderDetailFullData["items"]>[number]) => ({
                  productId: item.productId,
                  quantity: item.quantity,
                  unitPrice: item.productSnapshot.unitPrice,
                })
              ) || [],
          });
        } else {
          setOrder(null);
        }
      } catch {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, token]);

  // ─── Save ─────────────────────────────────────────────────────────────────

  const saveChanges = async () => {
    if (!order || !token) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      const data = await response.json();

      if (data.success) {
        invalidateOrderDependentCaches();
        setOrder(data.data);
        toast.success("Đơn hàng đã được cập nhật thành công!");
      } else {
        if (data.error?.code === "ORDER_NOT_EDITABLE") {
          toast.error("Đơn hàng chỉ có thể chỉnh sửa khi ở trạng thái 'Chờ xử lý' hoặc 'Đã xác nhận'");
        } else if (data.error?.code === "VALIDATION_ERROR") {
          toast.error("Dữ liệu nhập vào không hợp lệ. Vui lòng kiểm tra lại!");
        } else {
          toast.error(data.message || "Có lỗi xảy ra khi cập nhật đơn hàng");
        }
      }
    } catch {
      toast.error("Có lỗi xảy ra khi cập nhật đơn hàng");
    } finally {
      setSaving(false);
    }
  };

  // ─── Edit helpers ─────────────────────────────────────────────────────────

  const updateEditData = (field: keyof EditableOrderData, value: string | number) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const updateAddress = (field: string, value: string) => {
    setEditData((prev) => ({
      ...prev,
      deliveryAddress: { ...prev.deliveryAddress, [field]: value },
    }));
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return;
    setEditData((prev) => ({
      ...prev,
      items: (prev.items || []).map((item, i) => (i === index ? { ...item, quantity } : item)),
    }));
  };

  const updateItemPrice = (index: number, unitPrice: number) => {
    if (unitPrice < 0) return;
    setEditData((prev) => ({
      ...prev,
      items: (prev.items || []).map((item, i) => (i === index ? { ...item, unitPrice } : item)),
    }));
  };

  const removeItem = (index: number) => {
    setEditData((prev) => ({
      ...prev,
      items: (prev.items || []).filter((_, i) => i !== index),
    }));
  };

  const calculateUpdatedTotal = () => {
    if (!order) return 0;
    if (!editData.items || editData.items.length === 0) return Number(order.totalAmount || 0);
    return editData.items.reduce((sum, item) => sum + item.quantity * (item.unitPrice || 0), 0);
  };

  // ─── Product selector ─────────────────────────────────────────────────────

  const fetchProducts = useCallback(async (search = "") => {
    if (!token) return;
    setLoadingProducts(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (search) params.set("search", search);
      const response = await fetch(`/api/admin/products?${params}`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (data.success && data.data?.items) {
        setProducts(
          data.data.items.filter((p: SelectableProduct) => p.stockQuantity > 0 && p.isActive)
        );
      }
    } catch {
      toast.error("Có lỗi khi tải danh sách sản phẩm");
    } finally {
      setLoadingProducts(false);
    }
  }, [token]);

  // Debounce searchTerm → refetch from server while selector is open
  useEffect(() => {
    if (!showProductSelectorRef.current) return;
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      fetchProducts(searchTerm);
    }, 300);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchTerm, fetchProducts]);

  const addProduct = (product: SelectableProduct, quantity = 1, customPrice?: number) => {
    const finalPrice = customPrice !== undefined ? customPrice : product.unitPrice;

    if (!finalPrice || finalPrice <= 0) {
      toast.error("Giá sản phẩm không hợp lệ");
      return;
    }

    const existingIndex = editData.items?.findIndex((item) => item.productId === product.id);
    if (existingIndex !== undefined && existingIndex >= 0) {
      updateItemQuantity(existingIndex, (editData.items?.[existingIndex]?.quantity || 0) + quantity);
    } else {
      setEditData((prev) => ({
        ...prev,
        items: [...(prev.items || []), { productId: product.id, quantity, unitPrice: finalPrice }],
      }));
    }

    setProductPrices((prev) => { const next = { ...prev }; delete next[product.id]; return next; });
    setProductQuantities((prev) => { const next = { ...prev }; delete next[product.id]; return next; });
    setShowProductSelector(false);

    toast.success(
      customPrice
        ? `Đã thêm ${product.name} với giá tùy chỉnh ${formatCurrency(finalPrice)}`
        : `Đã thêm ${product.name} với giá ${formatCurrency(finalPrice)}`
    );
  };

  // ─── Formatters ───────────────────────────────────────────────────────────

  const isFreeShipping = (orderData: OrderDetailFullData) =>
    Number(orderData.shippingDiscount) === Number(orderData.originalShippingCost);

  const formatCurrency = (amount: string | number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
      typeof amount === "string" ? Number(amount) : amount
    );

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  return {
    order, loading, saving,
    editData, setEditData,
    products, filteredProducts,
    showProductSelector, setShowProductSelector,
    loadingProducts,
    productPrices, setProductPrices,
    productQuantities, setProductQuantities,
    searchTerm, setSearchTerm,
    selectedProduct, setSelectedProduct,
    saveChanges,
    updateEditData, updateAddress,
    updateItemQuantity, updateItemPrice, removeItem,
    calculateUpdatedTotal,
    fetchProducts, addProduct,
    isFreeShipping, formatCurrency, formatDate,
  };
}
