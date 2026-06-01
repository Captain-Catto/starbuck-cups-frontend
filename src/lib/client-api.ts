import type { ApiResponse, Product } from "@/types";
import type { NotificationData } from "@/types/notification.types";

const ADMIN_TOKEN_STORAGE_KEY = "admin_token";

type RefreshResult = {
  success: boolean;
  accessToken?: string;
};

function getStoredAdminToken(): string | null {
  if (typeof window === "undefined") return null;

  try {
    return localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function setStoredAdminToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
}

function clearStoredAdminToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
}

function getAuthHeaders(): Record<string, string> {
  const token = getStoredAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function jsonHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
  };
}

async function parseApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const data = await response.json().catch(() => ({
    success: false,
    message: response.statusText,
  }));

  if (!response.ok) {
    const error = new Error(
      data.message || data.error || `HTTP ${response.status}`
    ) as Error & {
      response?: { status: number; data: { message?: string; error?: string } };
    };
    error.response = { status: response.status, data };
    throw error;
  }

  return data;
}

class ClientApi {
  private isRefreshing = false;
  private refreshPromise: Promise<RefreshResult> | null = null;

  private async request<T>(
    path: string,
    init: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const response = await fetch(path, {
      ...init,
      headers: {
        ...jsonHeaders(),
        ...init.headers,
      },
    });

    if (
      response.status === 401 &&
      typeof window !== "undefined" &&
      !path.includes("/api/auth/admin/refresh")
    ) {
      const token = await this.doProactiveRefresh();
      if (token) {
        const retryResponse = await fetch(path, {
          ...init,
          headers: {
            ...jsonHeaders(),
            ...init.headers,
            Authorization: `Bearer ${token}`,
          },
        });
        return parseApiResponse<T>(retryResponse);
      }

      clearStoredAdminToken();
    }

    return parseApiResponse<T>(response);
  }

  private async performTokenRefresh(): Promise<RefreshResult> {
    const response = await fetch("/api/auth/admin/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const data = await parseApiResponse<{ token?: string; accessToken?: string }>(
      response
    );
    const token = data.data?.token || data.data?.accessToken;
    if (!token) {
      throw new Error("No token in refresh response");
    }

    setStoredAdminToken(token);
    return { success: true, accessToken: token };
  }

  public async doProactiveRefresh(): Promise<string | null> {
    if (this.isRefreshing && this.refreshPromise) {
      try {
        const result = await this.refreshPromise;
        return result.accessToken || null;
      } catch {
        return null;
      }
    }

    try {
      this.isRefreshing = true;
      this.refreshPromise = this.performTokenRefresh();
      const result = await this.refreshPromise;
      return result.accessToken || null;
    } catch {
      return null;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  async adminLogin(
    email: string,
    password: string
  ): Promise<
    ApiResponse<{
      token: string;
      refreshToken?: string;
      user: { id: string; email: string; name: string; role: string };
    }>
  > {
    return this.request("/api/auth/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async verifyToken(): Promise<
    ApiResponse<{
      user: { id: string; email: string; name: string; role: string };
    }>
  > {
    return this.request("/api/auth/admin/verify");
  }

  async refreshToken(): Promise<ApiResponse<{ token: string; refreshToken?: string }>> {
    return this.request("/api/auth/admin/refresh", {
      method: "POST",
      body: JSON.stringify({}),
    });
  }

  async checkSession(): Promise<
    ApiResponse<{
      user: { id: string; email: string; name: string; role: string };
      token: string;
    }>
  > {
    return this.request("/api/auth/admin/session");
  }

  async logout(): Promise<ApiResponse<null>> {
    const result = await this.request<null>("/api/auth/admin/logout", {
      method: "POST",
      body: JSON.stringify({}),
    });
    clearStoredAdminToken();
    return result;
  }

  async toggleProductStatus(productId: string): Promise<ApiResponse<Product>> {
    return this.request(`/api/admin/products/${productId}/toggle-status`, {
      method: "PATCH",
      body: JSON.stringify({}),
    });
  }

  async adminDeleteProduct(productId: string): Promise<ApiResponse<null>> {
    return this.request(`/api/admin/products/${productId}`, {
      method: "DELETE",
    });
  }

  async getNotifications(params?: {
    page?: number;
    limit?: number;
    type?: string;
  }): Promise<ApiResponse<NotificationData[]>> {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.type) query.set("type", params.type);

    const search = query.toString();
    return this.request(`/api/admin/notifications${search ? `?${search}` : ""}`);
  }

  async markNotificationAsRead(
    notificationId: string
  ): Promise<ApiResponse<NotificationData>> {
    return this.request(`/api/admin/notifications/${notificationId}/read`, {
      method: "PUT",
      body: JSON.stringify({}),
    });
  }

  async getUnreadCount(): Promise<ApiResponse<{ unreadCount: number }>> {
    return this.request("/api/admin/notifications/unread/count");
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse<unknown>> {
    return this.request("/api/admin/notifications/mark-all-read", {
      method: "PUT",
      body: JSON.stringify({}),
    });
  }
}

export const clientApi = new ClientApi();
