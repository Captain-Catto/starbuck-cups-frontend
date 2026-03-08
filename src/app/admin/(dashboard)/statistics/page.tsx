"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { PageHeader } from "@/components/admin/PageHeader";
import { LoadingState } from "@/components/admin/LoadingState";
import { ErrorMessage } from "@/components/admin/ErrorMessage";
import { useStatistics } from "@/hooks/useStatistics";
import {
  useTopClickedProducts,
  useTopConversionProducts,
} from "@/hooks/admin/useProductAnalytics";

const OverviewCards = dynamic(
  () =>
    import("@/components/admin/statistics/OverviewCards").then((mod) => ({
      default: mod.OverviewCards,
    })),
  {
    loading: () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="h-28 bg-gray-800 rounded-lg border border-gray-700 animate-pulse"
          />
        ))}
      </div>
    ),
  }
);

const RevenueTrend = dynamic(
  () =>
    import("@/components/admin/statistics/RevenueTrend").then((mod) => ({
      default: mod.RevenueTrend,
    })),
  { loading: () => <div className="h-64 bg-gray-800 rounded-lg animate-pulse" /> }
);

// Lazy-load below-fold components for faster initial render
const TopSellingProducts = dynamic(
  () =>
    import("@/components/admin/statistics/TopSellingProducts").then((mod) => ({
      default: mod.TopSellingProducts,
    })),
  { loading: () => <div className="bg-gray-800 rounded-lg h-64 animate-pulse border border-gray-700" /> }
);
const TopCustomersList = dynamic(
  () =>
    import("@/components/admin/statistics/TopCustomersList").then((mod) => ({
      default: mod.TopCustomersList,
    })),
  { loading: () => <div className="bg-gray-800 rounded-lg h-64 animate-pulse border border-gray-700" /> }
);
const LowStockAlert = dynamic(
  () =>
    import("@/components/admin/statistics/LowStockAlert").then((mod) => ({
      default: mod.LowStockAlert,
    })),
  { loading: () => <div className="bg-gray-800 rounded-lg h-40 animate-pulse border border-gray-700" /> }
);
const AnalyticsOverview = dynamic(
  () =>
    import("@/components/admin/analytics/AnalyticsOverview").then((mod) => ({
      default: mod.AnalyticsOverview,
    })),
  { loading: () => <div className="bg-gray-800 rounded-lg h-48 animate-pulse border border-gray-700" /> }
);
const TopClickedProducts = dynamic(
  () =>
    import("@/components/admin/analytics/TopClickedProducts").then((mod) => ({
      default: mod.TopClickedProducts,
    })),
  { loading: () => <div className="bg-gray-800 rounded-lg h-64 animate-pulse border border-gray-700" /> }
);
const TopConversionProducts = dynamic(
  () =>
    import("@/components/admin/analytics/TopConversionProducts").then((mod) => ({
      default: mod.TopConversionProducts,
    })),
  { loading: () => <div className="bg-gray-800 rounded-lg h-64 animate-pulse border border-gray-700" /> }
);

export default function StatisticsPage() {
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");
  const [clickedProductsPage, setClickedProductsPage] = useState(1);
  const [conversionProductsPage, setConversionProductsPage] = useState(1);
  const [enableAnalyticsFetch, setEnableAnalyticsFetch] = useState(false);
  const analyticsSectionRef = useRef<HTMLDivElement | null>(null);
  const { data, loading, error, fetchStatistics } = useStatistics(period);

  useEffect(() => {
    if (!data?.productAnalytics || enableAnalyticsFetch) {
      return;
    }

    const target = analyticsSectionRef.current;
    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setEnableAnalyticsFetch(true);
          }
        });
      },
      {
        root: null,
        rootMargin: "300px 0px",
        threshold: 0.05,
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [data?.productAnalytics, enableAnalyticsFetch]);

  // Fetch paginated analytics data only when analytics section is near viewport
  const { products: clickedProducts, loading: clickedLoading } =
    useTopClickedProducts(10, clickedProductsPage, enableAnalyticsFetch);

  const { products: conversionProducts, loading: conversionLoading } =
    useTopConversionProducts(10, conversionProductsPage, enableAnalyticsFetch);

  const handlePeriodChange = (newPeriod: "week" | "month" | "year") => {
    setPeriod(newPeriod);
  };

  const handleClickedProductsPageChange = (page: number) => {
    setClickedProductsPage(page);
  };

  const handleConversionProductsPageChange = (page: number) => {
    setConversionProductsPage(page);
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorMessage error={error} onRetry={() => fetchStatistics(period)} />;
  }

  if (!data) {
    return (
      <ErrorMessage
        error="Không có dữ liệu thống kê"
        onRetry={() => fetchStatistics(period)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Thống kê"
        description="Báo cáo chi tiết về doanh số, khách hàng và sản phẩm"
      />

      {/* Period Selector */}
      <div className="flex space-x-2">
        <button
          onClick={() => handlePeriodChange("week")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            period === "week"
              ? "bg-gray-700 text-white"
              : "bg-gray-800 text-gray-400 hover:text-gray-300"
          }`}
        >
          Tuần
        </button>
        <button
          onClick={() => handlePeriodChange("month")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            period === "month"
              ? "bg-gray-700 text-white"
              : "bg-gray-800 text-gray-400 hover:text-gray-300"
          }`}
        >
          Tháng
        </button>
        <button
          onClick={() => handlePeriodChange("year")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            period === "year"
              ? "bg-gray-700 text-white"
              : "bg-gray-800 text-gray-400 hover:text-gray-300"
          }`}
        >
          Năm
        </button>
      </div>

      {/* Overview Cards */}
      <OverviewCards
        data={data.overview}
        period={period}
        lowStockCount={data.lowStockProducts?.length || 0}
      />

      {/* Revenue Trend */}
      <RevenueTrend data={data.revenueTrend} period={period} />

      {/* Top Selling Products & Top Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopSellingProducts products={data.topSellingProducts} />
        <TopCustomersList customers={data.topCustomers} />
      </div>

      {/* Low Stock Products Alert */}
      <LowStockAlert />

      {/* Product Analytics Section */}
      {data.productAnalytics && (
        <div ref={analyticsSectionRef}>
          {enableAnalyticsFetch ? (
            <>
              {/* Analytics Overview */}
              <AnalyticsOverview
                data={{
                  totalClicks: data.productAnalytics.summary.totalClicks,
                  totalAddToCarts: data.productAnalytics.summary.totalAddToCarts,
                  overallConversionRate:
                    data.productAnalytics.summary.overallConversionRate,
                  uniqueProductsClicked:
                    data.productAnalytics.topClickedProducts.length,
                  uniqueProductsAddedToCart:
                    data.productAnalytics.topAddToCartProducts.length,
                  topClickedProducts: data.productAnalytics.topClickedProducts,
                  topConversionProducts:
                    data.productAnalytics.topConversionProducts,
                }}
              />

              {/* Top Clicked Products & Top Conversion Products */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TopClickedProducts
                  page={clickedProductsPage}
                  onPageChange={handleClickedProductsPageChange}
                  products={clickedProducts}
                  loading={clickedLoading}
                />
                <TopConversionProducts
                  page={conversionProductsPage}
                  onPageChange={handleConversionProductsPageChange}
                  products={conversionProducts}
                  loading={conversionLoading}
                />
              </div>
            </>
          ) : (
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 text-gray-300">
              Đang chuẩn bị dữ liệu analytics...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
