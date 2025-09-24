import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface LowStockProduct {
  id: string;
  name: string;
  stockQuantity: number;
  capacity: {
    name: string;
  };
}

interface LowStockAlertProps {
  products: LowStockProduct[];
}

export function LowStockAlert({ products }: LowStockAlertProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <AlertTriangle className="h-5 w-5 mr-2 text-gray-400" />
          Sản phẩm sắp hết hàng
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="p-4 border border-gray-700 rounded-lg bg-gray-800"
            >
              <h4 className="font-medium text-white">{product.name}</h4>
              <p className="text-sm text-gray-400">{product.capacity.name}</p>
              <p className="text-lg font-bold text-red-400 mt-2">
                Còn lại: {product.stockQuantity}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
