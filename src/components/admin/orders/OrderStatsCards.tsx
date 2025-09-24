import { TrendingUp } from "lucide-react";
import { ErrorMessage } from "@/components/admin/ErrorMessage";

interface OrderStatsCardsProps {
  displayStats: Array<{
    label: string;
    value: string;
    change: string;
    trend: "up" | "down";
  }>;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function OrderStatsCards({
  displayStats,
  loading,
  error,
  onRetry,
}: OrderStatsCardsProps) {
  if (error) {
    return (
      <ErrorMessage
        error={`Không thể tải thống kê đơn hàng: ${error}`}
        onRetry={onRetry}
      />
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="bg-gray-800 rounded-lg border border-gray-700 p-6 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-3"></div>
                <div className="h-8 bg-gray-700 rounded w-1/2"></div>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-4 bg-gray-700 rounded w-4"></div>
                <div className="h-4 bg-gray-700 rounded w-12"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {displayStats.map((stat, index) => (
        <div
          key={index}
          className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:bg-gray-750 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">{stat.label}</p>
              <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
            </div>
            <div
              className={`flex items-center gap-1 text-sm font-medium ${
                stat.trend === "up" ? "text-white" : "text-gray-300"
              }`}
            >
              <TrendingUp
                className={`w-4 h-4 ${
                  stat.trend === "down" ? "rotate-180" : ""
                }`}
              />
              {stat.change}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
