import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store";
import { OrderFormData, Product } from "@/types/orders";
import { toast } from "sonner";

const initialFormData: OrderFormData = {
  customerId: "",
  orderType: "product",
  customDescription: "",
  items: [],
  totalAmount: undefined,
  originalShippingCost: 30000,
  shippingDiscount: 0,
  shippingCost: 30000,
  notes: "",
};

export function useOrderCreation() {
  const router = useRouter();
  const { token } = useAppSelector((state) => state.auth);

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OrderFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Helper function to check if shipping is free
  const isFreeShipping = () => {
    return formData.shippingDiscount === formData.originalShippingCost;
  };

  // Toggle free shipping
  const toggleFreeShipping = () => {
    setFormData((prev) => {
      const willBeFree = !isFreeShipping();
      return {
        ...prev,
        shippingDiscount: willBeFree ? prev.originalShippingCost : 0,
        shippingCost: willBeFree ? 0 : prev.originalShippingCost,
      };
    });
  };

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
            if (item.unitPrice < 0) {
              newErrors[`item_${index}_price`] =
                "Giá không được âm (có thể = 0 cho hàng tặng)";
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
        if (formData.orderType === "custom") {
          if (!formData.totalAmount || formData.totalAmount <= 0) {
            newErrors.totalAmount = "Vui lòng nhập giá trị đơn hàng tùy chỉnh";
          }
        }
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
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productId: "",
          quantity: 0,
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
    value: string | number | Product
  ) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          const updated = { ...item, [field]: value };

          // Auto-populate product details when product is selected
          if (
            field === "product" &&
            value &&
            typeof value === "object" &&
            "id" in value
          ) {
            const product = value as Product;
            updated.productId = product.id;
            updated.unitPrice = updated.unitPrice || product.unitPrice;
          }

          return updated;
        }
        return item;
      }),
    }));
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
        totalAmount:
          formData.orderType === "custom" ? formData.totalAmount : undefined,
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

        toast.success("Đơn hàng đã được tạo thành công!");
        router.push("/admin/orders");
      } else {
        throw new Error(data.message || "Failed to create order");
      }
    } catch (error) {

      const errorMessage =
        error instanceof Error
          ? `Có lỗi xảy ra: ${error.message}`
          : "Có lỗi xảy ra khi tạo đơn hàng";

      setErrors({
        submit: errorMessage,
      });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    // State
    currentStep,
    formData,
    loading,
    errors,

    // Computed values
    isFreeShipping,
    getTotalAmount,

    // Actions
    setCurrentStep,
    setFormData,
    setErrors,
    handleNext,
    handlePrev,
    addItem,
    removeItem,
    updateItem,
    handleTemporaryAddressChange,
    handleSubmit,
    validateStep,
    toggleFreeShipping,
  };
}
