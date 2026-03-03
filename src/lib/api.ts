import axios from "axios";
import type { AxiosInstance, AxiosResponse } from "axios";
import type {
  ApiResponse,
  Product,
  Category,
  Color,
  Capacity,
  Order,
  Consultation,
  ProductFilters,
} from "@/types";
import type { NotificationData } from "@/types/notification.types";
import { TokenRefreshNotification } from "@/utils/tokenNotification";

class ApiService {
  private api: AxiosInstance;
  private isRefreshing = false;
  private refreshPromise: Promise<{
    success: boolean;
    accessToken?: string;
  }> | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true, // Để gửi cookies với mọi request
    });

    // Request interceptor để add auth token
    this.api.interceptors.request.use(
      (config) => {
        // Check if we're running on client side
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("admin_token");
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }

          // Debug log for cookie tracking
          if (config.url?.includes('auth') || config.url?.includes('refresh')) {

          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor để handle errors và auto-refresh token
    this.api.interceptors.response.use(
      async (response: AxiosResponse<ApiResponse>) => {
        // Check if server indicates token refresh is needed
        if (
          response.headers["x-token-refresh-needed"] === "true" &&
          typeof window !== "undefined" &&
          !this.isRefreshing
        ) {

          try {
            this.isRefreshing = true;
            this.refreshPromise = this.performTokenRefresh();
            const result = await this.refreshPromise;
            if (result.success) {
              TokenRefreshNotification.showRefreshSuccess(); // Silent refresh
            }
          } catch (error) {

          } finally {
            this.isRefreshing = false;
            this.refreshPromise = null;
          }
        }
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Nếu lỗi 401 và chưa retry, thử refresh token
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          typeof window !== "undefined"
        ) {
          originalRequest._retry = true;

          try {
            // Nếu đang refresh, chờ kết quả
            if (this.isRefreshing) {
              await this.refreshPromise;
              const newToken = localStorage.getItem("admin_token");
              if (newToken) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return this.api(originalRequest);
              }
            } else {
              // Bắt đầu quá trình refresh
              this.isRefreshing = true;
              this.refreshPromise = this.performTokenRefresh();

              const result = await this.refreshPromise;
              if (result.success) {
                TokenRefreshNotification.showRefreshSuccess(); // Silent refresh
                // Token refresh thành công, retry request gốc
                originalRequest.headers.Authorization = `Bearer ${result.accessToken}`;
                return this.api(originalRequest);
              }
            }
          } catch (refreshError) {

            TokenRefreshNotification.showRefreshErrorWithRedirect(
              "/admin/login"
            );
            // Refresh thất bại, clear token và redirect sẽ được handle bởi notification
            localStorage.removeItem("admin_token");
            // Refresh token sẽ expire tự động hoặc được clear bởi server
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
            this.refreshPromise = null;
          }
        }

        // Nếu không phải lỗi 401 hoặc đã retry thất bại
        if (error.response?.status === 401 && typeof window !== "undefined") {
          localStorage.removeItem("admin_token");
          // Refresh token sẽ expire tự động hoặc được clear bởi server
          TokenRefreshNotification.showSessionExpiredWithRedirect(
            "/admin/login"
          );
        }

        return Promise.reject(error);
      }
    );
  }

  // Hàm thực hiện refresh token
  private async performTokenRefresh(): Promise<{
    success: boolean;
    accessToken?: string;
  }> {
    try {
      // Check if refresh token cookie exists before making request
      const refreshTokenCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("admin_refresh_token="));

      if (!refreshTokenCookie) {

        throw new Error("No refresh token available");
      }

      // Backend có thể lấy refresh token từ cookie hoặc body
      // Gửi empty body để dựa vào cookie
      const response = await axios.post(
        `${this.api.defaults.baseURL}/auth/admin/refresh`,
        {}, // Empty body - backend sẽ lấy từ cookie
        {
          headers: { "Content-Type": "application/json" },
          timeout: 10000,
          withCredentials: true, // Để gửi cookies
        }
      );

      if (response.data.success && response.data.data) {
        const { accessToken } = response.data.data;

        // Chỉ lưu access token, refresh token đã trong cookie
        localStorage.setItem("admin_token", accessToken);

        return { success: true, accessToken };
      } else {
        throw new Error("Invalid refresh response");
      }
    } catch (error: unknown) {
      const axiosError = error as { response?: { status: number; statusText?: string; data?: unknown }; message?: string };

      throw error;
    }
  }

  // Public methods for SSR/SSG
  async getPublicProducts(
    params?: ProductFilters
  ): Promise<ApiResponse<{ items: Product[]; total: number }>> {
    const response = await this.api.get("/public/products", { params });
    return response.data;
  }

  async getPublicProduct(slug: string): Promise<ApiResponse<Product>> {
    const response = await this.api.get(`/public/products/${slug}`);
    return response.data;
  }

  async getPublicCategories(): Promise<ApiResponse<Category[]>> {
    const response = await this.api.get("/public/categories");
    return response.data;
  }

  async getPublicColors(): Promise<ApiResponse<Color[]>> {
    const response = await this.api.get("/public/colors");
    return response.data;
  }

  async getPublicCapacities(): Promise<ApiResponse<Capacity[]>> {
    const response = await this.api.get("/public/capacities");
    return response.data;
  }

  // Products
  async getProducts(params?: {
    page?: number;
    limit?: number;
    categoryId?: string;
    colorId?: string;
    capacityId?: string;
    search?: string;
  }): Promise<ApiResponse<Product[]>> {
    const response = await this.api.get("/products", { params });
    return response.data;
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    const response = await this.api.get(`/products/${id}`);
    return response.data;
  }

  async createProduct(data: FormData): Promise<ApiResponse<Product>> {
    const response = await this.api.post("/products", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  }

  async updateProduct(
    id: string,
    data: FormData
  ): Promise<ApiResponse<Product>> {
    const response = await this.api.put(`/products/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  }

  async deleteProduct(id: string): Promise<ApiResponse<null>> {
    const response = await this.api.delete(`/products/${id}`);
    return response.data;
  }

  // Categories
  async getCategories(params?: {
    includeInactive?: boolean;
  }): Promise<ApiResponse<Category[]>> {
    const response = await this.api.get("/categories", { params });
    return response.data;
  }

  async getCategory(id: string): Promise<ApiResponse<Category>> {
    const response = await this.api.get(`/categories/${id}`);
    return response.data;
  }

  async getCategoryTree(params?: {
    includeInactive?: boolean;
  }): Promise<ApiResponse<Category[]>> {
    const response = await this.api.get("/categories/tree", { params });
    return response.data;
  }

  async createCategory(data: {
    name: string;
    description?: string;
    parentId?: string;
    isActive: boolean;
  }): Promise<ApiResponse<Category>> {
    const response = await this.api.post("/categories", data);
    return response.data;
  }

  async updateCategory(
    id: string,
    data: {
      name?: string;
      description?: string;
      parentId?: string;
      isActive?: boolean;
    }
  ): Promise<ApiResponse<Category>> {
    const response = await this.api.put(`/categories/${id}`, data);
    return response.data;
  }

  async deleteCategory(id: string): Promise<ApiResponse<null>> {
    const response = await this.api.delete(`/categories/${id}`);
    return response.data;
  }

  // Colors
  async getColors(params?: {
    includeInactive?: boolean;
  }): Promise<ApiResponse<Color[]>> {
    const response = await this.api.get("/colors", { params });
    return response.data;
  }

  async createColor(data: {
    name: string;
    hexCode: string;
    isActive: boolean;
  }): Promise<ApiResponse<Color>> {
    const response = await this.api.post("/colors", data);
    return response.data;
  }

  async updateColor(
    id: string,
    data: {
      name?: string;
      hexCode?: string;
      isActive?: boolean;
    }
  ): Promise<ApiResponse<Color>> {
    const response = await this.api.put(`/colors/${id}`, data);
    return response.data;
  }

  async deleteColor(id: string): Promise<ApiResponse<null>> {
    const response = await this.api.delete(`/colors/${id}`);
    return response.data;
  }

  // Capacities
  async getCapacities(params?: {
    includeInactive?: boolean;
  }): Promise<ApiResponse<Capacity[]>> {
    const response = await this.api.get("/capacities", { params });
    return response.data;
  }

  async createCapacity(data: {
    name: string;
    volumeMl: number;
    isActive: boolean;
  }): Promise<ApiResponse<Capacity>> {
    const response = await this.api.post("/capacities", data);
    return response.data;
  }

  async updateCapacity(
    id: string,
    data: {
      name?: string;
      volumeMl?: number;
      isActive?: boolean;
    }
  ): Promise<ApiResponse<Capacity>> {
    const response = await this.api.put(`/capacities/${id}`, data);
    return response.data;
  }

  async deleteCapacity(id: string): Promise<ApiResponse<null>> {
    const response = await this.api.delete(`/capacities/${id}`);
    return response.data;
  }

  // Orders
  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    customerId?: string;
  }): Promise<ApiResponse<Order[]>> {
    const response = await this.api.get("/orders", { params });
    return response.data;
  }

  async getOrder(id: string): Promise<ApiResponse<Order>> {
    const response = await this.api.get(`/orders/${id}`);
    return response.data;
  }

  async updateOrderStatus(
    id: string,
    status: string
  ): Promise<ApiResponse<Order>> {
    const response = await this.api.patch(`/orders/${id}/status`, { status });
    return response.data;
  }

  // Consultations
  async getConsultations(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<Consultation[]>> {
    const response = await this.api.get("/consultations", { params });
    return response.data;
  }

  async getConsultation(id: string): Promise<ApiResponse<Consultation>> {
    const response = await this.api.get(`/consultations/${id}`);
    return response.data;
  }

  async updateConsultation(
    id: string,
    data: {
      adminResponse?: string;
      status?: string;
    }
  ): Promise<ApiResponse<Consultation>> {
    const response = await this.api.patch(`/consultations/${id}`, data);
    return response.data;
  }

  // Auth
  async login(
    email: string,
    password: string
  ): Promise<
    ApiResponse<{
      token: string;
      refreshToken: string;
      user: { id: string; email: string; name: string };
    }>
  > {
    const response = await this.api.post("/auth/login", { email, password });
    return response.data;
  }

  async adminLogin(
    email: string,
    password: string
  ): Promise<
    ApiResponse<{
      token: string;
      refreshToken: string;
      user: { id: string; email: string; name: string; role: string };
    }>
  > {
    const response = await this.api.post("/auth/admin/login", {
      email,
      password,
    });
    return response.data;
  }

  async verifyToken(): Promise<
    ApiResponse<{
      user: { id: string; email: string; name: string; role: string };
    }>
  > {
    const response = await this.api.get("/auth/admin/verify");
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<
    ApiResponse<{
      token: string;
      refreshToken: string;
    }>
  > {
    const response = await this.api.post("/auth/admin/refresh", {
      refreshToken,
    });
    return response.data;
  }

  async logout(): Promise<ApiResponse<null>> {
    const response = await this.api.post("/auth/admin/logout");
    return response.data;
  }

  async checkSession(): Promise<
    ApiResponse<{
      user: { id: string; email: string; name: string; role: string };
      token: string;
    }>
  > {

    const response = await this.api.get("/auth/admin/session");
    return response.data;
  }

  // Admin product management
  async toggleProductStatus(productId: string): Promise<ApiResponse<Product>> {
    const response = await this.api.patch(
      `/admin/products/${productId}/toggle-status`
    );
    return response.data;
  }

  async adminDeleteProduct(productId: string): Promise<ApiResponse<null>> {
    const response = await this.api.delete(`/admin/products/${productId}`);
    return response.data;
  }

  // Notifications
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    type?: string;
  }): Promise<ApiResponse<NotificationData[]>> {
    const response = await this.api.get("/admin/notifications", { params });
    return response.data;
  }

  async markNotificationAsRead(
    notificationId: string
  ): Promise<ApiResponse<NotificationData>> {
    const response = await this.api.put(
      `/admin/notifications/${notificationId}/read`
    );
    return response.data;
  }

  async getUnreadCount(): Promise<ApiResponse<{ unreadCount: number }>> {
    const response = await this.api.get("/admin/notifications/unread/count");
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<
    ApiResponse<{ status: string; timestamp: string }>
  > {
    const response = await this.api.get("/health");
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
