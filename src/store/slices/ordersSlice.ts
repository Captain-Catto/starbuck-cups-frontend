import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Types
export interface Order {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    fullName?: string;
    phone?: string;
    email?: string;
  };
  orderType: "custom" | "product";
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  totalAmount: number;
  shippingCost: number;
  originalShippingCost: number;
  isFreeShipping: boolean;
  customDescription?: string;
  deliveryAddress?: {
    id: string;
    label: string;
    streetAddress: string;
    ward?: string;
    district: string;
    city: string;
  };
  notes?: string;
  items?: OrderItem[];
  statusHistory: OrderStatusHistory[];
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  completedAt?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  requestedColor?: string;
  productSnapshot: {
    name: string;
    displayColor: string;
    capacity: string;
    category: string;
    images: string[];
  };
}

export interface OrderStatusHistory {
  status: string;
  timestamp: string;
  note?: string;
  updatedBy?: string;
}

export interface CreateOrderData {
  customerId: string;
  orderType: "custom" | "product";
  customDescription?: string;
  items?: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    requestedColor?: string;
  }>;
  totalAmount: number;
  shippingCost: number;
  originalShippingCost: number;
  isFreeShipping: boolean;
  deliveryAddressId?: string;
  notes?: string;
}

export interface UpdateOrderData extends Partial<CreateOrderData> {
  id: string;
}

export interface UpdateOrderStatusData {
  orderId: string;
  status: Order["status"];
  note?: string;
}

export interface OrdersFilter {
  search?: string;
  status?: Order["status"];
  orderType?: "custom" | "product";
  customerId?: string;
  dateRange?: {
    from: string;
    to: string;
  };
  amountRange?: {
    min: number;
    max: number;
  };
  freeShipping?: boolean;
}

export interface OrdersState {
  // Data
  orders: Order[];
  selectedOrder: Order | null;

  // Pagination
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;

  // Filters
  filters: OrdersFilter;

  // UI State
  loading: boolean;
  saving: boolean;
  deleting: boolean;
  updatingStatus: boolean;
  error: string | null;

  // Modal/Form state
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  isStatusModalOpen: boolean;
  editingOrderId: string | null;

  // Statistics
  stats: {
    total: number;
    pending: number;
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
}

const initialState: OrdersState = {
  orders: [],
  selectedOrder: null,
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
  pageSize: 10,
  filters: {},
  loading: false,
  saving: false,
  deleting: false,
  updatingStatus: false,
  error: null,
  isCreateModalOpen: false,
  isEditModalOpen: false,
  isStatusModalOpen: false,
  editingOrderId: null,
  stats: {
    total: 0,
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  },
};

// Async thunks
export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (params: { page?: number; filters?: OrdersFilter } = {}, { rejectWithValue }) => {
    try {
      const { page = 1, filters = {} } = params;

      // Build query parameters
      const searchParams = new URLSearchParams();
      searchParams.append('page', page.toString());
      searchParams.append('limit', '10');

      if (filters.search) searchParams.append('search', filters.search);
      if (filters.status) searchParams.append('status', filters.status);
      if (filters.orderType) searchParams.append('orderType', filters.orderType);
      if (filters.customerId) searchParams.append('customerId', filters.customerId);
      if (filters.freeShipping !== undefined) searchParams.append('freeShipping', filters.freeShipping.toString());

      if (filters.dateRange) {
        searchParams.append('startDate', filters.dateRange.from);
        searchParams.append('endDate', filters.dateRange.to);
      }

      if (filters.amountRange) {
        searchParams.append('minAmount', filters.amountRange.min.toString());
        searchParams.append('maxAmount', filters.amountRange.max.toString());
      }

      const response = await fetch(`/api/orders?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch orders');
      }

      if (!data.success) {
        return rejectWithValue(data.message || 'Failed to fetch orders');
      }

      return {
        orders: data.data?.items || [],
        pagination: {
          currentPage: data.data?.currentPage || page,
          totalPages: data.data?.totalPages || 1,
          totalCount: data.data?.totalItems || 0,
          pageSize: data.data?.limit || 10,
        },
        stats: data.data?.stats || {
          total: 0,
          pending: 0,
          confirmed: 0,
          processing: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0,
        },
      };
    } catch {
      return rejectWithValue('Network error: Failed to fetch orders');
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  "orders/fetchOrderById",
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch order');
      }

      if (!data.success) {
        return rejectWithValue(data.message || 'Failed to fetch order');
      }

      return data.data;
    } catch {
      return rejectWithValue('Network error: Failed to fetch order');
    }
  }
);

export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (orderData: CreateOrderData, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to create order');
      }

      if (!data.success) {
        return rejectWithValue(data.message || 'Failed to create order');
      }

      return data.data;
    } catch {
      return rejectWithValue('Network error: Failed to create order');
    }
  }
);

export const updateOrder = createAsyncThunk(
  "orders/updateOrder",
  async (orderData: UpdateOrderData, { rejectWithValue }) => {
    try {
      const { id, ...updateData } = orderData;

      const response = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to update order');
      }

      if (!data.success) {
        return rejectWithValue(data.message || 'Failed to update order');
      }

      return data.data;
    } catch {
      return rejectWithValue('Network error: Failed to update order');
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  "orders/updateOrderStatus",
  async (data: UpdateOrderStatusData, { rejectWithValue }) => {
    try {
      const { orderId, ...statusData } = data;

      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(statusData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        return rejectWithValue(responseData.message || 'Failed to update order status');
      }

      if (!responseData.success) {
        return rejectWithValue(responseData.message || 'Failed to update order status');
      }

      return {
        orderId,
        status: data.status,
        statusHistory: responseData.data.statusHistory,
      };
    } catch {
      return rejectWithValue('Network error: Failed to update order status');
    }
  }
);

export const deleteOrder = createAsyncThunk(
  "orders/deleteOrder",
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to delete order');
      }

      if (!data.success) {
        return rejectWithValue(data.message || 'Failed to delete order');
      }

      return orderId;
    } catch {
      return rejectWithValue('Network error: Failed to delete order');
    }
  }
);

// Slice
const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    // Filter actions
    setFilters: (state, action: PayloadAction<OrdersFilter>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 1; // Reset to first page when filters change
    },
    clearFilters: (state) => {
      state.filters = {};
      state.currentPage = 1;
    },

    // Pagination actions
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },

    // Modal/Form actions
    openCreateModal: (state) => {
      state.isCreateModalOpen = true;
    },
    closeCreateModal: (state) => {
      state.isCreateModalOpen = false;
    },
    openEditModal: (state, action: PayloadAction<string>) => {
      state.isEditModalOpen = true;
      state.editingOrderId = action.payload;
    },
    closeEditModal: (state) => {
      state.isEditModalOpen = false;
      state.editingOrderId = null;
    },
    openStatusModal: (state, action: PayloadAction<string>) => {
      state.isStatusModalOpen = true;
      state.editingOrderId = action.payload;
    },
    closeStatusModal: (state) => {
      state.isStatusModalOpen = false;
      state.editingOrderId = null;
    },

    // Selection actions
    selectOrder: (state, action: PayloadAction<Order>) => {
      state.selectedOrder = action.payload;
    },
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
    },

    // Error handling
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch orders
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.currentPage = action.payload.pagination.currentPage;
        state.totalPages = action.payload.pagination.totalPages;
        state.totalCount = action.payload.pagination.totalCount;
        state.pageSize = action.payload.pagination.pageSize;
        state.stats = action.payload.stats;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch orders";
      });

    // Fetch order by ID
    builder
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch order";
      });

    // Create order
    builder
      .addCase(createOrder.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.saving = false;
        state.orders.unshift(action.payload);
        state.totalCount += 1;
        state.stats.total += 1;
        state.stats.pending += 1;
        state.isCreateModalOpen = false;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || "Failed to create order";
      });

    // Update order
    builder
      .addCase(updateOrder.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.saving = false;
        const index = state.orders.findIndex((o) => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        if (state.selectedOrder?.id === action.payload.id) {
          state.selectedOrder = action.payload;
        }
        state.isEditModalOpen = false;
        state.editingOrderId = null;
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || "Failed to update order";
      });

    // Update order status
    builder
      .addCase(updateOrderStatus.pending, (state) => {
        state.updatingStatus = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.updatingStatus = false;
        const { orderId, status, statusHistory } = action.payload;

        // Update order in list
        const orderIndex = state.orders.findIndex((o) => o.id === orderId);
        if (orderIndex !== -1) {
          const oldStatus = state.orders[orderIndex].status;
          state.orders[orderIndex].status = status;
          state.orders[orderIndex].statusHistory.push(statusHistory);
          state.orders[orderIndex].updatedAt = new Date().toISOString();

          if (status === "confirmed" && !state.orders[orderIndex].confirmedAt) {
            state.orders[orderIndex].confirmedAt = new Date().toISOString();
          }
          if (status === "delivered" && !state.orders[orderIndex].completedAt) {
            state.orders[orderIndex].completedAt = new Date().toISOString();
          }

          // Update stats
          state.stats[oldStatus as keyof typeof state.stats] -= 1;
          state.stats[status as keyof typeof state.stats] += 1;
        }

        // Update selected order
        if (state.selectedOrder?.id === orderId) {
          state.selectedOrder.status = status;
          state.selectedOrder.statusHistory.push(statusHistory);
          state.selectedOrder.updatedAt = new Date().toISOString();

          if (status === "confirmed" && !state.selectedOrder.confirmedAt) {
            state.selectedOrder.confirmedAt = new Date().toISOString();
          }
          if (status === "delivered" && !state.selectedOrder.completedAt) {
            state.selectedOrder.completedAt = new Date().toISOString();
          }
        }

        state.isStatusModalOpen = false;
        state.editingOrderId = null;
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.updatingStatus = false;
        state.error = action.error.message || "Failed to update order status";
      });

    // Delete order
    builder
      .addCase(deleteOrder.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.deleting = false;
        const deletedOrder = state.orders.find((o) => o.id === action.payload);
        state.orders = state.orders.filter((o) => o.id !== action.payload);
        state.totalCount -= 1;
        state.stats.total -= 1;
        if (deletedOrder) {
          state.stats[deletedOrder.status as keyof typeof state.stats] -= 1;
        }
        if (state.selectedOrder?.id === action.payload) {
          state.selectedOrder = null;
        }
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.error.message || "Failed to delete order";
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setCurrentPage,
  openCreateModal,
  closeCreateModal,
  openEditModal,
  closeEditModal,
  openStatusModal,
  closeStatusModal,
  selectOrder,
  clearSelectedOrder,
  clearError,
} = ordersSlice.actions;

export default ordersSlice.reducer;
