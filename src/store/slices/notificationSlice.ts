import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  NotificationData,
  NotificationState,
  NotificationPayload,
} from "@/types/notification.types";

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isConnected: false,
  isConnecting: false,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    // Socket connection status
    setConnecting: (state, action: PayloadAction<boolean>) => {
      state.isConnecting = action.payload;
    },
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
      if (!action.payload) {
        state.isConnecting = false;
      }
    },

    // Add new notification
    addNotification: (state, action: PayloadAction<NotificationPayload>) => {
      const notification: NotificationData = {
        ...action.payload,
        read: false,
      };

      // Add to beginning of array (newest first)
      state.notifications.unshift(notification);

      // Keep only last 50 notifications
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50);
      }

      // Update unread count
      state.unreadCount = state.notifications.filter((n) => !n.read).length;
    },

    // Update unread count from server
    updateUnreadCount: (state, action: PayloadAction<number>) => {
      console.log("⚡ Redux updateUnreadCount called with:", action.payload);
      console.log("📊 Previous unreadCount:", state.unreadCount);
      state.unreadCount = action.payload;
      console.log("📊 New unreadCount:", state.unreadCount);
    },

    // Mark notification as read
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload
      );
      if (notification && notification.read !== true) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    // Mark all notifications as read
    markAllAsRead: (state) => {
      state.notifications.forEach((n) => (n.read = true));
      state.unreadCount = 0;
    },

    // Clear all notifications
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },

    // Remove specific notification
    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(
        (n) => n.id === action.payload
      );
      if (index !== -1) {
        const wasUnread = state.notifications[index].read !== true;
        state.notifications.splice(index, 1);
        if (wasUnread) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      }
    },

    // Set notifications (for initial load)
    setNotifications: (state, action: PayloadAction<NotificationData[]>) => {
      console.log(
        "🔄 Redux setNotifications called with:",
        action.payload.length,
        "notifications"
      );
      // Kiểm tra kỹ hơn: read === false hoặc read === undefined đều là unread
      const unreadCount = action.payload.filter((n) => n.read !== true).length;
      console.log("🔥 Redux calculating unreadCount:", unreadCount);
      console.log(
        "📊 Notification read statuses:",
        action.payload.map((n) => ({ id: n.id, read: n.read }))
      );

      state.notifications = action.payload;
      state.unreadCount = unreadCount;

      console.log(
        "✅ Redux state updated - notifications:",
        state.notifications.length,
        "unreadCount:",
        state.unreadCount
      );
    },
  },
});

export const {
  setConnecting,
  setConnected,
  addNotification,
  updateUnreadCount,
  markNotificationAsRead,
  markAllAsRead,
  clearNotifications,
  removeNotification,
  setNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
