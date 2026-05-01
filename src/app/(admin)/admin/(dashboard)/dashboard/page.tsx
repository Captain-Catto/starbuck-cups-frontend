"use client";

import dynamic from "next/dynamic";
import { useDashboard } from "@/hooks/admin/useDashboard";

const WelcomeSection = dynamic(
  () =>
    import("@/components/admin/dashboard/WelcomeSection").then((mod) => ({
      default: mod.WelcomeSection,
    })),
  { loading: () => <div className="h-24 bg-gray-800 rounded-xl animate-pulse" /> }
);

const StatsGrid = dynamic(
  () =>
    import("@/components/admin/dashboard/StatsGrid").then((mod) => ({
      default: mod.StatsGrid,
    })),
  {
    loading: () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="h-32 bg-gray-800 rounded-xl border border-gray-700 animate-pulse"
          />
        ))}
      </div>
    ),
  }
);

const RecentOrders = dynamic(
  () =>
    import("@/components/admin/dashboard/RecentOrders").then((mod) => ({
      default: mod.RecentOrders,
    })),
  { loading: () => <div className="h-80 bg-gray-800 rounded-xl animate-pulse" /> }
);

const QuickActions = dynamic(
  () =>
    import("@/components/admin/dashboard/QuickActions").then((mod) => ({
      default: mod.QuickActions,
    })),
  { loading: () => <div className="h-80 bg-gray-800 rounded-xl animate-pulse" /> }
);

const RevenueSummary = dynamic(
  () =>
    import("@/components/admin/dashboard/RevenueSummary").then((mod) => ({
      default: mod.RevenueSummary,
    })),
  { loading: () => <div className="h-64 bg-gray-800 rounded-xl animate-pulse" /> }
);

export default function AdminDashboard() {
  const {
    dashboardStats,
    recentOrders,
    revenueData,
    pendingConsultations,
    loading,
    statsLoading,
    ordersLoading,
    revenueLoading,
    error,
    refetch,
  } = useDashboard();

  return (
    <div className="space-y-6 p-6">
      {/* Welcome Section */}
      <WelcomeSection loading={loading} error={error} onRefresh={refetch} />

      {/* Stats Grid - renders as soon as stats data arrives */}
      <StatsGrid
        dashboardStats={dashboardStats}
        revenueData={revenueData}
        pendingConsultations={pendingConsultations}
        loading={statsLoading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders - renders independently */}
        <RecentOrders orders={recentOrders} loading={ordersLoading} />

        {/* Quick Actions - no data dependency, renders immediately */}
        <QuickActions />
      </div>

      {/* Revenue Summary - renders independently */}
      <RevenueSummary revenueData={revenueData} loading={revenueLoading} />
    </div>
  );
}
