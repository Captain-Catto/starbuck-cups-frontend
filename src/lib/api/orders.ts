import { Order, CreateOrderData, UpdateOrderStatusData, OrdersFilter } from '@/store/slices/ordersSlice';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

class OrdersAPI {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Get auth token from localStorage or auth slice
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getOrders(params: {
    page?: number;
    limit?: number;
    filters?: OrdersFilter;
  } = {}): Promise<{
    orders: Order[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      pageSize: number;
    };
    stats: {
      total: number;
      pending: number;
      confirmed: number;
      processing: number;
      shipped: number;
      delivered: number;
      cancelled: number;
    };
  }> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    
    // Add filters
    if (params.filters) {
      if (params.filters.search) searchParams.append('search', params.filters.search);
      if (params.filters.status) searchParams.append('status', params.filters.status);
      if (params.filters.orderType) searchParams.append('orderType', params.filters.orderType);
      if (params.filters.customerId) searchParams.append('customerId', params.filters.customerId);
      if (params.filters.freeShipping !== undefined) {
        searchParams.append('freeShipping', params.filters.freeShipping.toString());
      }
      if (params.filters.dateRange) {
        searchParams.append('dateFrom', params.filters.dateRange.from);
        searchParams.append('dateTo', params.filters.dateRange.to);
      }
      if (params.filters.amountRange) {
        searchParams.append('amountMin', params.filters.amountRange.min.toString());
        searchParams.append('amountMax', params.filters.amountRange.max.toString());
      }
    }

    return this.request<{
      orders: Order[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalCount: number;
        pageSize: number;
      };
      stats: {
        total: number;
        pending: number;
        confirmed: number;
        processing: number;
        shipped: number;
        delivered: number;
        cancelled: number;
      };
    }>(`/admin/orders?${searchParams.toString()}`);
  }

  async getOrderById(id: string): Promise<Order> {
    return this.request<Order>(`/admin/orders/${id}`);
  }

  async createOrder(data: CreateOrderData): Promise<Order> {
    return this.request<Order>('/admin/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOrder(id: string, data: Partial<CreateOrderData>): Promise<Order> {
    return this.request<Order>(`/admin/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateOrderStatus(data: UpdateOrderStatusData): Promise<{
    orderId: string;
    status: Order['status'];
    statusHistory: {
      status: string;
      timestamp: string;
      note?: string;
      updatedBy?: string;
    };
  }> {
    return this.request<{
      orderId: string;
      status: Order['status'];
      statusHistory: {
        status: string;
        timestamp: string;
        note?: string;
        updatedBy?: string;
      };
    }>(`/admin/orders/${data.orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: data.status,
        note: data.note,
      }),
    });
  }

  async deleteOrder(id: string): Promise<void> {
    return this.request<void>(`/admin/orders/${id}`, {
      method: 'DELETE',
    });
  }

  async cancelOrder(id: string, reason?: string): Promise<Order> {
    return this.request<Order>(`/admin/orders/${id}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  }

  async confirmOrder(id: string, note?: string): Promise<Order> {
    return this.request<Order>(`/admin/orders/${id}/confirm`, {
      method: 'PATCH',
      body: JSON.stringify({ note }),
    });
  }

  async processOrder(id: string, note?: string): Promise<Order> {
    return this.request<Order>(`/admin/orders/${id}/process`, {
      method: 'PATCH',
      body: JSON.stringify({ note }),
    });
  }

  async shipOrder(id: string, trackingNumber?: string, note?: string): Promise<Order> {
    return this.request<Order>(`/admin/orders/${id}/ship`, {
      method: 'PATCH',
      body: JSON.stringify({ trackingNumber, note }),
    });
  }

  async deliverOrder(id: string, note?: string): Promise<Order> {
    return this.request<Order>(`/admin/orders/${id}/deliver`, {
      method: 'PATCH',
      body: JSON.stringify({ note }),
    });
  }

  // Order analytics
  async getOrderStats(params: {
    dateRange?: {
      from: string;
      to: string;
    };
  } = {}): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    revenue: {
      total: number;
      thisMonth: number;
      lastMonth: number;
      growth: number;
    };
    topProducts: Array<{
      productId: string;
      productName: string;
      totalSold: number;
      revenue: number;
    }>;
  }> {
    const searchParams = new URLSearchParams();
    
    if (params.dateRange) {
      searchParams.append('dateFrom', params.dateRange.from);
      searchParams.append('dateTo', params.dateRange.to);
    }

    return this.request<{
      total: number;
      pending: number;
      confirmed: number;
      processing: number;
      shipped: number;
      delivered: number;
      cancelled: number;
      revenue: {
        total: number;
        thisMonth: number;
        lastMonth: number;
        growth: number;
      };
      topProducts: Array<{
        productId: string;
        productName: string;
        totalSold: number;
        revenue: number;
      }>;
    }>(`/admin/orders/stats?${searchParams.toString()}`);
  }

  // Export orders
  async exportOrders(params: {
    format: 'csv' | 'xlsx';
    filters?: OrdersFilter;
    dateRange?: {
      from: string;
      to: string;
    };
  }): Promise<Blob> {
    const searchParams = new URLSearchParams();
    searchParams.append('format', params.format);
    
    if (params.filters) {
      if (params.filters.status) searchParams.append('status', params.filters.status);
      if (params.filters.orderType) searchParams.append('orderType', params.filters.orderType);
      if (params.filters.customerId) searchParams.append('customerId', params.filters.customerId);
    }
    
    if (params.dateRange) {
      searchParams.append('dateFrom', params.dateRange.from);
      searchParams.append('dateTo', params.dateRange.to);
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    
    const response = await fetch(`${API_BASE_URL}/admin/orders/export?${searchParams.toString()}`, {
      method: 'GET',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`Export failed! status: ${response.status}`);
    }

    return response.blob();
  }

  // Bulk operations
  async bulkUpdateStatus(orderIds: string[], status: Order['status'], note?: string): Promise<{
    success: number;
    failed: number;
    errors: Array<{
      orderId: string;
      error: string;
    }>;
  }> {
    return this.request<{
      success: number;
      failed: number;
      errors: Array<{
        orderId: string;
        error: string;
      }>;
    }>('/admin/orders/bulk-update-status', {
      method: 'PATCH',
      body: JSON.stringify({
        orderIds,
        status,
        note,
      }),
    });
  }

  async bulkDelete(orderIds: string[]): Promise<{
    success: number;
    failed: number;
    errors: Array<{
      orderId: string;
      error: string;
    }>;
  }> {
    return this.request<{
      success: number;
      failed: number;
      errors: Array<{
        orderId: string;
        error: string;
      }>;
    }>('/admin/orders/bulk-delete', {
      method: 'DELETE',
      body: JSON.stringify({
        orderIds,
      }),
    });
  }
}

export const ordersAPI = new OrdersAPI();