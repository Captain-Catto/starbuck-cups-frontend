"use client";

import { useDashboard } from "@/hooks/admin/useDashboard";
import { WelcomeSection } from "@/components/admin/dashboard/WelcomeSection";
import { StatsGrid } from "@/components/admin/dashboard/StatsGrid";
import { RecentOrders } from "@/components/admin/dashboard/RecentOrders";
import { QuickActions } from "@/components/admin/dashboard/QuickActions";
import { RevenueSummary } from "@/components/admin/dashboard/RevenueSummary";

export default function AdminDashboard() {
  const {
    dashboardStats,
    recentOrders,
    revenueData,
    pendingConsultations,
    loading,
    error,
    refetch,
  } = useDashboard();

  return (
    <div className="space-y-6 p-6">
      {/* Welcome Section */}
      <WelcomeSection loading={loading} error={error} onRefresh={refetch} />

      {/* Stats Grid */}
      <StatsGrid
        dashboardStats={dashboardStats}
        revenueData={revenueData}
        pendingConsultations={pendingConsultations}
        loading={loading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <RecentOrders orders={recentOrders} loading={loading} />

        {/* Quick Actions */}
        <QuickActions />
      </div>

      {/* Revenue Summary */}
      <RevenueSummary revenueData={revenueData} loading={loading} />
    </div>
  );
}
