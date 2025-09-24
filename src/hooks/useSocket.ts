import { useEffect, useCallback, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { socketManager } from "@/lib/socket";
import {
  setConnecting,
  setConnected,
  addNotification,
  updateUnreadCount,
  markNotificationAsRead,
  setNotifications,
} from "@/store/slices/notificationSlice";
import { toast } from "sonner";
import { NotificationPayload } from "@/types/notification.types";
import { apiWithAuth } from "@/lib/apiWithAuth";

export const useSocket = () => {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);
  const { isConnected, isConnecting, unreadCount } = useAppSelector(
    (state) => state.notifications
  );

  const hasInitialized = useRef(false);
  const hasLoadedNotifications = useRef(false);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  const loadInitialNotifications = useCallback(async () => {
    if (hasLoadedNotifications.current) {
      console.log("⏭️ Notifications already loaded, skipping...");
      return;
    }

    try {
      console.log("🔄 Loading initial notifications...");
      hasLoadedNotifications.current = true;
      const response = await apiWithAuth.getNotifications({ limit: 20 });
      if (response.success && response.data) {
        console.log("✅ Loaded notifications:", response.data.length);
        dispatch(setNotifications(response.data));
      }
    } catch (error) {
      console.error("❌ Failed to load initial notifications:", error);
      hasLoadedNotifications.current = false;
    }
  }, [dispatch]);

  const connect = useCallback(async () => {
    if (!token || isConnected || isConnecting) {
      return;
    }

    try {
      dispatch(setConnecting(true));
      await loadInitialNotifications();

      const socket = await socketManager.connect(token);
      dispatch(setConnected(true));

      console.log("🏠 Joining admin room...");
      socketManager.joinAdminRoom();

      socket.on("admin:joined", () => {
        console.log("✅ Successfully joined admin room!");
      });

      socket.on("error", (error: string) => {
        console.error("❌ Socket error:", error);
        toast.error("Lỗi quyền", {
          description: "Không có quyền nhận thông báo admin",
          duration: 4000,
        });
      });

      // Listen for unified notification event
      socket.on("notification:new", (notification: NotificationPayload) => {
        console.log("📡 Socket event: notification:new", notification);
        dispatch(addNotification(notification));

        // Show unified toast notification - all with default theme (white/black)
        if (notification.type === "consultation") {
          toast("Tư vấn mới", {
            description: `${notification.data?.customerName} đã gửi yêu cầu tư vấn`,
            duration: 6000,
            action: {
              label: "Xem chi tiết",
              onClick: () => {
                dispatch(markNotificationAsRead(notification.id));
                socketManager.markNotificationAsRead(notification.id);
                window.location.href = "/admin/consultations";
              },
            },
          });
        } else if (notification.type === "order") {
          toast("Đơn hàng mới", {
            description: `${notification.data?.customerName} đã tạo đơn hàng mới`,
            duration: 5000,
            action: {
              label: "Xem chi tiết",
              onClick: () => {
                dispatch(markNotificationAsRead(notification.id));
                socketManager.markNotificationAsRead(notification.id);
                window.location.href = "/admin/orders";
              },
            },
          });
        } else if (notification.type === "user") {
          toast("Người dùng", {
            description: `${notification.data?.userName} đã ${
              notification.data?.action === "registered"
                ? "đăng ký"
                : "cập nhật thông tin"
            }`,
            duration: 4000,
            action: {
              label: "Xem",
              onClick: () => {
                dispatch(markNotificationAsRead(notification.id));
                socketManager.markNotificationAsRead(notification.id);
                window.location.href = "/admin/users";
              },
            },
          });
        } else if (notification.type === "payment") {
          const isSuccess = notification.data?.status === "success";
          toast(`Thanh toán ${isSuccess ? "thành công" : "thất bại"}`, {
            description: `Đơn hàng ${notification.data?.orderId} - ${notification.data?.customerName}`,
            duration: 5000,
            action: {
              label: "Xem chi tiết",
              onClick: () => {
                dispatch(markNotificationAsRead(notification.id));
                socketManager.markNotificationAsRead(notification.id);
                window.location.href = "/admin/orders";
              },
            },
          });
        } else if (notification.type === "inventory") {
          toast("Kho hàng", {
            description: notification.message,
            duration: 6000,
            action: {
              label: "Xem kho",
              onClick: () => {
                dispatch(markNotificationAsRead(notification.id));
                socketManager.markNotificationAsRead(notification.id);
                window.location.href = "/admin/inventory";
              },
            },
          });
        } else if (notification.type === "system") {
          toast("Hệ thống", {
            description: notification.message,
            duration: notification.data?.level === "error" ? 8000 : 4000,
            action: {
              label: "Chi tiết",
              onClick: () => {
                dispatch(markNotificationAsRead(notification.id));
                socketManager.markNotificationAsRead(notification.id);
              },
            },
          });
        }
      });

      socket.on("notification:count_update", (count: number) => {
        console.log(
          "📡 Socket event: notification:count_update with count:",
          count
        );
        dispatch(updateUnreadCount(count));
      });

      // Debug: Log all socket events
      socket.onAny((eventName, ...args) => {
        console.log(`🔍 Socket event received: ${eventName}`, args);
      });

      console.log("✅ Socket connected and event listeners set up");

      socket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
        dispatch(setConnected(false));

        if (reason === "io server disconnect") {
          return;
        }

        reconnectTimeout.current = setTimeout(() => {
          if (token && !socketManager.isConnected()) {
            connect();
          }
        }, 3000);
      });

      socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        dispatch(setConnected(false));
        dispatch(setConnecting(false));

        toast.error("Lỗi kết nối", {
          description: "Không thể kết nối đến server thông báo",
          duration: 3000,
        });
      });
    } catch (error) {
      console.error("Failed to connect socket:", error);
      dispatch(setConnected(false));
      dispatch(setConnecting(false));

      toast.error("Lỗi kết nối", {
        description: "Không thể thiết lập kết nối thông báo real-time",
        duration: 4000,
      });
    }
  }, [token, isConnected, isConnecting, dispatch, loadInitialNotifications]);

  const disconnect = useCallback(() => {
    console.log("🔌 Disconnecting socket...");
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }

    socketManager.leaveAdminRoom();
    socketManager.disconnect();
    dispatch(setConnected(false));
    dispatch(setConnecting(false));
    hasInitialized.current = false;
  }, [dispatch]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        dispatch(markNotificationAsRead(notificationId));
        await apiWithAuth.markNotificationAsRead(notificationId);

        if (socketManager.isConnected()) {
          socketManager.markNotificationAsRead(notificationId);
        }
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    },
    [dispatch]
  );

  // Initialize socket connection when component mounts and token is available
  useEffect(() => {
    if (token && !hasInitialized.current) {
      hasInitialized.current = true;
      connect();
    }

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, [token, connect]);

  // Cleanup on token change (logout)
  useEffect(() => {
    if (!token && hasInitialized.current) {
      console.log("🔓 Token removed, disconnecting socket...");
      disconnect();
      hasLoadedNotifications.current = false;
    }
  }, [token, disconnect]);

  console.log("🎯 useSocket returning unreadCount:", unreadCount);

  return {
    isConnected,
    isConnecting,
    unreadCount,
    connect,
    disconnect,
    markAsRead,
    loadInitialNotifications,
  };
};
