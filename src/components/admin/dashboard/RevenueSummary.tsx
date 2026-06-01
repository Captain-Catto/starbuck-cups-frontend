import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { RevenueData } from "@/lib/client-dashboard-api";

interface RevenueSummaryProps {
  revenueData: RevenueData | null;
  loading: boolean;
}

const formatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

const formatCurrency = (amount: number | undefined | null) => {
  return formatter.format(amount || 0);
};

export function RevenueSummary({ revenueData, loading }: RevenueSummaryProps) {

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700">
      <div className="p-6 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">
          Tổng quan doanh thu
        </h3>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="space-y-4">
            <div className="text-center">
              <div className="h-10 bg-gray-600 rounded w-48 mx-auto mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-600 rounded w-24 mx-auto animate-pulse"></div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
              <div className="text-center">
                <div className="h-6 bg-gray-600 rounded w-24 mx-auto mb-1 animate-pulse"></div>
                <div className="h-3 bg-gray-600 rounded w-16 mx-auto animate-pulse"></div>
              </div>
              <div className="text-center">
                <div className="h-6 bg-gray-600 rounded w-24 mx-auto mb-1 animate-pulse"></div>
                <div className="h-3 bg-gray-600 rounded w-20 mx-auto animate-pulse"></div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <div className="size-4 bg-gray-600 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-600 rounded w-32 animate-pulse"></div>
            </div>
          </div>
        ) : revenueData ? (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-white mb-2">
                {formatCurrency(revenueData.totalRevenue)}
              </p>
              <p className="text-sm text-gray-400">Tổng doanh thu</p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
              <div className="text-center">
                <p className="text-xl font-semibold text-white">
                  {formatCurrency(revenueData.thisMonthRevenue)}
                </p>
                <p className="text-xs text-gray-400">Tháng này</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-semibold text-white">
                  {formatCurrency(revenueData.lastMonthRevenue)}
                </p>
                <p className="text-xs text-gray-400">Tháng trước</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              {typeof revenueData.growth === "number" &&
              revenueData.growth >= 0 ? (
                <TrendingUp className="size-4 text-gray-300" />
              ) : (
                <TrendingDown className="size-4 text-gray-400" />
              )}
              <span
                className={`text-sm font-medium ${
                  typeof revenueData.growth === "number" &&
                  revenueData.growth >= 0
                    ? "text-gray-300"
                    : "text-gray-400"
                }`}
              >
                {typeof revenueData.growth === "number"
                  ? `${
                      revenueData.growth > 0 ? "+" : ""
                    }${revenueData.growth.toFixed(1)}% so với tháng trước`
                  : "Không có dữ liệu tăng trưởng"}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <DollarSign className="size-12 mx-auto mb-2 text-gray-600" />
            <p className="text-sm">Không thể tải dữ liệu doanh thu</p>
          </div>
        )}
      </div>
    </div>
  );
}
