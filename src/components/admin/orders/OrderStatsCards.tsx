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
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 sm:gap-6">
        {["a", "b", "c", "d"].map((id) => (
          <div
            key={id}
            className="bg-gray-800 rounded-lg border border-gray-700 p-6 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-3"></div>
                <div className="h-8 bg-gray-700 rounded w-1/2"></div>
              </div>
              <div className="flex items-center gap-1">
                <div className="size-4 bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-700 rounded w-12"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 sm:gap-6">
      {displayStats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border border-gray-700 bg-gray-800 p-3 transition-colors hover:bg-gray-750 sm:p-6"
        >
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 sm:text-sm">{stat.label}</p>
              <p className="mt-1 text-xl font-bold text-white sm:mt-2 sm:text-2xl">{stat.value}</p>
            </div>
            <div
              className={`flex items-center gap-1 text-sm font-medium ${
                stat.trend === "up" ? "text-white" : "text-gray-300"
              }`}
            >
              <TrendingUp
                className={`size-4 ${
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
