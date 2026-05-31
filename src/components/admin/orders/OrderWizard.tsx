"use client";

import type { Dispatch, SetStateAction } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  User,
  Package,
  DollarSign,
} from "lucide-react";
import { WizardStep, Customer, OrderFormData } from "@/types/orders";
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

function PricingStep({
  formData,
  errors,
  setFormData,
  getTotalAmount,
  isFreeShipping,
  toggleFreeShipping,
}: {
  formData: OrderFormData;
  errors: Record<string, string>;
  setFormData: Dispatch<SetStateAction<OrderFormData>>;
  getTotalAmount: () => number;
  isFreeShipping: () => boolean;
  toggleFreeShipping: () => void;
}) {
  const productTotal =
    formData.orderType === "custom" ? formData.totalAmount : getTotalAmount();
  const formattedProductTotal = productTotal
    ? `${productTotal.toLocaleString()}đ`
    : "Chưa xác định";
  const formattedGrandTotal = productTotal
    ? `${(productTotal + formData.shippingCost).toLocaleString()}đ`
    : "Chưa xác định";

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          Giá và vận chuyển
        </h3>
        <p className="text-gray-300 mb-6">
          Thiết lập giá trị đơn hàng, phí vận chuyển và chọn địa chỉ giao hàng.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium text-gray-300 mb-2"
              htmlFor="orderwizard-nh-p-gi-t-y-ch-nh-vnd"
            >
              Tổng giá trị sản phẩm
            </label>
            {formData.orderType === "custom" ? (
              <>
                <input
                  aria-label="Nhập giá tùy chỉnh (VND)"
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
                    errors.totalAmount ? "border-red-500" : "border-gray-600"
                  }`}
                  placeholder="Nhập giá tùy chỉnh (VND)"
                  id="orderwizard-nh-p-gi-t-y-ch-nh-vnd"
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
              <label
                className="block text-sm font-medium text-gray-300"
                htmlFor="shipping-cost-input"
              >
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
              aria-label="number"
              type="number"
              id="shipping-cost-input"
              min="0"
              value={formData.originalShippingCost}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  originalShippingCost: parseInt(e.target.value) || 0,
                  shippingCost: Math.max(
                    0,
                    (parseInt(e.target.value) || 0) - prev.shippingDiscount
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
            <label
              className="block text-sm font-medium text-gray-300 mb-2"
              htmlFor="orderwizard-ghi-ch-th-m-cho-n-h-ng"
            >
              Ghi chú đơn hàng
            </label>
            <textarea
              aria-label="Ghi chú thêm cho đơn hàng..."
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={3}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 text-white placeholder-gray-400"
              placeholder="Ghi chú thêm cho đơn hàng..."
              id="orderwizard-ghi-ch-th-m-cho-n-h-ng"
            />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h4 className="font-semibold text-white mb-4">Tóm tắt đơn hàng</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">Giá trị sản phẩm:</span>
              <span className="text-white">{formattedProductTotal}</span>
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
                <span className="text-gray-400">{formattedGrandTotal}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfirmationStep({
  formData,
  getTotalAmount,
  isFreeShipping,
}: {
  formData: OrderFormData;
  getTotalAmount: () => number;
  isFreeShipping: () => boolean;
}) {
  const productTotal =
    formData.orderType === "custom" ? formData.totalAmount : getTotalAmount();
  const formattedProductTotal = productTotal
    ? `${productTotal.toLocaleString()}đ`
    : "Chưa xác định";
  const formattedGrandTotal = productTotal
    ? `${(productTotal + formData.shippingCost).toLocaleString()}đ`
    : "Chưa xác định";

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
                {formData.customer?.customerPhones?.[0]?.phoneNumber ||
                  "Chưa có SĐT"}
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Loại đơn hàng</h4>
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
                {formattedProductTotal}
              </div>
              <div className="text-gray-300">
                <span className="font-medium text-white">Vận chuyển:</span>{" "}
                {isFreeShipping()
                  ? "Miễn phí"
                  : `${formData.shippingCost.toLocaleString()}đ`}
              </div>
              <div className="text-gray-400 font-semibold">
                <span className="text-white">Tổng:</span> {formattedGrandTotal}
              </div>
            </div>
          </div>
        </div>

        {formData.orderType === "custom" ? (
          <div className="mt-6">
            <h4 className="font-semibold text-white mb-3">Mô tả tùy chỉnh</h4>
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
                <div
                  key={item.product?.id ?? index}
                  className="bg-gray-700 p-3 rounded-lg"
                >
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
}

function StepsHeader({ currentStep }: { currentStep: number }) {
  return (
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
                  className={`size-10 rounded-full flex items-center justify-center ${
                    isCompleted
                      ? "bg-gray-500 text-white"
                      : isActive
                      ? "bg-white text-black border-2 border-gray-500"
                      : "bg-gray-700 text-gray-400"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="size-5" />
                  ) : (
                    <StepIcon className="size-5" />
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
  );
}

function WizardNavigation({
  currentStep,
  loading,
  onPrev,
  onNext,
  onSubmit,
}: {
  currentStep: number;
  loading: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between">
      <button
        type="button"
        onClick={onPrev}
        disabled={currentStep === 1}
        className="flex items-center gap-2 px-4 py-2 text-gray-300 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <ChevronLeft className="size-4" />
        Trước
      </button>

      <div className="flex items-center gap-3">
        {currentStep < steps.length ? (
          <button
            type="button"
            onClick={onNext}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 cursor-pointer"
          >
            Tiếp theo
            <ChevronRight className="size-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Đang tạo…
              </>
            ) : (
              <>
                <Check className="size-4" />
                Tạo đơn hàng
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function SubmitError({ error }: { error?: string }) {
  if (!error) {
    return null;
  }

  return (
    <div className="px-6 pb-4">
      <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    </div>
  );
}

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

  const stepContent = (() => {
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
          <PricingStep
            formData={formData}
            errors={errors}
            setFormData={setFormData}
            getTotalAmount={getTotalAmount}
            isFreeShipping={isFreeShipping}
            toggleFreeShipping={toggleFreeShipping}
          />
        );

      case 5:
        return (
          <ConfirmationStep
            formData={formData}
            getTotalAmount={getTotalAmount}
            isFreeShipping={isFreeShipping}
          />
        );

      default:
        return null;
    }
  })();

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700">
      <StepsHeader currentStep={currentStep} />
      <div className="p-6">{stepContent}</div>
      <WizardNavigation
        currentStep={currentStep}
        loading={loading}
        onPrev={handlePrev}
        onNext={handleNext}
        onSubmit={handleSubmit}
      />
      <SubmitError error={errors.submit} />
    </div>
  );
}
