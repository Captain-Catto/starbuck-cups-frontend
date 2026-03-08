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

type StatisticsCacheEntry = {
  data: StatisticsData;
  fetchedAt: number;
};

const STATISTICS_CACHE_TTL_MS = 60_000;
const statisticsCache = new Map<string, StatisticsCacheEntry>();
const statisticsInFlight = new Map<string, Promise<StatisticsData>>();

export function invalidateStatisticsCache() {
  statisticsCache.clear();
  statisticsInFlight.clear();
}

export const useStatistics = (period: "week" | "month" | "year" = "month") => {
  const statisticsUrl = getApiUrl("admin/dashboard/statistics");
  const [data, setData] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get token from Redux store
  const { token } = useAppSelector((state) => state.auth);

  const getCacheKey = useCallback(
    (selectedPeriod: string) => `${token || "guest"}:${selectedPeriod}`,
    [token]
  );

  const fetchStatistics = useCallback(
    async (selectedPeriod: string, forceRefresh = false) => {
      const cacheKey = getCacheKey(selectedPeriod);
      const cached = statisticsCache.get(cacheKey);
      const hasCachedData = Boolean(cached);

      if (hasCachedData) {
        setData(cached!.data);
      }

      if (
        !forceRefresh &&
        cached &&
        Date.now() - cached.fetchedAt < STATISTICS_CACHE_TTL_MS
      ) {
        setData(cached.data);
        setLoading(false);
        return;
      }

      try {
        setLoading(forceRefresh || !hasCachedData);
        setError(null);

        if (!token) {
          throw new Error("No authentication token found");
        }

        if (!statisticsInFlight.has(cacheKey) || forceRefresh) {
          const request = fetch(`${statisticsUrl}?period=${selectedPeriod}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })
            .then(async (response) => {
              if (!response.ok) {
                throw new Error("Failed to fetch statistics");
              }

              const result = await response.json();
              const statisticsData = result.data as StatisticsData;
              statisticsCache.set(cacheKey, {
                data: statisticsData,
                fetchedAt: Date.now(),
              });
              return statisticsData;
            })
            .finally(() => {
              statisticsInFlight.delete(cacheKey);
            });

          statisticsInFlight.set(cacheKey, request);
        }

        const freshData = await statisticsInFlight.get(cacheKey)!;
        setData(freshData);
      } catch (err) {
        // Keep stale data visible when background revalidation fails
        if (!hasCachedData || forceRefresh) {
          setError(err instanceof Error ? err.message : "An error occurred");
        }
      } finally {
        setLoading(false);
      }
    },
    [getCacheKey, statisticsUrl, token]
  );

  useEffect(() => {
    if (token) {
      fetchStatistics(period, false);
    }
  }, [period, token, fetchStatistics]);

  const refetch = useCallback(() => fetchStatistics(period, true), [fetchStatistics, period]);

  return {
    data,
    loading,
    error,
    refetch,
    fetchStatistics: (selectedPeriod: string) => fetchStatistics(selectedPeriod, false),
  };
};
