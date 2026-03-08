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

  // Independent loading states - each section renders as its data arrives
  loading: boolean;
  statsLoading: boolean;
  ordersLoading: boolean;
  revenueLoading: boolean;
  error: string | null;

  // Actions
  fetchDashboardData: () => Promise<void>;
  refetch: () => Promise<void>;
}

type SectionCache<T> = {
  token: string | null;
  value: T | null;
  fetchedAt: number;
  inFlight: Promise<T> | null;
};

const DASHBOARD_CACHE_TTL_MS = 45_000;

const statsCache: SectionCache<DashboardStats> = {
  token: null,
  value: null,
  fetchedAt: 0,
  inFlight: null,
};

const recentOrdersCache: SectionCache<RecentOrder[]> = {
  token: null,
  value: null,
  fetchedAt: 0,
  inFlight: null,
};

const revenueCache: SectionCache<RevenueData> = {
  token: null,
  value: null,
  fetchedAt: 0,
  inFlight: null,
};

const pendingConsultationsCache: SectionCache<number> = {
  token: null,
  value: null,
  fetchedAt: 0,
  inFlight: null,
};

export function invalidateDashboardCache() {
  statsCache.token = null;
  statsCache.value = null;
  statsCache.fetchedAt = 0;
  statsCache.inFlight = null;

  recentOrdersCache.token = null;
  recentOrdersCache.value = null;
  recentOrdersCache.fetchedAt = 0;
  recentOrdersCache.inFlight = null;

  revenueCache.token = null;
  revenueCache.value = null;
  revenueCache.fetchedAt = 0;
  revenueCache.inFlight = null;

  pendingConsultationsCache.token = null;
  pendingConsultationsCache.value = null;
  pendingConsultationsCache.fetchedAt = 0;
  pendingConsultationsCache.inFlight = null;
}

function isSectionCacheFresh<T>(cache: SectionCache<T>, token: string) {
  return (
    cache.token === token &&
    cache.value !== null &&
    Date.now() - cache.fetchedAt < DASHBOARD_CACHE_TTL_MS
  );
}

function setSectionCache<T>(cache: SectionCache<T>, token: string, value: T) {
  cache.token = token;
  cache.value = value;
  cache.fetchedAt = Date.now();
}

export function useDashboard(): UseDashboardReturn {
  const { token } = useAppSelector((state) => state.auth);

  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [pendingConsultations, setPendingConsultations] = useState<number>(0);

  const [statsLoading, setStatsLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data - each section fetches independently for progressive rendering
  const fetchDashboardData = useCallback(
    async (forceRefresh = false) => {
      if (!token) {
        setError("Không có token xác thực");
        setStatsLoading(false);
        setOrdersLoading(false);
        setRevenueLoading(false);
        return;
      }

      setError(null);

      // Stats
      const hasCachedStats = statsCache.token === token && statsCache.value !== null;
      if (hasCachedStats) {
        setDashboardStats(statsCache.value);
      }

      if (!forceRefresh && isSectionCacheFresh(statsCache, token)) {
        setStatsLoading(false);
      } else {
        setStatsLoading(forceRefresh || !hasCachedStats);

        if (!statsCache.inFlight || forceRefresh) {
          statsCache.inFlight = dashboardAPI
            .getDashboardStats(token)
            .then((stats) => {
              setSectionCache(statsCache, token, stats);
              return stats;
            })
            .finally(() => {
              statsCache.inFlight = null;
            });
        }

        statsCache.inFlight
          ?.then((stats) => {
            setDashboardStats(stats);
          })
          .catch(() => {})
          .finally(() => setStatsLoading(false));
      }

      // Recent orders
      const hasCachedOrders =
        recentOrdersCache.token === token && recentOrdersCache.value !== null;
      if (hasCachedOrders) {
        setRecentOrders(recentOrdersCache.value || []);
      }

      if (!forceRefresh && isSectionCacheFresh(recentOrdersCache, token)) {
        setOrdersLoading(false);
      } else {
        setOrdersLoading(forceRefresh || !hasCachedOrders);

        if (!recentOrdersCache.inFlight || forceRefresh) {
          recentOrdersCache.inFlight = dashboardAPI
            .getRecentOrders(5, token)
            .then((orders) => {
              setSectionCache(recentOrdersCache, token, orders);
              return orders;
            })
            .finally(() => {
              recentOrdersCache.inFlight = null;
            });
        }

        recentOrdersCache.inFlight
          ?.then((orders) => {
            setRecentOrders(orders);
          })
          .catch(() => {})
          .finally(() => setOrdersLoading(false));
      }

      // Revenue
      const hasCachedRevenue = revenueCache.token === token && revenueCache.value !== null;
      if (hasCachedRevenue) {
        setRevenueData(revenueCache.value);
      }

      if (!forceRefresh && isSectionCacheFresh(revenueCache, token)) {
        setRevenueLoading(false);
      } else {
        setRevenueLoading(forceRefresh || !hasCachedRevenue);

        if (!revenueCache.inFlight || forceRefresh) {
          revenueCache.inFlight = dashboardAPI
            .getRevenueData(token)
            .then((revenue) => {
              setSectionCache(revenueCache, token, revenue);
              return revenue;
            })
            .finally(() => {
              revenueCache.inFlight = null;
            });
        }

        revenueCache.inFlight
          ?.then((revenue) => {
            setRevenueData(revenue);
          })
          .catch(() => {})
          .finally(() => setRevenueLoading(false));
      }

      // Pending consultations (no hard loading state for this metric)
      const hasCachedPending =
        pendingConsultationsCache.token === token &&
        pendingConsultationsCache.value !== null;
      if (hasCachedPending) {
        setPendingConsultations(pendingConsultationsCache.value || 0);
      }

      if (forceRefresh || !isSectionCacheFresh(pendingConsultationsCache, token)) {
        if (!pendingConsultationsCache.inFlight || forceRefresh) {
          pendingConsultationsCache.inFlight = dashboardAPI
            .getPendingConsultationsCount(token)
            .then((res) => {
              setSectionCache(pendingConsultationsCache, token, res.count);
              return res.count;
            })
            .finally(() => {
              pendingConsultationsCache.inFlight = null;
            });
        }

        pendingConsultationsCache.inFlight
          ?.then((count) => {
            setPendingConsultations(count);
          })
          .catch(() => {});
      }
    },
    [token]
  );

  const refetch = useCallback(() => {
    return fetchDashboardData(true);
  }, [fetchDashboardData]);

  useEffect(() => {
    if (token) {
      fetchDashboardData(false);
    }
  }, [token, fetchDashboardData]);

  // Overall loading = any section still loading
  const loading = statsLoading || ordersLoading || revenueLoading;

  return {
    dashboardStats,
    recentOrders,
    revenueData,
    pendingConsultations,
    loading,
    statsLoading,
    ordersLoading,
    revenueLoading,
    error,
    fetchDashboardData: () => fetchDashboardData(false),
    refetch,
  };
}
