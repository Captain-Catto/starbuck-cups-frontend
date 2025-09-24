import { useState, useEffect, useCallback } from "react";
import { useAppSelector } from "@/store";

export interface StatisticsData {
  period: string;
  overview: {
    totalProductsSold: number;
    totalRevenue: number;
    currentPeriodSales: number;
    currentPeriodRevenue: number;
    currentPeriodOrders: number;
    salesGrowth: number;
    revenueGrowth: number;
    ordersGrowth: number;
  };
  topSellingProducts: Array<{
    id: string;
    name: string;
    capacity: string;
    totalSold: number;
  }>;
  topCustomers: Array<{
    id: string;
    name: string;
    phone: string;
    messengerId?: string;
    zaloId?: string;
    totalSpent: number;
  }>;
  lowStockProducts: Array<{
    id: string;
    name: string;
    stockQuantity: number;
    capacity: {
      name: string;
    };
  }>;
  revenueTrend: Array<{
    period: string;
    revenue: number;
  }>;
}

export const useStatistics = (period: "week" | "month" | "year" = "month") => {
  const [data, setData] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get token from Redux store
  const { token } = useAppSelector((state) => state.auth);

  const fetchStatistics = useCallback(async (selectedPeriod: string) => {
    try {
      setLoading(true);
      setError(null);

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard/statistics?period=${selectedPeriod}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch statistics");
      }

      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchStatistics(period);
    }
  }, [period, token, fetchStatistics]);

  const refetch = () => fetchStatistics(period);

  return {
    data,
    loading,
    error,
    refetch,
    fetchStatistics,
  };
};
