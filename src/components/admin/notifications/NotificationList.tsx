import { NotificationItem } from "./NotificationItem";
import { Bell } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "order" | "system" | "message" | "warning";
  read: boolean;
  createdAt: string;
  orderId?: string;
}

interface NotificationListProps {
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  loading?: boolean;
}

export function NotificationList({
  notifications,
  onNotificationClick,
  loading = false,
}: NotificationListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className="p-4 border border-gray-700 rounded-lg bg-black animate-pulse"
          >
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-9 h-9 bg-gray-700 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="w-2 h-2 bg-gray-700 rounded-full"></div>
                </div>
                <div className="h-3 bg-gray-700 rounded w-full"></div>
                <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                <div className="flex items-center justify-between">
                  <div className="h-6 bg-gray-700 rounded w-16"></div>
                  <div className="h-3 bg-gray-700 rounded w-20"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-gray-800 rounded-full">
            <Bell className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Không có thông báo
        </h3>
        <p className="text-gray-400 max-w-md mx-auto">
          Hiện tại không có thông báo nào. Các thông báo mới sẽ xuất hiện ở đây.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClick={onNotificationClick}
        />
      ))}
    </div>
  );
}
