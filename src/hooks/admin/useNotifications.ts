"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store";
import { toast } from "sonner";
import {
  markNotificationAsRead,
  markAllAsRead,
  clearNotifications,
  setNotifications,
} from "@/store/slices/notificationSlice";
import { apiWithAuth } from "@/lib/apiWithAuth";
import type { NotificationData } from "@/types/notification.types";
import {
  isConsultationData,
  isOrderData,
} from "@/types/notification.types";

interface NotificationFilters {
  filter: string; // "all" | "consultation" | "order" | "unread"
  searchQuery: string;
}

export interface UseNotificationsReturn {
  // Data
  notifications: NotificationData[];
  filteredNotifications: NotificationData[];
  unreadCount: number;

  // State
  loading: boolean;
  filters: NotificationFilters;

  // Actions
  handleFilterChange: (filter: string) => void;
  handleSearchChange: (query: string) => void;
  handleNotificationClick: (notification: NotificationData) => void;
  handleMarkAllAsRead: () => Promise<void>;
  handleClearAll: () => Promise<void>;
  loadNotifications: () => Promise<void>;

  // Helpers
  formatTimestamp: (timestamp: string) => string;
}

export function useNotifications(): UseNotificationsReturn {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { notifications, unreadCount } = useAppSelector(
    (state) => state.notifications
  );

  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<NotificationFilters>({
    filter: "all",
    searchQuery: "",
  });

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiWithAuth.getNotifications({ limit: 100 });
      if (response.success && response.data) {
        dispatch(setNotifications(response.data));
      }
    } catch {
      toast.error("Không thể tải thông báo");
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Filter notifications based on current filters
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Apply type filter
    if (filters.filter === "unread") {
      // Kiểm tra read !== true để bao gồm cả undefined và false
      filtered = filtered.filter((n) => n.read !== true);
    } else if (filters.filter === "consultation") {
      filtered = filtered.filter((n) => n.type === "consultation");
    } else if (filters.filter === "order") {
      filtered = filtered.filter((n) => n.type === "order");
    }

    // Apply search filter
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.message.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [notifications, filters]);

  const handleFilterChange = useCallback((filter: string) => {
    setFilters((prev) => ({ ...prev, filter }));
  }, []);

  const handleSearchChange = useCallback((searchQuery: string) => {
    setFilters((prev) => ({ ...prev, searchQuery }));
  }, []);

  const handleNotificationClick = useCallback(async (notification: NotificationData) => {
    try {
      if (notification.read !== true) {
        await apiWithAuth.markNotificationAsRead(notification.id);
        dispatch(markNotificationAsRead(notification.id));
      }

      if (notification.type === "consultation") {
        if (isConsultationData(notification.data) && notification.data.consultationId) {
          router.push(`/admin/consultations`);
        }
      } else if (notification.type === "order") {
        if (isOrderData(notification.data) && notification.data.orderId) {
          router.push(`/admin/orders/${notification.data.orderId}`);
        }
      }
    } catch {
      toast.error("Không thể xử lý thông báo");
    }
  }, [dispatch, router]);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await apiWithAuth.markAllNotificationsAsRead();
      dispatch(markAllAsRead());
    } catch {
      toast.error("Không thể đánh dấu đã đọc");
    }
  }, [dispatch]);

  const handleClearAll = useCallback(async () => {
    try {
      dispatch(clearNotifications());
    } catch {
      toast.error("Không thể xóa thông báo");
    }
  }, [dispatch]);

  const formatTimestamp = (timestamp: string): string => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInSeconds = Math.floor(
      (now.getTime() - notificationTime.getTime()) / 1000
    );

    if (diffInSeconds < 60) {
      return "Vừa xong";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} phút trước`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} giờ trước`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ngày trước`;
    }
  };

  return {
    // Data
    notifications,
    filteredNotifications,
    unreadCount,

    // State
    loading,
    filters,

    // Actions
    handleFilterChange,
    handleSearchChange,
    handleNotificationClick,
    handleMarkAllAsRead,
    handleClearAll,
    loadNotifications,

    // Helpers
    formatTimestamp,
  };
}
