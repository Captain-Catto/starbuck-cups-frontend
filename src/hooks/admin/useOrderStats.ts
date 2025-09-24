import { useState, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

export interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  previousPeriod?: {
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
}

export interface UseOrderStatsReturn {
  stats: OrderStats | null;
  loading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
  clearError: () => void;
  displayStats: Array<{
    label: string;
    value: string;
    change: string;
    trend: "up" | "down";
  }>;
}

export function useOrderStats(): UseOrderStatsReturn {
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get auth token from Redux store
  const token = useSelector((state: RootState) => state.auth.token);

  // Fetch order statistics
  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const authHeaders: Record<string, string> = token
        ? { Authorization: `Bearer ${token}` }
        : {};
      const response = await fetch("/api/admin/orders/stats", {
        headers: authHeaders,
      });

      const data = await response.json();
      console.log("Order stats response:", data);

      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.message || "Không thể tải thống kê đơn hàng");
      }
    } catch (error) {
      console.error("Error fetching order stats:", error);
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto fetch stats on mount and when token changes
  useEffect(() => {
    if (token) {
      fetchStats();
    }
  }, [token, fetchStats]);

  // Calculate percentage change
  const calculateChange = useCallback(
    (
      current: number,
      previous: number
    ): { change: string; trend: "up" | "down" } => {
      if (previous === 0) {
        return {
          change: current > 0 ? "+100%" : "0%",
          trend: current > 0 ? "up" : "up",
        };
      }

      const percentage = ((current - previous) / previous) * 100;
      const trend = percentage >= 0 ? "up" : "down";
      const change =
        percentage >= 0
          ? `+${percentage.toFixed(1)}%`
          : `${percentage.toFixed(1)}%`;

      return { change, trend };
    },
    []
  );

  // Prepare stats for display
  const displayStats = stats
    ? [
        {
          label: "Tổng đơn hàng",
          value: (stats.total || 0).toString(),
          ...calculateChange(
            stats.total || 0,
            stats.previousPeriod?.total || 0
          ),
        },
        {
          label: "Chờ xử lý",
          value: (stats.pending || 0).toString(),
          ...calculateChange(
            stats.pending || 0,
            stats.previousPeriod?.pending || 0
          ),
        },
        {
          label: "Đang giao",
          value: ((stats.shipped || 0) + (stats.processing || 0)).toString(),
          ...calculateChange(
            (stats.shipped || 0) + (stats.processing || 0),
            (stats.previousPeriod?.shipped || 0) +
              (stats.previousPeriod?.processing || 0)
          ),
        },
        {
          label: "Hoàn thành",
          value: (stats.delivered || 0).toString(),
          ...calculateChange(
            stats.delivered || 0,
            stats.previousPeriod?.delivered || 0
          ),
        },
      ]
    : [
        {
          label: "Tổng đơn hàng",
          value: "0",
          change: "0%",
          trend: "up" as const,
        },
        {
          label: "Chờ xử lý",
          value: "0",
          change: "0%",
          trend: "up" as const,
        },
        {
          label: "Đang giao",
          value: "0",
          change: "0%",
          trend: "up" as const,
        },
        {
          label: "Hoàn thành",
          value: "0",
          change: "0%",
          trend: "up" as const,
        },
      ];

  return {
    stats,
    loading,
    error,
    fetchStats,
    clearError,
    displayStats,
  };
}
