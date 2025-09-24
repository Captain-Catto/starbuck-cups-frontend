import { store } from "@/store";
import { apiService } from "./api";

/**
 * API service wrapper that gets auth token from Redux store
 * instead of localStorage
 */
class ApiWithAuth {
  private getTokenFromStore(): string | null {
    const state = store.getState();
    return state.auth.token;
  }

  // Notifications
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    type?: string;
  }) {
    const token = this.getTokenFromStore();
    if (!token) {
      throw new Error("No auth token available");
    }

    // Temporarily set token in the original service
    const originalToken = localStorage.getItem("admin_token");
    localStorage.setItem("admin_token", token);

    try {
      const result = await apiService.getNotifications(params);
      return result;
    } finally {
      // Restore original token or remove if none existed
      if (originalToken) {
        localStorage.setItem("admin_token", originalToken);
      } else {
        localStorage.removeItem("admin_token");
      }
    }
  }

  async markNotificationAsRead(notificationId: string) {
    const token = this.getTokenFromStore();
    if (!token) {
      throw new Error("No auth token available");
    }

    const originalToken = localStorage.getItem("admin_token");
    localStorage.setItem("admin_token", token);

    try {
      const result = await apiService.markNotificationAsRead(notificationId);
      return result;
    } finally {
      if (originalToken) {
        localStorage.setItem("admin_token", originalToken);
      } else {
        localStorage.removeItem("admin_token");
      }
    }
  }

  async getUnreadCount() {
    const token = this.getTokenFromStore();
    if (!token) {
      throw new Error("No auth token available");
    }

    const originalToken = localStorage.getItem("admin_token");
    localStorage.setItem("admin_token", token);

    try {
      const result = await apiService.getUnreadCount();
      return result;
    } finally {
      if (originalToken) {
        localStorage.setItem("admin_token", originalToken);
      } else {
        localStorage.removeItem("admin_token");
      }
    }
  }

  async markAllNotificationsAsRead() {
    const token = this.getTokenFromStore();
    if (!token) {
      throw new Error("No auth token available");
    }

    const originalToken = localStorage.getItem("admin_token");
    localStorage.setItem("admin_token", token);

    try {
      // Directly call backend API since it's not in the main apiService yet
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"
        }/admin/notifications/mark-all-read`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } finally {
      if (originalToken) {
        localStorage.setItem("admin_token", originalToken);
      } else {
        localStorage.removeItem("admin_token");
      }
    }
  }
}

export const apiWithAuth = new ApiWithAuth();
