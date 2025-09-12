// API Response Types - Matching backend
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  meta: {
    timestamp: string;
    pagination?: PaginationMeta;
  };
  error: string | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  slug: string;
  images: string[];
  stockQuantity: number;
  productUrl?: string;
  categoryId: string;
  colorId: string;
  capacityId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category: Category;
  color: Color;
  capacity: Capacity;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  children?: Category[];
  parent?: Category;
}

export interface Color {
  id: string;
  name: string;
  hexCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Capacity {
  id: string;
  name: string;
  volumeMl: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Customer Types
export interface Customer {
  id: string;
  messengerId: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

// Order Types
export interface Order {
  id: string;
  customerId: string;
  status: OrderStatus;
  totalAmount: number;
  customerInfo: CustomerInfo;
  orderDate: string;
  fulfillmentDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  customer: Customer;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productSnapshot: ProductSnapshot;
  colorRequest?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductSnapshot {
  name: string;
  description: string;
  category: string;
  color: string;
  capacity: string;
  images: string[];
}

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  notes?: string;
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "COMPLETED"
  | "CANCELLED";

// Consultation Types
export interface Consultation {
  id: string;
  customerId: string;
  products: Product[];
  customerMessage: string;
  adminResponse?: string;
  status: ConsultationStatus;
  createdAt: string;
  updatedAt: string;
  customer: Customer;
}

export type ConsultationStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

// Cart Types
export interface CartItem {
  product: Product;
  quantity: number;
  colorRequest?: string;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

// Admin User Types
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

// Auth State
export interface AuthState {
  isAuthenticated: boolean;
  user: AdminUser | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  sessionChecked: boolean;
}

// SEO Types for Next.js
export interface PageSEO {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  openGraph: {
    title: string;
    description: string;
    image: string;
    url: string;
    type: "website" | "article";
  };
  jsonLd?: Record<string, unknown>;
}

// Product filters for search/browse
export interface ProductFilters {
  category?: string;
  color?: string;
  capacity?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: "name" | "price" | "createdAt";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}
