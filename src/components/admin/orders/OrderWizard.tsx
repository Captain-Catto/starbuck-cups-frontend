"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  User,
  Package,
  DollarSign,
  Truck,
} from "lucide-react";

interface Customer {
  id: string;
  messengerId?: string | null;
  zaloId?: string | null;
  fullName: string;
  phone: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  createdByAdminId: string;
  createdByAdmin: {
    username: string;
    email: string;
  };
  addresses: Array<{
    id: string;
    customerId: string;
    addressLine: string;
    district: string | null;
    city: string;
    postalCode: string | null;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
  _count: {
    orders: number;
  };
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stockQuantity: number;
  isActive: boolean;
  isDeleted: boolean;
  capacity: {
    id: string;
    name: string;
    volumeMl: number;
  };
  color: {
    id: string;
    name: string;
    hexCode: string;
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
  _count: {
    orderItems: number;
  };
}

interface OrderFormData {
  customerId: string;
  customer?: Customer;
  orderType: "custom" | "product";
  customDescription: string;
  items: Array<{
    productId: string;
    product?: Product;
    quantity: number;
    unitPrice: number;
    requestedColor?: string;
  }>;
  originalShippingCost: number;
  shippingDiscount: number;
  shippingCost: number; // Final shipping cost = originalShippingCost - shippingDiscount
  notes: string;
  deliveryAddressId?: string;
  // Temporary address for this order only (not saved to customer)
  temporaryAddress?: {
    addressLine: string;
    district: string;
    city: string;
    postalCode: string;
  };
  useTemporaryAddress?: boolean;
}

const steps = [
  { id: 1, title: "Chọn khách hàng", icon: User },
  { id: 2, title: "Loại đơn hàng", icon: Package },
  { id: 3, title: "Chi tiết đơn hàng", icon: Package },
  { id: 4, title: "Giá & vận chuyển", icon: DollarSign },
  { id: 5, title: "Xác nhận", icon: Check },
];

export function OrderWizard() {
  const router = useRouter();

  // Get auth token from Redux
  const { token, sessionChecked } = useAppSelector((state) => state.auth);

  // Helper function to check if shipping is free
  const isFreeShipping = () => {
    return formData.shippingDiscount === formData.originalShippingCost;
  };

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OrderFormData>({
    customerId: "",
    orderType: "product",
    customDescription: "",
    items: [],
    originalShippingCost: 30000,
    shippingDiscount: 0,
    shippingCost: 30000,
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Customer search state
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [searchingCustomers, setSearchingCustomers] = useState(false);
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // Customer data state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);

  // Product search state
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [searchingProducts, setSearchingProducts] = useState(false);
  const [productSearchResults, setProductSearchResults] = useState<Product[]>(
    []
  );
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);

  // Address management state
  const [showTemporaryAddressForm, setShowTemporaryAddressForm] =
    useState(false);

  // Fetch latest 4 customers on component mount
  useEffect(() => {
    // Only fetch when session has been checked and we have a token
    if (!sessionChecked) {
      console.log("OrderWizard - Session not yet checked, waiting...");
      return;
    }

    if (!token) {
      console.log("OrderWizard - No token available after session check");
      setCustomers([]);
      setLoadingCustomers(false);
      return;
    }

    const fetchCustomers = async () => {
      try {
        setLoadingCustomers(true);

        // Include authorization header
        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };

        if (token) {
          headers.Authorization = `Bearer ${token}`;
          console.log("OrderWizard - Sending request with auth token");
        }

        const response = await fetch(
          "/api/admin/customers?limit=4&sort=createdAt&order=desc",
          { headers }
        );
        const data = await response.json();

        console.log("OrderWizard - Response status:", response.status);
        console.log("OrderWizard - Response data:", data);

        if (data.success && data.data && data.data.items) {
          setCustomers(data.data.items);
        } else {
          console.error("Failed to fetch customers:", data.message);
          // Fallback to empty array
          setCustomers([]);
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
        setCustomers([]);
      } finally {
        setLoadingCustomers(false);
      }
    };

    fetchCustomers();
  }, [token, sessionChecked]);

  const [products] = useState<Product[]>([
    {
      id: "1",
      name: "Ly Starbucks Classic",
      slug: "ly-starbucks-classic-trang-450ml",
      description: "Ly Starbucks Classic màu trắng 450ml",
      price: 150000,
      stockQuantity: 25,
      isActive: true,
      isDeleted: false,
      capacity: {
        id: "cap1",
        name: "450ml",
        volumeMl: 450,
      },
      color: {
        id: "col1",
        name: "Trắng",
        hexCode: "#FFFFFF",
      },
      category: {
        id: "cat1",
        name: "Tumblers",
        slug: "tumblers",
      },
      productImages: [{ url: "/images/cup1.jpg", order: 1 }],
      _count: { orderItems: 0 },
    },
    {
      id: "2",
      name: "Ly Starbucks Premium",
      slug: "ly-starbucks-premium-den-500ml",
      description: "Ly Starbucks Premium màu đen 500ml",
      price: 180000,
      stockQuantity: 15,
      isActive: true,
      isDeleted: false,
      capacity: {
        id: "cap2",
        name: "500ml",
        volumeMl: 500,
      },
      color: {
        id: "col2",
        name: "Đen",
        hexCode: "#000000",
      },
      category: {
        id: "cat1",
        name: "Tumblers",
        slug: "tumblers",
      },
      productImages: [{ url: "/images/cup2.jpg", order: 1 }],
      _count: { orderItems: 0 },
    },
  ]);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.customerId) {
          newErrors.customer = "Vui lòng chọn khách hàng";
        }
        break;
      case 2:
        // No validation needed for order type selection
        break;
      case 3:
        if (formData.orderType === "custom") {
          if (!formData.customDescription.trim()) {
            newErrors.customDescription =
              "Vui lòng mô tả chi tiết đơn hàng tùy chỉnh";
          }
        } else {
          if (formData.items.length === 0) {
            newErrors.items = "Vui lòng chọn ít nhất một sản phẩm";
          }
          formData.items.forEach((item, index) => {
            // Basic validation
            if (item.quantity <= 0) {
              newErrors[`item_${index}_quantity`] = "Số lượng phải lớn hơn 0";
            }
            if (item.unitPrice <= 0) {
              newErrors[`item_${index}_price`] = "Giá phải lớn hơn 0";
            }

            // Product selection validation
            if (!item.productId || !item.product) {
              newErrors[`item_${index}_product`] = "Vui lòng chọn sản phẩm";
            }

            // Stock validation
            if (item.product && item.quantity > 0) {
              if (item.quantity > item.product.stockQuantity) {
                newErrors[
                  `item_${index}_stock`
                ] = `Không đủ hàng! Tồn kho: ${item.product.stockQuantity}, yêu cầu: ${item.quantity}`;
              }

              // Check if product is active
              if (!item.product.isActive) {
                newErrors[`item_${index}_active`] =
                  "Sản phẩm này hiện không hoạt động";
              }

              // Check if product is deleted
              if (item.product.isDeleted) {
                newErrors[`item_${index}_deleted`] = "Sản phẩm này đã bị xóa";
              }
            }
          });
        }
        break;
      case 4:
        if (formData.shippingCost < 0) {
          newErrors.shippingCost = "Phí vận chuyển không hợp lệ";
        }
        if (formData.originalShippingCost < 0) {
          newErrors.originalShippingCost = "Phí vận chuyển gốc không hợp lệ";
        }
        if (formData.shippingDiscount < 0) {
          newErrors.shippingDiscount = "Giảm giá vận chuyển không hợp lệ";
        }
        // Validate delivery address selection
        if (formData.customer) {
          if (formData.useTemporaryAddress) {
            // Validate temporary address
            if (!formData.temporaryAddress?.addressLine?.trim()) {
              newErrors.temporaryAddress = "Vui lòng nhập địa chỉ";
            }
            if (!formData.temporaryAddress?.city?.trim()) {
              newErrors.temporaryCity = "Vui lòng nhập thành phố";
            }
          } else if (formData.customer.addresses.length > 0) {
            // Validate address selection from existing addresses
            if (!formData.deliveryAddressId) {
              newErrors.deliveryAddress = "Vui lòng chọn địa chỉ giao hàng";
            }
          }
          // If customer has no addresses and not using temporary address, require temporary address
          if (
            formData.customer.addresses.length === 0 &&
            !formData.useTemporaryAddress
          ) {
            newErrors.noAddress =
              "Khách hàng chưa có địa chỉ. Vui lòng sử dụng địa chỉ tạm thời cho đơn hàng này.";
          }
        }
        break;
      case 5:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    setLoading(true);
    try {
      // Prepare delivery address data
      let deliveryAddress;

      if (formData.useTemporaryAddress && formData.temporaryAddress) {
        // Use temporary address directly
        deliveryAddress = {
          addressLine: formData.temporaryAddress.addressLine,
          district: formData.temporaryAddress.district || "",
          city: formData.temporaryAddress.city,
          postalCode: formData.temporaryAddress.postalCode || "",
        };
      } else if (formData.deliveryAddressId && formData.customer) {
        // Find selected address from customer addresses
        const selectedAddress = formData.customer.addresses.find(
          (addr) => addr.id === formData.deliveryAddressId
        );

        if (!selectedAddress) {
          throw new Error("Selected address not found");
        }

        deliveryAddress = {
          addressLine: selectedAddress.addressLine,
          district: selectedAddress.district || "",
          city: selectedAddress.city,
          postalCode: selectedAddress.postalCode || "",
        };
      } else {
        throw new Error("No delivery address provided");
      }

      // Prepare order data for API call
      const orderData = {
        customerId: formData.customerId,
        orderType: formData.orderType,
        customDescription:
          formData.orderType === "custom"
            ? formData.customDescription
            : undefined,
        items:
          formData.orderType === "product"
            ? formData.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                requestedColor: item.requestedColor || undefined,
              }))
            : undefined,
        originalShippingCost: formData.originalShippingCost,
        shippingDiscount: formData.shippingDiscount,
        shippingCost: formData.shippingCost,
        notes: formData.notes || undefined,
        deliveryAddress,
      };

      console.log("Creating order with data:", orderData);

      // Include authorization header
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // Call actual API
      const response = await fetch("/api/admin/orders", {
        method: "POST",
        headers,
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (data.success) {
        console.log("Order created successfully:", data.data);
        router.push("/admin/orders");
      } else {
        throw new Error(data.message || "Failed to create order");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      setErrors({
        submit:
          error instanceof Error
            ? `Có lỗi xảy ra: ${error.message}`
            : "Có lỗi xảy ra khi tạo đơn hàng",
      });
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    // Clear product search state when adding new item
    setProductSearchTerm("");
    setShowProductDropdown(false);
    setActiveItemIndex(null);

    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productId: "",
          quantity: 1,
          unitPrice: 0,
          requestedColor: "",
        },
      ],
    }));
  };

  const removeItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateItem = (
    index: number,
    field: string,
    value: string | number | Product | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          const updated = { ...item, [field]: value };

          // Auto-populate product details when product is selected from hardcoded list
          if (field === "productId" && value && !updated.product) {
            const product = products.find((p) => p.id === value);
            if (product) {
              updated.product = product;
              updated.unitPrice = updated.unitPrice || product.price; // Use product price
            }
          }

          return updated;
        }
        return item;
      }),
    }));
  };

  // Customer search logic
  const searchCustomers = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchingCustomers(true);

    try {
      // Include authorization header
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // Real API call to search customers
      const response = await fetch(
        `/api/admin/customers?search=${encodeURIComponent(
          searchTerm
        )}&limit=10`,
        { headers }
      );
      const data = await response.json();

      if (data.success && data.data && data.data.items) {
        setSearchResults(data.data.items);
      } else {
        console.error("Failed to search customers:", data.message);
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching customers:", error);
      setSearchResults([]);
    } finally {
      setSearchingCustomers(false);
      setShowCustomerDropdown(true);
    }
  };

  const handleCustomerSearch = (searchTerm: string) => {
    setCustomerSearchTerm(searchTerm);
    searchCustomers(searchTerm);
  };

  const selectCustomer = (customer: Customer) => {
    // Find default address or first address
    const defaultAddress =
      customer.addresses.find((addr) => addr.isDefault) ||
      customer.addresses[0];

    setFormData((prev) => ({
      ...prev,
      customerId: customer.id,
      customer,
      deliveryAddressId: defaultAddress?.id || "",
    }));
    setCustomerSearchTerm(customer.fullName || customer.phone || "");
    setShowCustomerDropdown(false);
    setErrors((prev) => ({ ...prev, customer: "", deliveryAddress: "" }));
  };

  // Product search logic
  const searchProducts = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setProductSearchResults([]);
      return;
    }

    setSearchingProducts(true);

    try {
      // Include authorization header
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // Real API call to search products
      const response = await fetch(
        `/api/admin/products?search=${encodeURIComponent(searchTerm)}&limit=10`,
        { headers }
      );
      const data = await response.json();

      if (data.success && data.data && data.data.items) {
        setProductSearchResults(data.data.items);
      } else {
        console.error("Failed to search products:", data.message);
        setProductSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching products:", error);
      setProductSearchResults([]);
    } finally {
      setSearchingProducts(false);
      setShowProductDropdown(true);
    }
  };

  const handleProductSearch = (searchTerm: string, itemIndex: number) => {
    setProductSearchTerm(searchTerm);
    setActiveItemIndex(itemIndex);
    searchProducts(searchTerm);
  };

  const selectProduct = (product: Product, itemIndex: number) => {
    updateItem(itemIndex, "productId", product.id);
    updateItem(itemIndex, "product", product);
    updateItem(itemIndex, "unitPrice", product.price || 150000); // Use product price or default
    setProductSearchTerm(product.name); // Set product name in search term
    setShowProductDropdown(false);
    setActiveItemIndex(null);
    setProductSearchResults([]); // Clear search results after selection

    // Clear product-related errors when product is selected
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`item_${itemIndex}_product`];
      return newErrors;
    });
  };

  // Handle temporary address input
  const handleTemporaryAddressChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      temporaryAddress: {
        addressLine: "",
        district: "",
        city: "",
        postalCode: "",
        ...prev.temporaryAddress,
        [field]: value,
      },
    }));

    // Clear related errors
    setErrors((prev) => ({
      ...prev,
      temporaryAddress: "",
      temporaryCity: "",
      noAddress: "",
    }));
  };

  const getTotalAmount = () => {
    if (formData.orderType === "custom") {
      return 0; // Will be set manually in step 4
    }
    return formData.items.reduce(
      (total, item) => total + item.quantity * item.unitPrice,
      0
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Chọn khách hàng
              </h3>
              <p className="text-gray-600 mb-6">
                Tìm kiếm khách hàng theo tên, số điện thoại hoặc email để tạo
                đơn hàng.
              </p>
            </div>

            {/* Customer Search Input */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm khách hàng <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={customerSearchTerm}
                  onChange={(e) => handleCustomerSearch(e.target.value)}
                  onFocus={() => {
                    if (searchResults.length > 0) setShowCustomerDropdown(true);
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.customer ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Nhập tên, số điện thoại hoặc email..."
                />
                {searchingCustomers && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showCustomerDropdown && searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((customer) => (
                    <div
                      key={customer.id}
                      onClick={() => selectCustomer(customer)}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {customer.fullName || "Chưa có tên"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {customer.phone}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No results message */}
              {showCustomerDropdown &&
                customerSearchTerm &&
                searchResults.length === 0 &&
                !searchingCustomers && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
                    Không tìm thấy khách hàng nào
                  </div>
                )}
            </div>

            {/* Selected Customer Display */}
            {formData.customer && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      Đã chọn: {formData.customer.fullName || "Chưa có tên"}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formData.customer.phone} •{" "}
                      {formData.customer.notes || "Chưa có ghi chú"}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        customerId: "",
                        customer: undefined,
                      }));
                      setCustomerSearchTerm("");
                      setShowCustomerDropdown(false);
                    }}
                    className="ml-auto text-red-500 hover:text-red-700"
                  >
                    Bỏ chọn
                  </button>
                </div>
              </div>
            )}

            {/* Quick Selection from Recent Customers */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Khách hàng gần đây
              </h4>
              {loadingCustomers ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="p-3 border rounded-lg border-gray-200 animate-pulse"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 min-w-0">
                          <div className="h-4 bg-gray-200 rounded mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-20"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : customers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {customers.slice(0, 4).map((customer) => (
                    <div
                      key={customer.id}
                      onClick={() => selectCustomer(customer)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        formData.customerId === customer.id
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate text-sm">
                            {customer.fullName || "Chưa có tên"}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {customer.phone}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  Chưa có khách hàng nào. Hãy tìm kiếm khách hàng ở trên.
                </div>
              )}
            </div>

            {errors.customer && (
              <p className="text-sm text-red-600">{errors.customer}</p>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Chọn loại đơn hàng
              </h3>
              <p className="text-gray-600 mb-6">
                Chọn loại đơn hàng phù hợp với yêu cầu của khách hàng.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                onClick={() =>
                  setFormData((prev) => ({ ...prev, orderType: "product" }))
                }
                className={`p-6 border-2 rounded-lg cursor-pointer transition-colors ${
                  formData.orderType === "product"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Đơn sản phẩm
                  </h4>
                  <p className="text-sm text-gray-600">
                    Đơn hàng với các sản phẩm có sẵn trong catalog. Cho phép
                    chọn sản phẩm, số lượng và màu sắc.
                  </p>
                </div>
              </div>

              <div
                onClick={() =>
                  setFormData((prev) => ({ ...prev, orderType: "custom" }))
                }
                className={`p-6 border-2 rounded-lg cursor-pointer transition-colors ${
                  formData.orderType === "custom"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Package className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Đơn tùy chỉnh
                  </h4>
                  <p className="text-sm text-gray-600">
                    Đơn hàng với yêu cầu đặc biệt, thiết kế riêng hoặc sản phẩm
                    không có trong catalog.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Chi tiết đơn hàng
              </h3>
              <p className="text-gray-600 mb-6">
                {formData.orderType === "custom"
                  ? "Mô tả chi tiết yêu cầu tùy chỉnh của khách hàng."
                  : "Chọn sản phẩm, số lượng và giá cho đơn hàng."}
              </p>
            </div>

            {formData.orderType === "custom" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả chi tiết <span className="text-red-500">*</span>
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                    errors.customDescription
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Mô tả chi tiết yêu cầu của khách hàng (màu sắc, kích thước, thiết kế, logo, v.v.)"
                />
                {errors.customDescription && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.customDescription}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">
                        Sản phẩm {index + 1}
                      </h4>
                      {formData.items.length > 1 && (
                        <button
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Xóa
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      {/* Search Input Section */}
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tìm kiếm sản phẩm{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={
                              item.product
                                ? item.product.name
                                : activeItemIndex === index
                                ? productSearchTerm
                                : ""
                            }
                            onChange={(e) => {
                              // If product is selected and user starts typing, clear the product
                              if (
                                item.product &&
                                e.target.value !== item.product.name
                              ) {
                                updateItem(index, "productId", "");
                                updateItem(index, "product", undefined);
                                updateItem(index, "unitPrice", 0);
                              }
                              handleProductSearch(e.target.value, index);
                            }}
                            onFocus={() => {
                              setActiveItemIndex(index);
                              if (productSearchResults.length > 0) {
                                setShowProductDropdown(true);
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            placeholder="Nhập tên sản phẩm để tìm kiếm..."
                          />
                          {searchingProducts && activeItemIndex === index && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          )}
                          {item.product && (
                            <button
                              onClick={() => {
                                updateItem(index, "productId", "");
                                updateItem(index, "product", undefined);
                                updateItem(index, "unitPrice", 0);
                                setProductSearchTerm("");
                                // Clear product-related errors when removing product
                                setErrors((prev) => {
                                  const newErrors = { ...prev };
                                  delete newErrors[`item_${index}_product`];
                                  delete newErrors[`item_${index}_stock`];
                                  delete newErrors[`item_${index}_active`];
                                  delete newErrors[`item_${index}_deleted`];
                                  return newErrors;
                                });
                              }}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-700 hover:bg-red-100 p-1 rounded"
                              title="Bỏ chọn sản phẩm"
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        {/* Product Search Results Dropdown */}
                        {showProductDropdown &&
                          activeItemIndex === index &&
                          productSearchResults.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              {productSearchResults.map((product) => (
                                <div
                                  key={product.id}
                                  onClick={() => selectProduct(product, index)}
                                  className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                      <Package className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-medium text-gray-900">
                                        {product.name}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {product.color.name} •{" "}
                                        {product.capacity.name} • Tồn:{" "}
                                        {product.stockQuantity}
                                      </div>
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
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
                              Không tìm thấy sản phẩm nào
                            </div>
                          )}
                      </div>

                      {/* Product selection error */}
                      {errors[`item_${index}_product`] && (
                        <p className="text-xs text-red-600">
                          {errors[`item_${index}_product`]}
                        </p>
                      )}

                      {/* Other form fields */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Số lượng <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(
                                index,
                                "quantity",
                                parseInt(e.target.value) || 0
                              )
                            }
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                              errors[`item_${index}_quantity`]
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          />
                          {errors[`item_${index}_quantity`] && (
                            <p className="mt-1 text-xs text-red-600">
                              {errors[`item_${index}_quantity`]}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Giá đơn vị (VND){" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) =>
                              updateItem(
                                index,
                                "unitPrice",
                                parseInt(e.target.value) || 0
                              )
                            }
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                              errors[`item_${index}_price`]
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          />
                          {errors[`item_${index}_price`] && (
                            <p className="mt-1 text-xs text-red-600">
                              {errors[`item_${index}_price`]}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Màu yêu cầu
                          </label>
                          <input
                            type="text"
                            value={item.requestedColor || ""}
                            onChange={(e) =>
                              updateItem(
                                index,
                                "requestedColor",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            placeholder="Để trống nếu dùng màu mặc định"
                          />
                        </div>
                      </div>
                    </div>

                    {item.product && (
                      <div
                        className={`mt-3 p-3 rounded-lg ${
                          item.quantity > item.product.stockQuantity
                            ? "bg-red-50 border border-red-200"
                            : "bg-gray-50"
                        }`}
                      >
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Tồn kho:</span>{" "}
                          <span
                            className={`${
                              item.quantity > item.product.stockQuantity
                                ? "text-red-600 font-bold"
                                : item.product.stockQuantity <= 1
                                ? "text-yellow-600 font-medium"
                                : "text-green-600"
                            }`}
                          >
                            {item.product.stockQuantity}
                          </span>
                          {item.quantity > item.product.stockQuantity && (
                            <span className="text-red-600 ml-1">
                              (Thiếu{" "}
                              {item.quantity - item.product.stockQuantity})
                            </span>
                          )}
                          {item.product.stockQuantity <= 5 &&
                            item.product.stockQuantity > 0 && (
                              <span className="text-yellow-600 ml-1 text-xs">
                                (Sắp hết hàng)
                              </span>
                            )}
                          {item.product.stockQuantity === 0 && (
                            <span className="text-red-600 ml-1 text-xs font-bold">
                              (Hết hàng)
                            </span>
                          )}{" "}
                          •<span className="font-medium"> Màu:</span>{" "}
                          {item.product.color.name} •
                          <span className="font-medium"> Dung tích:</span>{" "}
                          {item.product.capacity.name} •
                          <span className="font-medium"> Danh mục:</span>{" "}
                          {item.product.category.name}
                          {!item.product.isActive && (
                            <span className="text-red-600 ml-2 text-xs font-bold">
                              🚫 Không hoạt động
                            </span>
                          )}
                          {item.product.isDeleted && (
                            <span className="text-red-600 ml-2 text-xs font-bold">
                              🗑️ Đã xóa
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Error messages for product validation */}
                    <div className="mt-2 space-y-1">
                      {errors[`item_${index}_product`] && (
                        <p className="text-xs text-red-600">
                          {errors[`item_${index}_product`]}
                        </p>
                      )}
                      {errors[`item_${index}_stock`] && (
                        <p className="text-xs text-red-600">
                          <span className="font-medium">⚠️ Tồn kho:</span>{" "}
                          {errors[`item_${index}_stock`]}
                        </p>
                      )}
                      {errors[`item_${index}_active`] && (
                        <p className="text-xs text-red-600">
                          <span className="font-medium">🚫 Trạng thái:</span>{" "}
                          {errors[`item_${index}_active`]}
                        </p>
                      )}
                      {errors[`item_${index}_deleted`] && (
                        <p className="text-xs text-red-600">
                          <span className="font-medium">🗑️ Sản phẩm:</span>{" "}
                          {errors[`item_${index}_deleted`]}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  onClick={addItem}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700"
                >
                  + Thêm sản phẩm
                </button>

                {errors.items && (
                  <p className="text-sm text-red-600">{errors.items}</p>
                )}
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Giá và vận chuyển
              </h3>
              <p className="text-gray-600 mb-6">
                Thiết lập giá trị đơn hàng, phí vận chuyển và chọn địa chỉ giao
                hàng.
              </p>
            </div>

            {/* Delivery Address Selection */}
            {formData.customer && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Chọn địa chỉ giao hàng <span className="text-red-500">*</span>
                </h4>

                {/* Existing addresses */}
                {formData.customer.addresses.length > 0 && (
                  <div className="space-y-3 mb-4">
                    <h5 className="text-sm font-medium text-gray-700">
                      Địa chỉ có sẵn:
                    </h5>
                    {formData.customer.addresses.map((address) => (
                      <div
                        key={address.id}
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            deliveryAddressId: address.id,
                            useTemporaryAddress: false,
                            temporaryAddress: undefined,
                          }));
                          setErrors((prev) => ({
                            ...prev,
                            deliveryAddress: "",
                            noAddress: "",
                          }));
                        }}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          formData.deliveryAddressId === address.id &&
                          !formData.useTemporaryAddress
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            checked={
                              formData.deliveryAddressId === address.id &&
                              !formData.useTemporaryAddress
                            }
                            onChange={() => {}} // Handled by parent onClick
                            className="mt-1 text-green-600 focus:ring-green-500"
                            readOnly
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900">
                                {address.addressLine}
                              </span>
                              {address.isDefault && (
                                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                  Mặc định
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              {[address.district, address.city]
                                .filter(Boolean)
                                .join(", ")}
                              {address.postalCode && ` - ${address.postalCode}`}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Address options */}
                <div
                  className={
                    formData.customer.addresses.length > 0
                      ? "border-t pt-4"
                      : ""
                  }
                >
                  <div className="space-y-4">
                    {/* Temporary address option */}
                    <div
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          useTemporaryAddress: true,
                          deliveryAddressId: undefined,
                        }));
                        setShowTemporaryAddressForm(true);
                        setErrors((prev) => ({
                          ...prev,
                          deliveryAddress: "",
                          noAddress: "",
                        }));
                      }}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        formData.useTemporaryAddress
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          checked={formData.useTemporaryAddress || false}
                          onChange={() => {}} // Handled by parent onClick
                          className="text-blue-600 focus:ring-blue-500"
                          readOnly
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            📍 Sử dụng địa chỉ tạm thời
                          </div>
                          <div className="text-sm text-gray-600">
                            Nhập địa chỉ mới chỉ cho đơn hàng này (không lưu vào
                            hồ sơ khách hàng)
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Temporary address form */}
                    {formData.useTemporaryAddress && (
                      <div className="ml-7 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Địa chỉ <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.temporaryAddress?.addressLine || ""}
                            onChange={(e) =>
                              handleTemporaryAddressChange(
                                "addressLine",
                                e.target.value
                              )
                            }
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                              errors.temporaryAddress
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            placeholder="Ví dụ: 123 Đường ABC, Phường XYZ"
                          />
                          {errors.temporaryAddress && (
                            <p className="mt-1 text-xs text-red-600">
                              {errors.temporaryAddress}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Quận/Huyện
                            </label>
                            <input
                              type="text"
                              value={formData.temporaryAddress?.district || ""}
                              onChange={(e) =>
                                handleTemporaryAddressChange(
                                  "district",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="Quận/Huyện"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Thành phố <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={formData.temporaryAddress?.city || ""}
                              onChange={(e) =>
                                handleTemporaryAddressChange(
                                  "city",
                                  e.target.value
                                )
                              }
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                                errors.temporaryCity
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                              placeholder="Thành phố"
                            />
                            {errors.temporaryCity && (
                              <p className="mt-1 text-xs text-red-600">
                                {errors.temporaryCity}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Mã bưu điện
                            </label>
                            <input
                              type="text"
                              value={
                                formData.temporaryAddress?.postalCode || ""
                              }
                              onChange={(e) =>
                                handleTemporaryAddressChange(
                                  "postalCode",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="Mã bưu điện"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Error messages */}
                {errors.deliveryAddress && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.deliveryAddress}
                  </p>
                )}
                {errors.noAddress && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.noAddress}
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tổng giá trị sản phẩm
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                    {formData.orderType === "custom" ? (
                      <input
                        type="number"
                        min="0"
                        placeholder="Nhập tổng giá trị"
                        className="w-full bg-transparent border-none outline-none"
                      />
                    ) : (
                      <span className="text-gray-900">
                        {getTotalAmount().toLocaleString("vi-VN")} VND
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <input
                      type="checkbox"
                      id="freeShipping"
                      checked={isFreeShipping()}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setFormData((prev) => ({
                          ...prev,
                          shippingDiscount: isChecked
                            ? prev.originalShippingCost
                            : 0,
                          shippingCost: isChecked
                            ? 0
                            : prev.originalShippingCost,
                        }));
                      }}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <label
                      htmlFor="freeShipping"
                      className="text-sm font-medium text-gray-700"
                    >
                      Miễn phí vận chuyển
                    </label>
                    {isFreeShipping() && formData.originalShippingCost > 0 && (
                      <span className="text-xs text-gray-500 ml-2">
                        (Giá gốc:{" "}
                        {formData.originalShippingCost.toLocaleString("vi-VN")}{" "}
                        VND)
                      </span>
                    )}
                  </div>

                  {!isFreeShipping() && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phí vận chuyển (VND)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.shippingCost}
                        onChange={(e) => {
                          const newShippingCost = parseInt(e.target.value) || 0;
                          setFormData((prev) => ({
                            ...prev,
                            shippingCost: newShippingCost,
                            originalShippingCost: newShippingCost, // Update original cost when manually changed
                          }));
                        }}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                          errors.shippingCost
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {errors.shippingCost && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.shippingCost}
                        </p>
                      )}
                    </div>
                  )}

                  {isFreeShipping() && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700">
                        Miễn phí vận chuyển được áp dụng
                        {formData.originalShippingCost > 0 && (
                          <span className="block text-green-600 mt-1">
                            Giảm:{" "}
                            {formData.originalShippingCost.toLocaleString(
                              "vi-VN"
                            )}{" "}
                            VND
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú đơn hàng
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Ghi chú thêm cho đơn hàng..."
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Tóm tắt đơn hàng
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tổng sản phẩm:</span>
                    <span className="font-medium">
                      {formData.orderType === "custom"
                        ? "Sẽ nhập sau"
                        : `${getTotalAmount().toLocaleString("vi-VN")} VND`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí vận chuyển:</span>
                    <div className="text-right">
                      {isFreeShipping() ? (
                        <div>
                          <span className="font-medium text-green-600">
                            Miễn phí
                          </span>
                          {formData.originalShippingCost > 0 && (
                            <div className="text-xs text-gray-500 line-through">
                              {formData.originalShippingCost.toLocaleString(
                                "vi-VN"
                              )}{" "}
                              VND
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="font-medium">
                          {formData.shippingCost.toLocaleString("vi-VN")} VND
                        </span>
                      )}
                    </div>
                  </div>
                  {isFreeShipping() && formData.originalShippingCost > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span className="text-sm">Giảm:</span>
                      <span className="text-sm font-medium">
                        {formData.originalShippingCost.toLocaleString("vi-VN")}{" "}
                        VND
                      </span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Tổng cộng:</span>
                      <span>
                        {formData.orderType === "custom"
                          ? "Sẽ tính sau"
                          : `${(
                              getTotalAmount() + formData.shippingCost
                            ).toLocaleString("vi-VN")} VND`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Xác nhận đơn hàng
              </h3>
              <p className="text-gray-600 mb-6">
                Kiểm tra lại thông tin đơn hàng trước khi tạo.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Thông tin khách hàng
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Tên:</span>{" "}
                      {formData.customer?.fullName}
                    </div>
                    <div>
                      <span className="text-gray-600">Điện thoại:</span>{" "}
                      {formData.customer?.phone}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Địa chỉ giao hàng
                  </h4>
                  {formData.useTemporaryAddress ? (
                    <div className="space-y-2 text-sm">
                      {formData.temporaryAddress ? (
                        <div>
                          <div className="font-medium text-gray-900">
                            {formData.temporaryAddress.addressLine}
                          </div>
                          <div className="text-gray-600">
                            {[
                              formData.temporaryAddress.district,
                              formData.temporaryAddress.city,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                            {formData.temporaryAddress.postalCode &&
                              ` - ${formData.temporaryAddress.postalCode}`}
                          </div>
                          <div className="text-xs text-blue-600 mt-1">
                            📍 Địa chỉ tạm thời
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-500">
                          Chưa nhập địa chỉ tạm thời
                        </div>
                      )}
                    </div>
                  ) : formData.deliveryAddressId && formData.customer ? (
                    <div className="space-y-2 text-sm">
                      {(() => {
                        const address = formData.customer?.addresses.find(
                          (addr) => addr.id === formData.deliveryAddressId
                        );
                        if (!address)
                          return (
                            <div className="text-gray-500">
                              Chưa chọn địa chỉ
                            </div>
                          );

                        return (
                          <div>
                            <div className="font-medium text-gray-900">
                              {address.addressLine}
                            </div>
                            <div className="text-gray-600">
                              {[address.district, address.city]
                                .filter(Boolean)
                                .join(", ")}
                              {address.postalCode && ` - ${address.postalCode}`}
                            </div>
                            {address.isDefault && (
                              <div className="text-xs text-green-600 mt-1">
                                Địa chỉ mặc định
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">
                      Chưa chọn địa chỉ
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Chi tiết đơn hàng
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Loại:</span>{" "}
                      {formData.orderType === "custom"
                        ? "Đơn tùy chỉnh"
                        : "Đơn sản phẩm"}
                    </div>
                    <div>
                      <span className="text-gray-600">Tổng tiền:</span>{" "}
                      {formData.orderType === "custom"
                        ? "Sẽ tính sau"
                        : `${(
                            getTotalAmount() + formData.shippingCost
                          ).toLocaleString("vi-VN")} VND`}
                    </div>
                    <div>
                      <span className="text-gray-600">Vận chuyển:</span>
                      {isFreeShipping() ? (
                        <span className="text-green-600 font-medium">
                          {" "}
                          Miễn phí
                        </span>
                      ) : (
                        <span>
                          {" "}
                          {formData.shippingCost.toLocaleString("vi-VN")} VND
                        </span>
                      )}
                      {isFreeShipping() &&
                        formData.originalShippingCost > 0 && (
                          <span className="text-gray-500 text-xs ml-2">
                            (Giảm:{" "}
                            {formData.originalShippingCost.toLocaleString(
                              "vi-VN"
                            )}{" "}
                            VND)
                          </span>
                        )}
                    </div>
                  </div>
                </div>
              </div>

              {formData.orderType === "custom" ? (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Mô tả tùy chỉnh
                  </h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {formData.customDescription}
                  </p>
                </div>
              ) : (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Danh sách sản phẩm
                  </h4>
                  <div className="space-y-3">
                    {formData.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center text-sm bg-gray-50 p-3 rounded-lg"
                      >
                        <div>
                          <div className="font-medium">
                            {item.product?.name}
                          </div>
                          <div className="text-gray-600">
                            Số lượng: {item.quantity} • Giá:{" "}
                            {item.unitPrice.toLocaleString("vi-VN")} VND
                            {item.requestedColor &&
                              ` • Màu: ${item.requestedColor}`}
                          </div>
                        </div>
                        <div className="font-medium">
                          {(item.quantity * item.unitPrice).toLocaleString(
                            "vi-VN"
                          )}{" "}
                          VND
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {formData.notes && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Ghi chú</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {formData.notes}
                  </p>
                </div>
              )}
            </div>

            {errors.submit && (
              <div className="text-center">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Steps Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            const StepIcon = step.icon;

            return (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isActive
                        ? "bg-green-100 text-green-600 border-2 border-green-500"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="ml-3 hidden md:block">
                    <div
                      className={`text-sm font-medium ${
                        isActive
                          ? "text-green-600"
                          : isCompleted
                          ? "text-green-500"
                          : "text-gray-500"
                      }`}
                    >
                      {step.title}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-0.5 ml-4 ${
                      currentStep > step.id ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="p-6">{renderStepContent()}</div>

      {/* Navigation */}
      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={currentStep === 1}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          Trước
        </button>

        <div className="flex items-center gap-3">
          {currentStep < steps.length ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Tiếp theo
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang tạo...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Tạo đơn hàng
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
