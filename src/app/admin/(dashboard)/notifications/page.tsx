"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/hooks/admin/useNotifications";
import { NotificationHeader } from "@/components/admin/notifications/NotificationHeader";
import { NotificationStats } from "@/components/admin/notifications/NotificationStats";
import { NotificationFilters } from "@/components/admin/notifications/NotificationFilters";
import { NotificationList } from "@/components/admin/notifications/NotificationList";
import type { OrderData } from "@/types/notification.types";

export default function NotificationsPage() {
  const router = useRouter();
  const {
    notifications,
    filteredNotifications,
    unreadCount,
    loading,
    filters,
    handleNotificationClick,
    handleMarkAllAsRead,
    handleClearAll,
    handleSearchChange,
    handleFilterChange,
  } = useNotifications();

  // Tính toán thống kê
  const totalCount = notifications.length;
  const readCount = totalCount - unreadCount;

  // Chuyển đổi NotificationData thành format phù hợp với components
  const convertedNotifications = filteredNotifications.map((notification) => {
    let orderId = undefined;
    if (notification.type === "order" && notification.data) {
      const orderData = notification.data as OrderData;
      orderId = orderData.orderId;
    }

    return {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: (notification.type === "consultation"
        ? "message"
        : notification.type) as "order" | "system" | "message" | "warning",
      read: notification.read || false,
      createdAt: notification.timestamp,
      orderId: orderId,
    };
  });

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8 ">
        <NotificationHeader
          onBack={handleBack}
          onMarkAllAsRead={handleMarkAllAsRead}
          onClearAll={handleClearAll}
          hasUnread={unreadCount > 0}
        />

        <NotificationStats
          totalCount={totalCount}
          unreadCount={unreadCount}
          readCount={readCount}
          loading={loading}
        />

        <NotificationFilters
          searchQuery={filters.searchQuery}
          onSearchChange={handleSearchChange}
          selectedFilter={filters.filter}
          onFilterChange={handleFilterChange}
          loading={loading}
        />

        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden p-6">
          <NotificationList
            notifications={convertedNotifications}
            onNotificationClick={(notification) => {
              // Chuyển đổi về format NotificationData
              const originalNotification = filteredNotifications.find(
                (n) => n.id === notification.id
              );
              if (originalNotification) {
                handleNotificationClick(originalNotification);
              }
            }}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
