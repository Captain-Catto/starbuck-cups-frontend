import { Customer, CreateCustomerData, UpdateCustomerData, CustomersFilter } from '@/store/slices/customersSlice';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

class CustomersAPI {
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

  async getCustomers(params: {
    page?: number;
    limit?: number;
    filters?: CustomersFilter;
  } = {}): Promise<{
    customers: Customer[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      pageSize: number;
    };
  }> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    
    // Add filters
    if (params.filters) {
      if (params.filters.search) searchParams.append('search', params.filters.search);
      if (params.filters.status) searchParams.append('status', params.filters.status);
      if (params.filters.createdBy) searchParams.append('createdBy', params.filters.createdBy);
      if (params.filters.dateRange) {
        searchParams.append('dateFrom', params.filters.dateRange.from);
        searchParams.append('dateTo', params.filters.dateRange.to);
      }
    }

    return this.request<{
      customers: Customer[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalCount: number;
        pageSize: number;
      };
    }>(`/admin/customers?${searchParams.toString()}`);
  }

  async getCustomerById(id: string): Promise<Customer> {
    return this.request<Customer>(`/admin/customers/${id}`);
  }

  async createCustomer(data: CreateCustomerData): Promise<Customer> {
    return this.request<Customer>('/admin/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCustomer(id: string, data: Partial<CreateCustomerData>): Promise<Customer> {
    return this.request<Customer>(`/admin/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCustomer(id: string): Promise<void> {
    return this.request<void>(`/admin/customers/${id}`, {
      method: 'DELETE',
    });
  }

  async searchCustomers(query: string): Promise<Customer[]> {
    const searchParams = new URLSearchParams({
      q: query,
      limit: '10'
    });

    const response = await this.request<{
      customers: Customer[];
    }>(`/admin/customers/search?${searchParams.toString()}`);
    
    return response.customers;
  }

  // Customer addresses
  async getCustomerAddresses(customerId: string) {
    return this.request(`/admin/customers/${customerId}/addresses`);
  }

  async createCustomerAddress(customerId: string, addressData: any) {
    return this.request(`/admin/customers/${customerId}/addresses`, {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  }

  async updateCustomerAddress(customerId: string, addressId: string, addressData: any) {
    return this.request(`/admin/customers/${customerId}/addresses/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    });
  }

  async deleteCustomerAddress(customerId: string, addressId: string) {
    return this.request(`/admin/customers/${customerId}/addresses/${addressId}`, {
      method: 'DELETE',
    });
  }

  // Customer social accounts
  async getCustomerSocialAccounts(customerId: string) {
    return this.request(`/admin/customers/${customerId}/social-accounts`);
  }

  async createCustomerSocialAccount(customerId: string, socialData: any) {
    return this.request(`/admin/customers/${customerId}/social-accounts`, {
      method: 'POST',
      body: JSON.stringify(socialData),
    });
  }

  async updateCustomerSocialAccount(customerId: string, socialId: string, socialData: any) {
    return this.request(`/admin/customers/${customerId}/social-accounts/${socialId}`, {
      method: 'PUT',
      body: JSON.stringify(socialData),
    });
  }

  async deleteCustomerSocialAccount(customerId: string, socialId: string) {
    return this.request(`/admin/customers/${customerId}/social-accounts/${socialId}`, {
      method: 'DELETE',
    });
  }
}

export const customersAPI = new CustomersAPI();