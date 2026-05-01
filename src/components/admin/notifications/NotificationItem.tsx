import React from "react";
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

type NotificationType = Notification["type"];

const ICON_MAP: Record<NotificationType, React.FC<{ className?: string }>> = {
  order: ShoppingBag,
  system: Settings,
  message: MessageCircle,
  warning: AlertTriangle,
};

const COLOR_MAP: Record<NotificationType, string> = {
  order: "text-green-400",
  system: "text-blue-400",
  message: "text-purple-400",
  warning: "text-yellow-400",
};

const LABEL_MAP: Record<NotificationType, string> = {
  order: "Đơn hàng",
  system: "Hệ thống",
  message: "Tin nhắn",
  warning: "Cảnh báo",
};

export function NotificationItem({
  notification,
  onClick,
}: NotificationItemProps) {
  const Icon = ICON_MAP[notification.type] ?? MessageCircle;
  const typeColor = COLOR_MAP[notification.type] ?? "text-gray-400";
  const typeLabel = LABEL_MAP[notification.type] ?? "Khác";

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
