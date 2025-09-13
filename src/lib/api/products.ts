const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export interface Product {
  id: string;
  name: string;
  slug: string;
  displayColor: string;
  capacity: string;
  category: string;
  stockQuantity: number;
  images: string[];
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsFilter {
  search?: string;
  categoryId?: string;
  colorId?: string;
  capacityId?: string;
  isActive?: boolean;
  inStock?: boolean;
}

class ProductsAPI {
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

  async getProducts(params: {
    page?: number;
    limit?: number;
    filters?: ProductsFilter;
  } = {}): Promise<{
    products: Product[];
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
      if (params.filters.categoryId) searchParams.append('categoryId', params.filters.categoryId);
      if (params.filters.colorId) searchParams.append('colorId', params.filters.colorId);
      if (params.filters.capacityId) searchParams.append('capacityId', params.filters.capacityId);
      if (params.filters.isActive !== undefined) {
        searchParams.append('isActive', params.filters.isActive.toString());
      }
      if (params.filters.inStock !== undefined) {
        searchParams.append('inStock', params.filters.inStock.toString());
      }
    }

    return this.request<{
      products: Product[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalCount: number;
        pageSize: number;
      };
    }>(`/admin/products?${searchParams.toString()}`);
  }

  async getProductById(id: string): Promise<Product> {
    return this.request<Product>(`/admin/products/${id}`);
  }

  async searchProducts(query: string, limit = 10): Promise<Product[]> {
    const searchParams = new URLSearchParams({
      q: query,
      limit: limit.toString(),
      isActive: 'true',
      inStock: 'true'
    });

    const response = await this.request<{
      products: Product[];
    }>(`/admin/products/search?${searchParams.toString()}`);
    
    return response.products;
  }

  // For order wizard - get available products for ordering
  async getAvailableProducts(): Promise<Product[]> {
    const response = await this.request<{
      products: Product[];
    }>('/admin/products?isActive=true&inStock=true&limit=100');
    
    return response.products;
  }

  // Check stock before creating order
  async checkStock(productId: string, quantity: number): Promise<{
    available: boolean;
    stockQuantity: number;
    message?: string;
  }> {
    return this.request<{
      available: boolean;
      stockQuantity: number;
      message?: string;
    }>(`/admin/products/${productId}/check-stock`, {
      method: 'POST',
      body: JSON.stringify({ quantity }),
    });
  }

  // Bulk stock check for multiple products
  async bulkCheckStock(items: Array<{ productId: string; quantity: number }>): Promise<{
    results: Array<{
      productId: string;
      available: boolean;
      stockQuantity: number;
      message?: string;
    }>;
    allAvailable: boolean;
  }> {
    return this.request<{
      results: Array<{
        productId: string;
        available: boolean;
        stockQuantity: number;
        message?: string;
      }>;
      allAvailable: boolean;
    }>('/admin/products/bulk-check-stock', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  }
}

export const productsAPI = new ProductsAPI();