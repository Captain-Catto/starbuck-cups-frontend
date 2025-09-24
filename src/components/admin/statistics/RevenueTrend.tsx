import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RevenueTrendItem {
  period: string;
  revenue: number;
}

interface RevenueTrendProps {
  data: RevenueTrendItem[];
  period: string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export function RevenueTrend({ data, period }: RevenueTrendProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-white">Xu hướng doanh thu</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border border-gray-700 rounded bg-gray-800/50"
            >
              <span className="font-medium text-white">
                {new Date(item.period).toLocaleDateString("vi-VN", {
                  year: "numeric",
                  month: "long",
                  ...(period === "week" && { day: "numeric" }),
                })}
              </span>
              <span className="font-bold text-green-400">
                {formatCurrency(item.revenue)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
