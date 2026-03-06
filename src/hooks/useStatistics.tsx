import { useState, useEffect, useCallback } from "react";
import { useAppSelector } from "@/store";
import { getApiUrl } from "@/lib/api-config";

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
  productAnalytics?: {
    topClickedProducts: Array<{
      productId: string;
      productName: string;
      productSlug?: string;
      clickCount: number;
      addToCartCount: number;
      conversionRate: number;
    }>;
    topAddToCartProducts: Array<{
      productId: string;
      productName: string;
      productSlug?: string;
      clickCount: number;
      addToCartCount: number;
      conversionRate: number;
    }>;
    topConversionProducts: Array<{
      productId: string;
      productName: string;
      productSlug?: string;
      clickCount: number;
      addToCartCount: number;
      conversionRate: number;
    }>;
    summary: {
      totalClicks: number;
      totalAddToCarts: number;
      overallConversionRate: number;
      totalTrackedProducts: number;
    };
    recentActivity: Array<{
      productId: string;
      productName: string;
      productSlug?: string;
      lastClicked: string;
      clickCount: number;
      addToCartCount: number;
    }>;
  };
}

export const useStatistics = (period: "week" | "month" | "year" = "month") => {
  const statisticsUrl = getApiUrl("admin/dashboard/statistics");
  const [data, setData] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get token from Redux store
  const { token } = useAppSelector((state) => state.auth);

  const fetchStatistics = useCallback(
    async (selectedPeriod: string) => {
      try {
        setLoading(true);
        setError(null);

        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch(
          `${statisticsUrl}?period=${selectedPeriod}`,
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
    },
    [statisticsUrl, token]
  );

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
