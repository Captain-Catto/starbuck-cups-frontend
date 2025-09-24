import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
  ShoppingCart,
  AlertTriangle,
} from "lucide-react";

interface OverviewData {
  totalProductsSold: number;
  totalRevenue: number;
  currentPeriodSales: number;
  currentPeriodRevenue: number;
  currentPeriodOrders: number;
  salesGrowth: number;
  revenueGrowth: number;
  ordersGrowth: number;
}

interface OverviewCardsProps {
  data: OverviewData;
  period: string;
  lowStockCount: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat("vi-VN").format(num);
};

const GrowthIndicator = ({ value }: { value: number }) => {
  const isPositive = value >= 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const colorClass = isPositive ? "text-green-400" : "text-red-400";

  return (
    <div className={`flex items-center ${colorClass}`}>
      <Icon className="h-4 w-4 mr-1" />
      <span className="text-sm font-medium">
        {isPositive ? "+" : ""}
        {value}%
      </span>
    </div>
  );
};

export function OverviewCards({
  data,
  period,
  lowStockCount,
}: OverviewCardsProps) {
  const getPeriodLabel = (period: string) => {
    switch (period) {
      case "week":
        return "tuần";
      case "month":
        return "tháng";
      case "year":
        return "năm";
      default:
        return "tháng";
    }
  };

  const periodLabel = getPeriodLabel(period);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">
            Tổng sản phẩm đã bán
          </CardTitle>
          <Package className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {formatNumber(data.totalProductsSold)}
          </div>
          <p className="text-xs text-gray-400">
            {formatNumber(data.currentPeriodSales)} trong {periodLabel} này
          </p>
          <GrowthIndicator value={data.salesGrowth} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">
            Tổng doanh thu
          </CardTitle>
          <DollarSign className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {formatCurrency(data.totalRevenue)}
          </div>
          <p className="text-xs text-gray-400">
            {formatCurrency(data.currentPeriodRevenue)} trong {periodLabel} này
          </p>
          <GrowthIndicator value={data.revenueGrowth} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">
            Đơn hàng {periodLabel} này
          </CardTitle>
          <ShoppingCart className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {formatNumber(data.currentPeriodOrders)}
          </div>
          <GrowthIndicator value={data.ordersGrowth} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">
            Sản phẩm sắp hết hàng
          </CardTitle>
          <AlertTriangle className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-400">{lowStockCount}</div>
          <p className="text-xs text-gray-400">Sản phẩm có tồn kho &lt; 1</p>
        </CardContent>
      </Card>
    </div>
  );
}
