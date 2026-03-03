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
  current_page: number;
  has_next: boolean;
  has_prev: boolean;
  per_page: number;
  total_items: number;
  total_pages: number;
}

// Product Types
export interface ProductImage {
  url: string;
  order: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  slug: string;
  productImages?: ProductImage[]; // New field from backend
  stockQuantity: number;
  productUrl?: string;
  isActive: boolean;
  isVip?: boolean; // ✅ NEW FIELD for VIP products
  isFeatured?: boolean; // ✅ NEW FIELD for Featured products
  createdAt: string;
  updatedAt: string;
  productCategories?: { category: Category }[];
  productColors?: { color: Color }[];
  capacity?: Capacity;
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
  slug: string;
  hexCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Capacity {
  id: string;
  name: string;
  slug: string;
  volumeMl: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CapacityRange {
  min: number;
  max: number;
}

// Customer Types
export interface Customer {
  id: string;
  messengerId: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  messengerName?: string;
  phone?: string;
  email?: string;
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
  customerName: string;
  phoneNumber: string;
  address: string;
  totalItems: number;
  status: ConsultationStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  consultationItems: ConsultationItem[];
}

export interface ConsultationItem {
  id: string;
  consultationId: string;
  productId: string;
  productName: string;
  quantity: number;
  color: string;
  capacity: string;
  category: string;
  createdAt: string;
  consultation: Consultation;
  product: Product;
}

export type ConsultationStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED";

// Cart Types
export interface CartItem {
  product: Product;
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
