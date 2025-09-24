import {
  ShoppingBag,
  Settings,
  MessageCircle,
  AlertTriangle,
} from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "order" | "system" | "message" | "warning";
  read: boolean;
  createdAt: string;
  orderId?: string;
}

interface NotificationItemProps {
  notification: Notification;
  onClick: (notification: Notification) => void;
}

export function NotificationItem({
  notification,
  onClick,
}: NotificationItemProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "order":
        return ShoppingBag;
      case "system":
        return Settings;
      case "message":
        return MessageCircle;
      case "warning":
        return AlertTriangle;
      default:
        return MessageCircle;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "order":
        return "text-green-400";
      case "system":
        return "text-blue-400";
      case "message":
        return "text-purple-400";
      case "warning":
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "order":
        return "Đơn hàng";
      case "system":
        return "Hệ thống";
      case "message":
        return "Tin nhắn";
      case "warning":
        return "Cảnh báo";
      default:
        return "Khác";
    }
  };

  const Icon = getIcon(notification.type);
  const typeColor = getTypeColor(notification.type);
  const typeLabel = getTypeLabel(notification.type);

  return (
    <div
      onClick={() => onClick(notification)}
      className={`p-4 border border-gray-700 rounded-lg cursor-pointer transition-all hover:border-gray-600 hover:bg-gray-700/50 ${
        !notification.read ? "bg-gray-800 border-blue-500/30" : "bg-gray-900"
      }`}
    >
      <div className="flex gap-4">
        {/* Icon */}
        <div className={`flex-shrink-0 p-2 rounded-lg ${typeColor}`}>
          <Icon className="w-5 h-5" />
        </div>

        {/* Nội dung */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4
              className={`text-sm font-semibold ${
                !notification.read ? "text-white" : "text-gray-300"
              }`}
            >
              {notification.title}
            </h4>
            {!notification.read && (
              <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </div>

          <p className="text-sm text-gray-400 mb-3 line-clamp-2">
            {notification.message}
          </p>

          <div className="flex items-center justify-between">
            <span
              className={`text-xs px-2 py-1 rounded-full bg-gray-800 ${typeColor}`}
            >
              {typeLabel}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(notification.createdAt).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          {notification.orderId && (
            <div className="mt-2">
              <span className="text-xs text-gray-400">
                Đơn hàng: #{notification.orderId}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
