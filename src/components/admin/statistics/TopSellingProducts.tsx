import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TopProduct {
  id: string;
  name: string;
  capacity: string;
  totalSold: number;
}

interface TopSellingProductsProps {
  products: TopProduct[];
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat("vi-VN").format(num);
};

export function TopSellingProducts({ products }: TopSellingProductsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-white">Sản phẩm bán chạy nhất</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.slice(0, 5).map((product, index) => (
            <div key={product.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-sm font-medium text-white">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-white">{product.name}</p>
                  <p className="text-sm text-gray-400">{product.capacity}</p>
                </div>
              </div>
              <span className="font-bold text-white">
                {formatNumber(product.totalSold)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
