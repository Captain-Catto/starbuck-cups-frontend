"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store";
import {
  markNotificationAsRead,
  markAllAsRead,
} from "@/store/slices/notificationSlice";
import { apiWithAuth } from "@/lib/apiWithAuth";
import type { ConsultationData, OrderData } from "@/types/notification.types";
import { Bell, X, Clock, CheckCircle2, Eye } from "lucide-react";
import type { NotificationData } from "@/types/notification.types";

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleNotificationClick = async (notification: NotificationData) => {
    // Mark as read
    if (!notification.read) {
      try {
        // Update local state immediately for UI responsiveness
        dispatch(markNotificationAsRead(notification.id));
        // Update server
        await apiWithAuth.markNotificationAsRead(notification.id);
      } catch (error) {

      }
    }

    // Navigate based on notification type
    if (notification.type === "consultation") {
      router.push("/admin/consultations");
    } else if (notification.type === "order") {
      router.push("/admin/orders");
    }

    // Close dropdown
    onClose();
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Update local state immediately for UI responsiveness
      dispatch(markAllAsRead());
      // Update server
      await apiWithAuth.markAllNotificationsAsRead();

    } catch (error) {

    }
  };

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

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-120 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50 max-h-96 overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-white" />
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
              onClick={handleMarkAllAsRead}
              className="text-xs text-white hover:text-gray-300 flex items-center gap-1"
            >
              <CheckCircle2 className="w-3 h-3" />
              Đánh dấu tất cả đã đọc
            </button>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Chưa có thông báo nào</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 cursor-pointer hover:bg-gray-700 transition-colors ${
                  !notification.read ? "bg-gray-700/50" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4
                          className={`text-sm font-medium ${
                            !notification.read ? "text-white" : "text-gray-300"
                          }`}
                        >
                          {notification.title}
                        </h4>
                        <p
                          className={`text-sm mt-1 ${
                            !notification.read
                              ? "text-gray-300"
                              : "text-gray-400"
                          }`}
                        >
                          {notification.message}
                        </p>
                      </div>

                      {/* Unread indicator */}
                      {!notification.read && (
                        <div className="w-2 h-2 bg-white rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>

                    {/* Timestamp and action */}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(notification.timestamp)}
                      </span>

                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Eye className="w-3 h-3" />
                        <span>Xem chi tiết</span>
                      </div>
                    </div>

                    {/* Additional data if available */}
                    {notification.data && (
                      <div className="mt-2 text-xs text-gray-500">
                        {notification.type === "consultation" &&
                          (() => {
                            const consultationData =
                              notification.data as ConsultationData;
                            return (
                              consultationData.customerName && (
                                <span>
                                  Khách hàng: {consultationData.customerName}
                                </span>
                              )
                            );
                          })()}
                        {notification.type === "order" &&
                          (() => {
                            const orderData = notification.data as OrderData;
                            return (
                              orderData.orderId && (
                                <span>Đơn hàng: #{orderData.orderId}</span>
                              )
                            );
                          })()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-700 flex-shrink-0">
          <button
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
