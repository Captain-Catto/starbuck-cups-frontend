"use client";

import React, { memo, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store";
import {
  markNotificationAsRead,
  markAllAsRead,
} from "@/store/slices/notificationSlice";
import { apiWithAuth } from "@/lib/apiWithAuth";
import {
  isConsultationData,
  isOrderData,
} from "@/types/notification.types";
import type { NotificationData } from "@/types/notification.types";
import { Bell, X, Clock, CheckCircle2, Eye } from "lucide-react";

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) {
    return "Vừa xong";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} giờ trước`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `${days} ngày trước`;
  }
};

interface NotificationItemProps {
  notification: NotificationData;
  onClick: (notification: NotificationData) => void;
}

const NotificationItem = memo(function NotificationItem({
  notification,
  onClick,
}: NotificationItemProps) {
  const selectNotification = useCallback(() => onClick(notification), [notification, onClick]);
  return (
    <button
      type="button"
      onClick={selectNotification}
      className={`w-full text-left p-4 cursor-pointer hover:bg-gray-700 transition-colors ${
        !notification.read ? "bg-gray-700/50" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4 className={`text-sm font-medium ${!notification.read ? "text-white" : "text-gray-300"}`}>
                {notification.title}
              </h4>
              <p className={`text-sm mt-1 ${!notification.read ? "text-gray-300" : "text-gray-400"}`}>
                {notification.message}
              </p>
            </div>
            {!notification.read && (
              <div className="size-2 bg-white rounded-full flex-shrink-0 mt-2" />
            )}
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="size-3" />
              {formatTimestamp(notification.timestamp)}
            </span>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Eye className="size-3" />
              <span>Xem chi tiết</span>
            </div>
          </div>
          {notification.data && (
            <div className="mt-2 text-xs text-gray-500">
              {isConsultationData(notification.data) && notification.data.customerName && (
                <span>Khách hàng: {notification.data.customerName}</span>
              )}
              {isOrderData(notification.data) && notification.data.orderId && (
                <span>Đơn hàng: #{notification.data.orderId}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  );
});

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  unreadCount: number;
}

export function NotificationDropdown({
  isOpen,
  onClose,
  unreadCount,
}: NotificationDropdownProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { notifications } = useAppSelector((state) => state.notifications);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onCloseRef.current();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = useCallback(async (notification: NotificationData) => {
    if (!notification.read) {
      try {
        dispatch(markNotificationAsRead(notification.id));
        await apiWithAuth.markNotificationAsRead(notification.id);
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
      }
    }
    if (notification.type === "consultation") {
      router.push("/admin/consultations");
    } else if (notification.type === "order") {
      router.push("/admin/orders");
    }
    onClose();
  }, [dispatch, router, onClose]);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      dispatch(markAllAsRead());
      await apiWithAuth.markAllNotificationsAsRead();
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  }, [dispatch]);



  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-120 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50 max-h-96 overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Bell className="size-5 text-white" />
          <h3 className="text-lg font-semibold text-white">Thông báo</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-1 text-xs bg-gray-600 text-white rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="text-xs text-white hover:text-gray-300 flex items-center gap-1 cursor-pointer"
            >
              <CheckCircle2 className="size-3" />
              Đánh dấu tất cả đã đọc
            </button>
          )}
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300 cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="size-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Chưa có thông báo nào</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={handleNotificationClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-700 flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              router.push("/admin/notifications");
              onClose();
            }}
            className="w-full text-center text-sm text-white hover:text-gray-300 transition-colors"
          >
            Xem tất cả thông báo
          </button>
        </div>
      )}
    </div>
  );
}
