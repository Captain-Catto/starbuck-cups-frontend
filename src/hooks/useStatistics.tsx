import { useReducer, useEffect, useCallback } from "react";
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

interface StatisticsState {
  data: StatisticsData | null;
  loading: boolean;
  error: string | null;
}

type StatisticsAction =
  | { type: "SET_CACHED_DATA"; payload: StatisticsData }
  | { type: "FETCH_START"; loading: boolean }
  | { type: "FETCH_SUCCESS"; payload: StatisticsData }
  | { type: "FETCH_ERROR"; payload: string | null };

const initialStatisticsState: StatisticsState = {
  data: null,
  loading: true,
  error: null,
};

function statisticsReducer(
  state: StatisticsState,
  action: StatisticsAction
): StatisticsState {
  switch (action.type) {
    case "SET_CACHED_DATA":
      return { ...state, data: action.payload };
    case "FETCH_START":
      return { ...state, loading: action.loading, error: null };
    case "FETCH_SUCCESS":
      return { data: action.payload, loading: false, error: null };
    case "FETCH_ERROR":
      return {
        ...state,
        loading: false,
        error: action.payload ?? state.error,
      };
    default:
      return state;
  }
}

export function invalidateStatisticsCache() {
  statisticsCache.clear();
  statisticsInFlight.clear();
}

export const useStatistics = (period: "week" | "month" | "year" = "month") => {
  const statisticsUrl = "/api/admin/dashboard/statistics";
  const [{ data, loading, error }, dispatch] = useReducer(
    statisticsReducer,
    initialStatisticsState
  );

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
        dispatch({ type: "SET_CACHED_DATA", payload: cached!.data });
      }

      if (
        !forceRefresh &&
        cached &&
        Date.now() - cached.fetchedAt < STATISTICS_CACHE_TTL_MS
      ) {
        dispatch({ type: "FETCH_SUCCESS", payload: cached.data });
        return;
      }

      try {
        dispatch({
          type: "FETCH_START",
          loading: forceRefresh || !hasCachedData,
        });

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
        dispatch({ type: "FETCH_SUCCESS", payload: freshData });
      } catch (err) {
        // Keep stale data visible when background revalidation fails
        dispatch({
          type: "FETCH_ERROR",
          payload:
            !hasCachedData || forceRefresh
              ? err instanceof Error
                ? err.message
                : "An error occurred"
              : null,
        });
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
