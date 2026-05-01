import { store } from "@/store";
import { getApiUrl } from "@/lib/api-config";
import type { ApiResponse } from "@/types";
import type { NotificationData } from "@/types/notification.types";

class ApiWithAuth {
  private getToken(): string | null {
    return store.getState().auth.token;
  }

  private authHeaders(): HeadersInit {
    const token = this.getToken();
    if (!token) throw new Error("No auth token available");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  async getNotifications(params?: {
    page?: number;
    limit?: number;
    type?: string;
  }): Promise<ApiResponse<NotificationData[]>> {
    const url = new URL(getApiUrl("admin/notifications"));
    if (params?.page) url.searchParams.set("page", String(params.page));
    if (params?.limit) url.searchParams.set("limit", String(params.limit));
    if (params?.type) url.searchParams.set("type", params.type);

    const response = await fetch(url.toString(), { headers: this.authHeaders() });
    return response.json();
  }

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse<NotificationData>> {
    const response = await fetch(
      getApiUrl(`admin/notifications/${notificationId}/read`),
      { method: "PUT", headers: this.authHeaders() }
    );
    return response.json();
  }

  async getUnreadCount(): Promise<ApiResponse<{ unreadCount: number }>> {
    const response = await fetch(
      getApiUrl("admin/notifications/unread/count"),
      { headers: this.authHeaders() }
    );
    return response.json();
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse<unknown>> {
    const response = await fetch(
      getApiUrl("admin/notifications/mark-all-read"),
      { method: "PUT", headers: this.authHeaders() }
    );
    return response.json();
  }
}

export const apiWithAuth = new ApiWithAuth();
