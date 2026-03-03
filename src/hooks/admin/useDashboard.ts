import { useState, useEffect, useCallback } from "react";
import { useAppSelector } from "@/store";
import {
  dashboardAPI,
  DashboardStats,
  RecentOrder,
  RevenueData,
} from "@/lib/api/dashboard";

export interface UseDashboardReturn {
  // Data
  dashboardStats: DashboardStats | null;
  recentOrders: RecentOrder[];
  revenueData: RevenueData | null;
  pendingConsultations: number;

  // State
  loading: boolean;
  error: string | null;

  // Actions
  fetchDashboardData: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useDashboard(): UseDashboardReturn {
  const { token } = useAppSelector((state) => state.auth);

  // State for real data
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [pendingConsultations, setPendingConsultations] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (!token) {
      setError("Không có token xác thực");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [
        statsResponse,
        ordersResponse,
        revenueResponse,
        consultationsResponse,
      ] = await Promise.all([
        dashboardAPI.getDashboardStats(token).catch(() => null),
        dashboardAPI.getRecentOrders(5, token).catch(() => []),
        dashboardAPI.getRevenueData(token).catch(() => null),
        dashboardAPI
          .getPendingConsultationsCount(token)
          .catch(() => ({ count: 0 })),
      ]);

      if (statsResponse) setDashboardStats(statsResponse);
      setRecentOrders(ordersResponse);
      if (revenueResponse) setRevenueData(revenueResponse);
      setPendingConsultations(consultationsResponse.count);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải dữ liệu"
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Refetch function (alias for fetchDashboardData)
  const refetch = useCallback(() => {
    return fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token, fetchDashboardData]);

  return {
    dashboardStats,
    recentOrders,
    revenueData,
    pendingConsultations,
    loading,
    error,
    fetchDashboardData,
    refetch,
  };
}
