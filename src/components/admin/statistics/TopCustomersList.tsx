import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Phone } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
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
  itemsPerPage?: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export function TopCustomersList({
  customers,
  itemsPerPage = 10,
}: TopCustomersListProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(customers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = customers.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-white">
          Khách hàng chi tiêu cao nhất
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {currentCustomers.map((customer, index) => {
            const globalIndex = startIndex + index;
            return (
              <div
                key={customer.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-medium text-gray-900">
                    {globalIndex + 1}
                  </div>
                  <div className="flex-1">
                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="font-medium text-white hover:text-green-400 transition-colors cursor-pointer"
                    >
                      {customer.name}
                    </Link>
                    <div className="flex items-center space-x-3 mt-1">
                      <div className="flex items-center space-x-1 text-sm text-gray-400">
                        <Phone className="h-3 w-3" />
                        <span>{customer.phone}</span>
                      </div>
                      {customer.messengerId && (
                        <div className="flex items-center space-x-1 text-sm text-blue-400">
                          <MessageCircle className="h-3 w-3" />
                          <span>Messenger</span>
                        </div>
                      )}
                      {customer.zaloId && (
                        <div className="flex items-center space-x-1 text-sm text-blue-500">
                          <MessageCircle className="h-3 w-3" />
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
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 pt-4 border-t border-gray-700">
            <Pagination
              data={{
                current_page: currentPage,
                total_pages: totalPages,
                has_next: currentPage < totalPages,
                has_prev: currentPage > 1,
                per_page: itemsPerPage,
                total_items: customers.length,
              }}
              onPageChange={goToPage}
            />
          </div>
        )}

        {/* Page info */}
        {totalPages > 1 && (
          <div className="text-center mt-3">
            <span className="text-sm text-gray-400">
              Trang {currentPage} / {totalPages}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
