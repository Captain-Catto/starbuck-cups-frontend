import { Bell, CheckCircle2, Trash2, ArrowLeft } from "lucide-react";

interface NotificationHeaderProps {
  onBack: () => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  hasUnread: boolean;
}

export function NotificationHeader({
  onBack,
  onMarkAllAsRead,
  onClearAll,
  hasUnread,
}: NotificationHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Bell className="w-8 h-8 text-white" />
            Thông báo
          </h1>
          <p className="text-white mt-2">
            Quản lý tất cả thông báo của hệ thống
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {hasUnread && (
          <button
            onClick={onMarkAllAsRead}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            Đánh dấu tất cả đã đọc
          </button>
        )}
        <button
          onClick={onClearAll}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4 text-white" />
          Xóa tất cả
        </button>
      </div>
    </div>
  );
}
