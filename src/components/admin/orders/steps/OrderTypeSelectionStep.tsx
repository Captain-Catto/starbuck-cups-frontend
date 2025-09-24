import { Package } from "lucide-react";
import { StepProps } from "@/types/orders";

export function OrderTypeSelectionStep({ formData, setFormData }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          Chọn loại đơn hàng
        </h3>
        <p className="text-gray-300 mb-6">
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
              ? "border-gray-200 bg-gray-900/20"
              : "border-gray-600 hover:border-gray-500 hover:bg-gray-800"
          }`}
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-900/50 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Package className="w-6 h-6 text-blue-400" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">
              Đơn sản phẩm
            </h4>
            <p className="text-sm text-gray-300">
              Đơn hàng với các sản phẩm có sẵn trong catalog. Cho phép chọn sản
              phẩm, số lượng và màu sắc.
            </p>
          </div>
        </div>

        <div
          onClick={() =>
            setFormData((prev) => ({ ...prev, orderType: "custom" }))
          }
          className={`p-6 border-2 rounded-lg cursor-pointer transition-colors ${
            formData.orderType === "custom"
              ? "border-gray-200 bg-gray-900/20"
              : "border-gray-600 hover:border-gray-500 hover:bg-gray-800"
          }`}
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-900/50 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Package className="w-6 h-6 text-purple-400" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">
              Đơn tùy chỉnh
            </h4>
            <p className="text-sm text-gray-300">
              Đơn hàng với yêu cầu đặc biệt, thiết kế riêng hoặc sản phẩm không
              có trong catalog.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
