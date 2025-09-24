export interface Customer {
  id: string;
  messengerId?: string | null;
  zaloId?: string | null;
  fullName: string;
  phone: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  createdByAdminId: string;
  createdByAdmin: {
    username: string;
    email: string;
  };
  addresses: Array<{
    id: string;
    customerId: string;
    addressLine: string;
    district: string | null;
    city: string;
    postalCode: string | null;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
  _count: {
    orders: number;
  };
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  unitPrice: number;
  stockQuantity: number;
  isActive: boolean;
  isDeleted: boolean;
  capacity: {
    id: string;
    name: string;
    volumeMl: number;
  };
  // Single color/category (backward compatibility)
  color?: {
    id: string;
    name: string;
    hexCode: string;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  // Multiple colors/categories (new support)
  colors?: Array<{
    id: string;
    name: string;
    hexCode: string;
  }>;
  categories?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  // Backend relation structures
  productColors?: Array<{
    color: {
      id: string;
      name: string;
      hexCode: string;
    };
  }>;
  productCategories?: Array<{
    category: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
  productImages: Array<{
    url: string;
    order: number;
  }>;
  _count: {
    orderItems: number;
  };
}

export interface OrderItem {
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  requestedColor?: string;
}

export interface TemporaryAddress {
  addressLine: string;
  district: string;
  city: string;
  postalCode: string;
}

export interface OrderFormData {
  customerId: string;
  customer?: Customer;
  orderType: "custom" | "product";
  customDescription: string;
  items: OrderItem[];
  totalAmount?: number; // For custom orders
  originalShippingCost: number;
  shippingDiscount: number;
  shippingCost: number; // Final shipping cost = originalShippingCost - shippingDiscount
  notes: string;
  deliveryAddressId?: string;
  // Temporary address for this order only (not saved to customer)
  temporaryAddress?: TemporaryAddress;
  useTemporaryAddress?: boolean;
}

export interface WizardStep {
  id: number;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface OrderWizardProps {
  initialData?: Partial<OrderFormData>;
}

export interface StepProps {
  formData: OrderFormData;
  setFormData: React.Dispatch<React.SetStateAction<OrderFormData>>;
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onNext?: () => void;
  onPrev?: () => void;
}

export interface CustomerSearchResult {
  customers: Customer[];
  loading: boolean;
  searchTerm: string;
  searchResults: Customer[];
  searching: boolean;
  showDropdown: boolean;
}

export interface ProductSearchResult {
  searchTerm: string;
  searchResults: Product[];
  searching: boolean;
  showDropdown: boolean;
  activeItemIndex: number | null;
}
