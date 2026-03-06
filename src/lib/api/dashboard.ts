import { getApiUrl } from "@/lib/api-config";

const API_BASE_URL = getApiUrl("");

export interface DashboardStats {
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  pendingConsultations: number;
}

export interface RecentOrder {
  id: string;
  customerName: string;
  productName?: string;
  orderType: "product" | "custom";
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  totalAmount: number;
  createdAt: string;
}

export interface RevenueData {
  totalRevenue: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  growth: number;
}

class DashboardAPI {
  private async request<T>(
    endpoint: string,
    token?: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();
    // Extract data from API response wrapper
    return result.data || result;
  }

  // Get dashboard statistics
  async getDashboardStats(token?: string): Promise<DashboardStats> {
    return this.request<DashboardStats>("/admin/dashboard/stats", token);
  }

  // Get pending consultations count
  async getPendingConsultationsCount(
    token?: string
  ): Promise<{ count: number }> {
    return this.request<{ count: number }>(
      "/admin/consultations/pending/count",
      token
    );
  }

  // Get recent orders
  async getRecentOrders(
    limit: number = 10,
    token?: string
  ): Promise<RecentOrder[]> {
    return this.request<RecentOrder[]>(
      `/admin/orders/recent?limit=${limit}`,
      token
    );
  }

  // Get revenue data
  async getRevenueData(token?: string): Promise<RevenueData> {
    return this.request<RevenueData>("/admin/dashboard/revenue", token);
  }
}

export const dashboardAPI = new DashboardAPI();
