"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Check, User, Package, DollarSign, Truck } from "lucide-react";

interface Customer {
  id: string;
  fullName?: string;
  phone?: string;
  email?: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  displayColor: string;
  capacity: string;
  category: string;
  stockQuantity: number;
  images: string[];
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
  shippingCost: number;
  originalShippingCost: number; // Lưu giá ship gốc khi có free shipping
  isFreeShipping: boolean;
  notes: string;
  deliveryAddressId?: string;
}

const steps = [
  { id: 1, title: "Chọn khách hàng", icon: User },
  { id: 2, title: "Loại đơn hàng", icon: Package },
  { id: 3, title: "Chi tiết đơn hàng", icon: Package },
  { id: 4, title: "Giá & vận chuyển", icon: DollarSign },
  { id: 5, title: "Xác nhận", icon: Check }
];

export function OrderWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OrderFormData>({
    customerId: "",
    orderType: "product",
    customDescription: "",
    items: [],
    shippingCost: 30000,
    originalShippingCost: 30000,
    isFreeShipping: false,
    notes: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Customer search state
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [searchingCustomers, setSearchingCustomers] = useState(false);
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // Mock data
  const [customers] = useState<Customer[]>([
    { id: "1", fullName: "Nguyễn Văn An", phone: "0901234567", email: "an@gmail.com" },
    { id: "2", fullName: "Trần Thị Bình", phone: "0987654321", email: "binh@yahoo.com" },
    { id: "3", fullName: "Lê Hoàng Cường", phone: "0912345678", email: "cuong@gmail.com" },
    { id: "4", fullName: "Phạm Thị Dung", phone: "0909876543", email: "dung@gmail.com" },
    { id: "5", fullName: "Võ Minh Tuấn", phone: "0903456789", email: "tuan@yahoo.com" }
  ]);

  const [products] = useState<Product[]>([
    {
      id: "1",
      name: "Ly Starbucks Classic",
      slug: "ly-starbucks-classic-trang-450ml",
      displayColor: "Trắng",
      capacity: "450ml",
      category: "Tumblers",
      stockQuantity: 25,
      images: ["/images/cup1.jpg"]
    },
    {
      id: "2", 
      name: "Ly Starbucks Premium",
      slug: "ly-starbucks-premium-den-500ml",
      displayColor: "Đen",
      capacity: "500ml",
      category: "Tumblers",
      stockQuantity: 15,
      images: ["/images/cup2.jpg"]
    }
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
            newErrors.customDescription = "Vui lòng mô tả chi tiết đơn hàng tùy chỉnh";
          }
        } else {
          if (formData.items.length === 0) {
            newErrors.items = "Vui lòng chọn ít nhất một sản phẩm";
          }
          formData.items.forEach((item, index) => {
            if (item.quantity <= 0) {
              newErrors[`item_${index}_quantity`] = "Số lượng phải lớn hơn 0";
            }
            if (item.unitPrice <= 0) {
              newErrors[`item_${index}_price`] = "Giá phải lớn hơn 0";
            }
          });
        }
        break;
      case 4:
        if (!formData.isFreeShipping && formData.shippingCost < 0) {
          newErrors.shippingCost = "Phí vận chuyển không hợp lệ";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const orderData = {
        ...formData,
        // Include original shipping cost for tracking
        originalShippingCost: formData.originalShippingCost
      };
      
      console.log("Creating order:", orderData);
      // await createOrder(orderData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      router.push("/admin/orders");
    } catch (error) {
      console.error("Error creating order:", error);
      setErrors({ submit: "Có lỗi xảy ra khi tạo đơn hàng" });
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productId: "",
          quantity: 1,
          unitPrice: 0,
          requestedColor: ""
        }
      ]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          const updated = { ...item, [field]: value };
          
          // Auto-populate product details when product is selected
          if (field === "productId" && value) {
            const product = products.find(p => p.id === value);
            if (product) {
              updated.product = product;
              updated.unitPrice = updated.unitPrice || 150000; // Default price
            }
          }
          
          return updated;
        }
        return item;
      })
    }));
  };

  // Customer search logic
  const searchCustomers = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchingCustomers(true);
    
    // Mock search - replace with actual API call
    setTimeout(() => {
      const filtered = customers.filter(customer =>
        customer.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(filtered);
      setSearchingCustomers(false);
      setShowCustomerDropdown(true);
    }, 300);
  };

  const handleCustomerSearch = (searchTerm: string) => {
    setCustomerSearchTerm(searchTerm);
    searchCustomers(searchTerm);
  };

  const selectCustomer = (customer: Customer) => {
    setFormData(prev => ({ ...prev, customerId: customer.id, customer }));
    setCustomerSearchTerm(customer.fullName || customer.phone || "");
    setShowCustomerDropdown(false);
    setErrors(prev => ({ ...prev, customer: "" }));
  };

  const getTotalAmount = () => {
    if (formData.orderType === "custom") {
      return 0; // Will be set manually in step 4
    }
    return formData.items.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
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
                Tìm kiếm khách hàng theo tên, số điện thoại hoặc email để tạo đơn hàng.
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
                            {customer.phone} • {customer.email}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No results message */}
              {showCustomerDropdown && customerSearchTerm && searchResults.length === 0 && !searchingCustomers && (
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
                      ✅ Đã chọn: {formData.customer.fullName || "Chưa có tên"}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formData.customer.phone} • {formData.customer.email}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setFormData(prev => ({ ...prev, customerId: "", customer: undefined }));
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
              <h4 className="text-sm font-medium text-gray-700 mb-3">Khách hàng gần đây</h4>
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
                onClick={() => setFormData(prev => ({ ...prev, orderType: "product" }))}
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
                    Đơn hàng với các sản phẩm có sẵn trong catalog. 
                    Cho phép chọn sản phẩm, số lượng và màu sắc.
                  </p>
                </div>
              </div>

              <div
                onClick={() => setFormData(prev => ({ ...prev, orderType: "custom" }))}
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
                    Đơn hàng với yêu cầu đặc biệt, thiết kế riêng 
                    hoặc sản phẩm không có trong catalog.
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
                  onChange={(e) => setFormData(prev => ({ ...prev, customDescription: e.target.value }))}
                  rows={6}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                    errors.customDescription ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Mô tả chi tiết yêu cầu của khách hàng (màu sắc, kích thước, thiết kế, logo, v.v.)"
                />
                {errors.customDescription && (
                  <p className="mt-1 text-sm text-red-600">{errors.customDescription}</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Sản phẩm {index + 1}</h4>
                      {formData.items.length > 1 && (
                        <button
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Xóa
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Sản phẩm <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={item.productId}
                          onChange={(e) => updateItem(index, "productId", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">Chọn sản phẩm</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name} - {product.displayColor} ({product.capacity})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Số lượng <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 0)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                            errors[`item_${index}_quantity`] ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                        {errors[`item_${index}_quantity`] && (
                          <p className="mt-1 text-xs text-red-600">{errors[`item_${index}_quantity`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Giá đơn vị (VND) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, "unitPrice", parseInt(e.target.value) || 0)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                            errors[`item_${index}_price`] ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                        {errors[`item_${index}_price`] && (
                          <p className="mt-1 text-xs text-red-600">{errors[`item_${index}_price`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Màu yêu cầu
                        </label>
                        <input
                          type="text"
                          value={item.requestedColor || ""}
                          onChange={(e) => updateItem(index, "requestedColor", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          placeholder="Để trống nếu dùng màu mặc định"
                        />
                      </div>
                    </div>

                    {item.product && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Tồn kho:</span> {item.product.stockQuantity} • 
                          <span className="font-medium"> Màu hiển thị:</span> {item.product.displayColor} • 
                          <span className="font-medium"> Danh mục:</span> {item.product.category}
                        </div>
                      </div>
                    )}
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
                Thiết lập giá trị đơn hàng và phí vận chuyển.
              </p>
            </div>

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
                      checked={formData.isFreeShipping}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setFormData(prev => ({ 
                          ...prev, 
                          isFreeShipping: isChecked,
                          // Nếu tick free shipping, lưu giá gốc và set về 0
                          // Nếu bỏ tick, khôi phục giá gốc
                          originalShippingCost: isChecked ? prev.shippingCost : prev.originalShippingCost,
                          shippingCost: isChecked ? 0 : prev.originalShippingCost
                        }))
                      }}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <label htmlFor="freeShipping" className="text-sm font-medium text-gray-700">
                      Miễn phí vận chuyển
                    </label>
                    {formData.isFreeShipping && formData.originalShippingCost > 0 && (
                      <span className="text-xs text-gray-500 ml-2">
                        (Giá gốc: {formData.originalShippingCost.toLocaleString("vi-VN")} VND)
                      </span>
                    )}
                  </div>
                  
                  {!formData.isFreeShipping && (
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
                          setFormData(prev => ({ 
                            ...prev, 
                            shippingCost: newShippingCost,
                            originalShippingCost: newShippingCost // Update original cost when manually changed
                          }))
                        }}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                          errors.shippingCost ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.shippingCost && (
                        <p className="mt-1 text-sm text-red-600">{errors.shippingCost}</p>
                      )}
                    </div>
                  )}
                  
                  {formData.isFreeShipping && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700">
                        Miễn phí vận chuyển được áp dụng
                        {formData.originalShippingCost > 0 && (
                          <span className="block text-green-600 mt-1">
                            Giảm: {formData.originalShippingCost.toLocaleString("vi-VN")} VND
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
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Ghi chú thêm cho đơn hàng..."
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Tóm tắt đơn hàng</h4>
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
                      {formData.isFreeShipping ? (
                        <div>
                          <span className="font-medium text-green-600">Miễn phí</span>
                          {formData.originalShippingCost > 0 && (
                            <div className="text-xs text-gray-500 line-through">
                              {formData.originalShippingCost.toLocaleString("vi-VN")} VND
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
                  {formData.isFreeShipping && formData.originalShippingCost > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span className="text-sm">Giảm:</span>
                      <span className="text-sm font-medium">
                        {formData.originalShippingCost.toLocaleString("vi-VN")} VND
                      </span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Tổng cộng:</span>
                      <span>
                        {formData.orderType === "custom"
                          ? "Sẽ tính sau"
                          : `${(getTotalAmount() + formData.shippingCost).toLocaleString("vi-VN")} VND`}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Thông tin khách hàng</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600">Tên:</span> {formData.customer?.fullName}</div>
                    <div><span className="text-gray-600">Điện thoại:</span> {formData.customer?.phone}</div>
                    <div><span className="text-gray-600">Email:</span> {formData.customer?.email}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Chi tiết đơn hàng</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600">Loại:</span> {formData.orderType === "custom" ? "Đơn tùy chỉnh" : "Đơn sản phẩm"}</div>
                    <div><span className="text-gray-600">Tổng tiền:</span> {
                      formData.orderType === "custom" 
                        ? "Sẽ tính sau"
                        : `${(getTotalAmount() + formData.shippingCost).toLocaleString("vi-VN")} VND`
                    }</div>
                    <div>
                      <span className="text-gray-600">Vận chuyển:</span> 
                      {formData.isFreeShipping ? (
                        <span className="text-green-600 font-medium"> Miễn phí</span>
                      ) : (
                        <span> {formData.shippingCost.toLocaleString("vi-VN")} VND</span>
                      )}
                      {formData.isFreeShipping && formData.originalShippingCost > 0 && (
                        <span className="text-gray-500 text-xs ml-2">
                          (Giảm: {formData.originalShippingCost.toLocaleString("vi-VN")} VND)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {formData.orderType === "custom" ? (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Mô tả tùy chỉnh</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {formData.customDescription}
                  </p>
                </div>
              ) : (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Danh sách sản phẩm</h4>
                  <div className="space-y-3">
                    {formData.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm bg-gray-50 p-3 rounded-lg">
                        <div>
                          <div className="font-medium">{item.product?.name}</div>
                          <div className="text-gray-600">
                            Số lượng: {item.quantity} • Giá: {item.unitPrice.toLocaleString("vi-VN")} VND
                            {item.requestedColor && ` • Màu: ${item.requestedColor}`}
                          </div>
                        </div>
                        <div className="font-medium">
                          {(item.quantity * item.unitPrice).toLocaleString("vi-VN")} VND
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
                        isActive ? "text-green-600" : isCompleted ? "text-green-500" : "text-gray-500"
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
      <div className="p-6">
        {renderStepContent()}
      </div>

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