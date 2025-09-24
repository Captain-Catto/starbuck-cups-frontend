"use client";

import {
  ChevronLeft,
  ChevronRight,
  Check,
  User,
  Package,
  DollarSign,
} from "lucide-react";
import { WizardStep, Customer } from "@/types/orders";
import { useOrderCreation } from "@/hooks/admin/useOrderCreation";
import { CustomerSelectionStep } from "./steps/CustomerSelectionStep";
import { OrderTypeSelectionStep } from "./steps/OrderTypeSelectionStep";
import { OrderDetailsStep } from "./steps/OrderDetailsStep";

const steps: WizardStep[] = [
  { id: 1, title: "Chọn khách hàng", icon: User },
  { id: 2, title: "Loại đơn hàng", icon: Package },
  { id: 3, title: "Chi tiết đơn hàng", icon: Package },
  { id: 4, title: "Giá & vận chuyển", icon: DollarSign },
  { id: 5, title: "Xác nhận", icon: Check },
];

export function OrderWizard() {
  const {
    currentStep,
    formData,
    loading,
    errors,
    setFormData,
    setErrors,
    handleNext,
    handlePrev,
    addItem,
    removeItem,
    updateItem,
    handleSubmit,
    getTotalAmount,
    isFreeShipping,
    toggleFreeShipping,
  } = useOrderCreation();

  const handleCustomerSelect = (
    customer: Customer | undefined,
    defaultAddressId: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      customerId: customer?.id || "",
      customer,
      deliveryAddressId: defaultAddressId,
    }));

    setErrors((prev) => ({ ...prev, customer: "", deliveryAddress: "" }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <CustomerSelectionStep
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
            selectedCustomer={formData.customer}
            onCustomerSelect={handleCustomerSelect}
          />
        );

      case 2:
        return (
          <OrderTypeSelectionStep
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
          />
        );

      case 3:
        return (
          <OrderDetailsStep
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
            onAddItem={addItem}
            onRemoveItem={removeItem}
            onUpdateItem={updateItem}
          />
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Giá và vận chuyển
              </h3>
              <p className="text-gray-300 mb-6">
                Thiết lập giá trị đơn hàng, phí vận chuyển và chọn địa chỉ giao
                hàng.
              </p>
            </div>

            {/* Basic pricing information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tổng giá trị sản phẩm
                  </label>
                  {formData.orderType === "custom" ? (
                    <>
                      <input
                        type="number"
                        min="0"
                        value={formData.totalAmount || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            totalAmount: parseInt(e.target.value) || 0,
                          }))
                        }
                        className={`w-full px-3 py-2 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-gray-500 text-white ${
                          errors.totalAmount
                            ? "border-red-500"
                            : "border-gray-600"
                        }`}
                        placeholder="Nhập giá tùy chỉnh (VND)"
                      />
                      {errors.totalAmount && (
                        <p className="text-red-400 text-sm mt-1">
                          {errors.totalAmount}
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white">
                      {`${getTotalAmount().toLocaleString()}đ`}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Phí vận chuyển (VND)
                    </label>
                    <button
                      type="button"
                      onClick={toggleFreeShipping}
                      className={`px-3 py-1 text-xs rounded-full transition-colors ${
                        isFreeShipping()
                          ? "bg-green-900/30 text-green-300 border border-green-700"
                          : "bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600"
                      }`}
                    >
                      {isFreeShipping() ? "✓ Miễn phí ship" : "Miễn phí ship"}
                    </button>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={formData.originalShippingCost}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        originalShippingCost: parseInt(e.target.value) || 0,
                        shippingCost: Math.max(
                          0,
                          (parseInt(e.target.value) || 0) -
                            prev.shippingDiscount
                        ),
                      }))
                    }
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 text-white"
                    disabled={isFreeShipping()}
                  />
                  {isFreeShipping() && (
                    <p className="text-xs text-green-400 mt-1">
                      Phí vận chuyển được miễn phí cho đơn hàng này
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
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
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 text-white placeholder-gray-400"
                    placeholder="Ghi chú thêm cho đơn hàng..."
                  />
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="font-semibold text-white mb-4">
                  Tóm tắt đơn hàng
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Giá trị sản phẩm:</span>
                    <span className="text-white">
                      {formData.orderType === "custom"
                        ? formData.totalAmount
                          ? `${formData.totalAmount.toLocaleString()}đ`
                          : "Chưa xác định"
                        : `${getTotalAmount().toLocaleString()}đ`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Phí vận chuyển:</span>
                    <span className="text-white">
                      {isFreeShipping()
                        ? "Miễn phí"
                        : `${formData.shippingCost.toLocaleString()}đ`}
                    </span>
                  </div>
                  <div className="border-t border-gray-600 pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-white">Tổng cộng:</span>
                      <span className="text-gray-400">
                        {formData.orderType === "custom"
                          ? formData.totalAmount
                            ? `${(
                                formData.totalAmount + formData.shippingCost
                              ).toLocaleString()}đ`
                            : "Chưa xác định"
                          : `${(
                              getTotalAmount() + formData.shippingCost
                            ).toLocaleString()}đ`}
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
              <h3 className="text-lg font-semibold text-white mb-4">
                Xác nhận đơn hàng
              </h3>
              <p className="text-gray-300 mb-6">
                Kiểm tra lại thông tin đơn hàng trước khi tạo.
              </p>
            </div>

            <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-white mb-3">
                    Thông tin khách hàng
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="text-gray-300">
                      <span className="font-medium text-white">Tên:</span>{" "}
                      {formData.customer?.fullName || "Chưa có tên"}
                    </div>
                    <div className="text-gray-300">
                      <span className="font-medium text-white">SĐT:</span>{" "}
                      {formData.customer?.phone}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-3">
                    Loại đơn hàng
                  </h4>
                  <div className="text-sm text-gray-300">
                    <span className="font-medium text-white">Loại:</span>{" "}
                    {formData.orderType === "custom"
                      ? "Đơn tùy chỉnh"
                      : "Đơn sản phẩm"}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-3">Tóm tắt giá</h4>
                  <div className="space-y-1 text-sm">
                    <div className="text-gray-300">
                      <span className="font-medium text-white">Sản phẩm:</span>{" "}
                      {formData.orderType === "custom"
                        ? formData.totalAmount
                          ? `${formData.totalAmount.toLocaleString()}đ`
                          : "Chưa xác định"
                        : `${getTotalAmount().toLocaleString()}đ`}
                    </div>
                    <div className="text-gray-300">
                      <span className="font-medium text-white">
                        Vận chuyển:
                      </span>{" "}
                      {isFreeShipping()
                        ? "Miễn phí"
                        : `${formData.shippingCost.toLocaleString()}đ`}
                    </div>
                    <div className="text-gray-400 font-semibold">
                      <span className="text-white">Tổng:</span>{" "}
                      {formData.orderType === "custom"
                        ? formData.totalAmount
                          ? `${(
                              formData.totalAmount + formData.shippingCost
                            ).toLocaleString()}đ`
                          : "Chưa xác định"
                        : `${(
                            getTotalAmount() + formData.shippingCost
                          ).toLocaleString()}đ`}
                    </div>
                  </div>
                </div>
              </div>

              {formData.orderType === "custom" ? (
                <div className="mt-6">
                  <h4 className="font-semibold text-white mb-3">
                    Mô tả tùy chỉnh
                  </h4>
                  <p className="text-sm text-gray-300 bg-gray-700 p-3 rounded-lg">
                    {formData.customDescription || "Chưa có mô tả"}
                  </p>
                </div>
              ) : (
                <div className="mt-6">
                  <h4 className="font-semibold text-white mb-3">
                    Danh sách sản phẩm
                  </h4>
                  <div className="space-y-3">
                    {formData.items.map((item, index) => (
                      <div key={index} className="bg-gray-700 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-white">
                              {item.product?.name || `Sản phẩm ${index + 1}`}
                            </div>
                            <div className="text-sm text-gray-300">
                              Số lượng: {item.quantity} • Giá:{" "}
                              {item.unitPrice.toLocaleString()}đ
                            </div>
                          </div>
                          <div className="text-gray-400 font-medium">
                            {(item.quantity * item.unitPrice).toLocaleString()}đ
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {formData.notes && (
                <div className="mt-6">
                  <h4 className="font-semibold text-white mb-3">Ghi chú</h4>
                  <p className="text-sm text-gray-300 bg-gray-700 p-3 rounded-lg">
                    {formData.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700">
      {/* Steps Header */}
      <div className="px-6 py-4 border-b border-gray-700">
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
                        ? "bg-gray-500 text-white"
                        : isActive
                        ? "bg-white text-black border-2 border-gray-500"
                        : "bg-gray-700 text-gray-400"
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
                        isActive || isCompleted ? "text-white" : "text-gray-400"
                      }`}
                    >
                      {step.title}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-0.5 ml-4 ${
                      currentStep > step.id ? "bg-gray-500" : "bg-gray-600"
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
      <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={currentStep === 1}
          className="flex items-center gap-2 px-4 py-2 text-gray-300 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          Trước
        </button>

        <div className="flex items-center gap-3">
          {currentStep < steps.length ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Tiếp theo
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
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

      {/* Error Display */}
      {errors.submit && (
        <div className="px-6 pb-4">
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
            <p className="text-sm text-red-400">{errors.submit}</p>
          </div>
        </div>
      )}
    </div>
  );
}
