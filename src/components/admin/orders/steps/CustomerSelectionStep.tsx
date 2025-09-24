import { User } from "lucide-react";
import { StepProps, Customer } from "@/types/orders";
import { useCustomerSearch } from "@/hooks/admin/useCustomerSearch";

interface CustomerSelectionStepProps extends StepProps {
  selectedCustomer: Customer | undefined;
  onCustomerSelect: (
    customer: Customer | undefined,
    defaultAddressId: string
  ) => void;
}

export function CustomerSelectionStep({
  formData,
  errors,
  selectedCustomer,
  onCustomerSelect,
}: CustomerSelectionStepProps) {
  const {
    customers,
    loadingCustomers,
    customerSearchTerm,
    searchingCustomers,
    searchResults,
    showCustomerDropdown,
    handleCustomerSearch,
    selectCustomer,
    clearCustomerSearch,
    setShowCustomerDropdown,
  } = useCustomerSearch();

  const handleSelectCustomer = (customer: Customer) => {
    const { customer: selectedCust, defaultAddressId } =
      selectCustomer(customer);
    onCustomerSelect(selectedCust, defaultAddressId);
  };

  const handleClearCustomer = () => {
    clearCustomerSearch();
    onCustomerSelect(undefined, "");
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          Chọn khách hàng
        </h3>
        <p className="text-gray-300 mb-6">
          Tìm kiếm khách hàng theo tên, số điện thoại hoặc email để tạo đơn
          hàng.
        </p>
      </div>

      {/* Customer Search Input */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Tìm kiếm khách hàng <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={customerSearchTerm}
            onChange={(e) => handleCustomerSearch(e.target.value)}
            onFocus={() => {
              if (searchResults.length > 0) setShowCustomerDropdown(true);
            }}
            className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-white placeholder-gray-400 ${
              errors.customer ? "border-red-500" : "border-gray-600"
            }`}
            placeholder="Nhập tên, số điện thoại hoặc email..."
          />
          {searchingCustomers && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showCustomerDropdown && searchResults.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map((customer) => (
              <div
                key={customer.id}
                onClick={() => handleSelectCustomer(customer)}
                className="p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-600 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <div className="font-medium text-white">
                      {customer.fullName || "Chưa có tên"}
                    </div>
                    <div className="text-sm text-gray-300">
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
            <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg p-4 text-center text-gray-400">
              Không tìm thấy khách hàng nào
            </div>
          )}
      </div>

      {/* Selected Customer Display */}
      {selectedCustomer && (
        <div className="p-4 bg-gray-900/20 border border-gray-700 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-gray-300" />
            </div>
            <div>
              <div className="font-medium text-white">
                Đã chọn: {selectedCustomer.fullName || "Chưa có tên"}
              </div>
              <div className="text-sm text-gray-300">
                {selectedCustomer.phone} •{" "}
                {selectedCustomer.notes || "Chưa có ghi chú"}
              </div>
            </div>
            <button
              onClick={handleClearCustomer}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              Bỏ chọn
            </button>
          </div>
        </div>
      )}

      {/* Quick Selection from Recent Customers */}
      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-3">
          Khách hàng gần đây
        </h4>
        {loadingCustomers ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-3 border rounded-lg border-gray-600 animate-pulse"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                  <div className="space-y-1">
                    <div className="h-4 bg-gray-600 rounded w-24"></div>
                    <div className="h-3 bg-gray-600 rounded w-20"></div>
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
                onClick={() => handleSelectCustomer(customer)}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  formData.customerId === customer.id
                    ? "border-gray-500 bg-gray-900/20"
                    : "border-gray-600 hover:border-gray-500 hover:bg-gray-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-300" />
                  </div>
                  <div>
                    <div className="font-medium text-white text-sm">
                      {customer.fullName || "Chưa có tên"}
                    </div>
                    <div className="text-xs text-gray-300">
                      {customer.phone}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-400 text-sm">
            Chưa có khách hàng nào. Hãy tìm kiếm khách hàng ở trên.
          </div>
        )}
      </div>

      {errors.customer && (
        <p className="text-sm text-red-400">{errors.customer}</p>
      )}
    </div>
  );
}
