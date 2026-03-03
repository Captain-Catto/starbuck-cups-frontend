"use client";

import { MousePointer, ShoppingCart, TrendingUp, Eye } from "lucide-react";
import { AnalyticsSummary } from "@/hooks/admin/useProductAnalytics";

interface AnalyticsOverviewProps {
  data: AnalyticsSummary;
}

export function AnalyticsOverview({ data }: AnalyticsOverviewProps) {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const cards = [
    {
      title: "Tổng lượt click",
      value: formatNumber(data.totalClicks),
      icon: MousePointer,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      description: `${data.uniqueProductsClicked} sản phẩm được click`,
    },
    {
      title: "Tổng lượt thêm giỏ tư vấn",
      value: formatNumber(data.totalAddToCarts),
      icon: ShoppingCart,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      description: `${data.uniqueProductsAddedToCart} sản phẩm được thêm`,
    },
    {
      title: "Tỷ lệ chuyển đổi",
      value: formatPercentage(data.overallConversionRate),
      icon: TrendingUp,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      description: "Click → Thêm vào giỏ",
    },
    {
      title: "Sản phẩm phổ biến",
      value: data.topClickedProducts.length.toString(),
      icon: Eye,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      description: "Sản phẩm được theo dõi",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 hover:border-gray-600 transition-all"
        >
          <div>
            <p className="text-2xl font-bold text-white mb-1">{card.value}</p>
            <p className="text-sm text-gray-400">{card.title}</p>
            <p className="text-xs text-gray-500 mt-1">{card.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
