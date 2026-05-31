import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Phone } from "lucide-react";
import Link from "next/link";

interface TopCustomer {
  id: string;
  name: string;
  phone: string;
  totalSpent: number;
  messengerId?: string;
  zaloId?: string;
}

interface TopCustomersListProps {
  customers: TopCustomer[];
}

const viCurrencyFormatter = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });
const formatCurrency = (amount: number) => viCurrencyFormatter.format(amount);

export function TopCustomersList({ customers }: TopCustomersListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-white">
          Khách hàng chi tiêu cao nhất
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {customers.map((customer, index) => (
            <div
              key={customer.id}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-x-3 flex-1">
                <div className="flex size-8 items-center justify-center rounded-full bg-green-100 text-sm font-medium text-green-900">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <Link
                    href={`/admin/customers/${customer.id}`}
                    className="font-medium text-white hover:text-green-400 transition-colors cursor-pointer"
                  >
                    {customer.name}
                  </Link>
                  <div className="flex items-center gap-x-3 mt-1">
                    <div className="flex items-center gap-x-1 text-sm text-gray-400">
                      <Phone className="size-3" />
                      <span>{customer.phone}</span>
                    </div>
                    {customer.messengerId && (
                      <div className="flex items-center gap-x-1 text-sm text-blue-400">
                        <MessageCircle className="size-3" />
                        <span>Messenger</span>
                      </div>
                    )}
                    {customer.zaloId && (
                      <div className="flex items-center gap-x-1 text-sm text-blue-500">
                        <MessageCircle className="size-3" />
                        <span>Zalo</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <span className="font-bold text-green-400">
                {formatCurrency(customer.totalSpent)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
