const API_BASE_URL = "/api";

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
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();
    return result.data || result;
  }

  async getDashboardStats(token?: string): Promise<DashboardStats> {
    return this.request<DashboardStats>("/admin/dashboard/stats", token);
  }

  async getPendingConsultationsCount(
    token?: string
  ): Promise<{ count: number }> {
    return this.request<{ count: number }>(
      "/admin/consultations/pending/count",
      token
    );
  }

  async getRecentOrders(limit = 10, token?: string): Promise<RecentOrder[]> {
    return this.request<RecentOrder[]>(
      `/admin/orders/recent?limit=${limit}`,
      token
    );
  }

  async getRevenueData(token?: string): Promise<RevenueData> {
    return this.request<RevenueData>("/admin/dashboard/revenue", token);
  }
}

export const dashboardAPI = new DashboardAPI();

