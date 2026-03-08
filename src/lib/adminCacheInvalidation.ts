import { invalidateDashboardCache } from "@/hooks/admin/useDashboard";
import { invalidateOrderStatsCache } from "@/hooks/admin/useOrderStats";
import { invalidateStatisticsCache } from "@/hooks/useStatistics";

export function invalidateProductDependentCaches() {
  invalidateDashboardCache();
  invalidateStatisticsCache();
}

export function invalidateOrderDependentCaches() {
  invalidateDashboardCache();
  invalidateOrderStatsCache();
  invalidateStatisticsCache();
}
