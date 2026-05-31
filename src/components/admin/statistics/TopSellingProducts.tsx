import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface TopProduct {
  id: string;
  name: string;
  capacity: string;
  totalSold: number;
  slug?: string;
}

interface TopSellingProductsProps {
  products: TopProduct[];
}

const viNumberFormatter = new Intl.NumberFormat("vi-VN");
const formatNumber = (num: number) => viNumberFormatter.format(num);

export function TopSellingProducts({ products }: TopSellingProductsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-white">Sản phẩm bán chạy nhất</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.map((product, index) => (
            <Link
              key={product.id}
              href={`/products/${product.slug || product.id}`}
              target="_blank"
              className="flex items-center justify-between p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-x-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-gray-700 text-sm font-medium text-white">
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
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
