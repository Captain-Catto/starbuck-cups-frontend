import {
  CheckCircle,
  XCircle,
  Package,
  Truck,
  AlertCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

interface OrderDetailActionsProps {
  orderStatus: string;
  updating: boolean;
  onUpdateStatus: (newStatus: string) => Promise<boolean>;
}

interface QuickAction {
  label: string;
  status: string;
  color: "green" | "red" | "blue" | "orange" | "yellow";
  icon: typeof CheckCircle;
}

export function OrderDetailActions({
  orderStatus,
  updating,
  onUpdateStatus,
}: OrderDetailActionsProps) {
  // Get color classes for each action type
  const getColorClasses = (color: QuickAction["color"]) => {
    switch (color) {
      case "green":
        return "bg-green-600 hover:bg-green-700 text-white";
      case "red":
        return "bg-red-600 hover:bg-red-700 text-white";
      case "blue":
        return "bg-blue-600 hover:bg-blue-700 text-white";
      case "orange":
        return "bg-orange-600 hover:bg-orange-700 text-white";
      case "yellow":
        return "bg-yellow-600 hover:bg-yellow-700 text-white";
      default:
        return "bg-gray-600 hover:bg-gray-700 text-white";
    }
  };

  // Get available actions based on current status
  const getAvailableActions = (): QuickAction[] => {
    const status = orderStatus.toUpperCase();
    const actions: QuickAction[] = [];

    switch (status) {
      case "PENDING":
        actions.push(
          {
            label: "Xác nhận đơn hàng",
            status: "CONFIRMED",
            color: "green",
            icon: CheckCircle,
          },
          {
            label: "Hủy đơn hàng",
            status: "CANCELLED",
            color: "red",
            icon: XCircle,
          }
        );
        break;
      case "CONFIRMED":
        actions.push(
          {
            label: "Bắt đầu xử lý",
            status: "PROCESSING",
            color: "blue",
            icon: Package,
          },
          {
            label: "Hủy đơn hàng",
            status: "CANCELLED",
            color: "red",
            icon: XCircle,
          }
        );
        break;
      case "PROCESSING":
        actions.push(
          {
            label: "Giao hàng",
            status: "SHIPPED",
            color: "orange",
            icon: Truck,
          },
          {
            label: "Hủy đơn hàng",
            status: "CANCELLED",
            color: "red",
            icon: XCircle,
          }
        );
        break;
      case "SHIPPED":
        actions.push({
          label: "Hoàn thành giao hàng",
          status: "DELIVERED",
          color: "green",
          icon: CheckCircle,
        });
        break;
    }

    return actions;
  };

  // Handle action click
  const handleActionClick = async (action: QuickAction) => {
    const success = await onUpdateStatus(action.status);

    if (success) {
      toast.success(`Đã cập nhật trạng thái đơn hàng thành "${action.label}"`);
    } else {
      toast.error("Không thể cập nhật trạng thái đơn hàng");
    }
  };

  const availableActions = getAvailableActions();

  if (availableActions.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-4">
        <AlertCircle className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-medium text-white">Hành động nhanh</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.status}
              onClick={() => handleActionClick(action)}
              disabled={updating}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium text-sm
                disabled:opacity-50 disabled:cursor-not-allowed
                ${getColorClasses(action.color)}
              `}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {updating ? "Đang cập nhật..." : action.label}
            </button>
          );
        })}
      </div>

      {updating && (
        <div className="flex items-center gap-2 mt-4 p-3 bg-blue-900/20 border border-blue-800 rounded-lg">
          <Clock className="w-4 h-4 text-blue-400 animate-spin" />
          <span className="text-sm text-blue-300">
            Đang cập nhật trạng thái đơn hàng...
          </span>
        </div>
      )}
    </div>
  );
}
