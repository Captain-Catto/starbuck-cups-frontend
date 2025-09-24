import { Package, Users, ShoppingCart, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";

export function QuickActions() {
  const router = useRouter();

  const actions = [
    {
      title: "Quản lý sản phẩm",
      icon: Package,
      path: "/admin/products",
    },
    {
      title: "Quản lý khách hàng",
      icon: Users,
      path: "/admin/customers",
    },
    {
      title: "Quản lý đơn hàng",
      icon: ShoppingCart,
      path: "/admin/orders",
    },
    {
      title: "Quản lý tư vấn",
      icon: MessageSquare,
      path: "/admin/consultations",
    },
  ];

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700">
      <div className="p-6 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">Thao tác nhanh</h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.path}
                onClick={() => router.push(action.path)}
                className="flex flex-col items-center gap-3 p-4 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors cursor-pointer border border-gray-600/50 hover:border-gray-500"
              >
                <Icon className="w-8 h-8 text-gray-300" />
                <span className="text-sm font-medium text-gray-300">
                  {action.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
