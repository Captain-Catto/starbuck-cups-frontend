import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

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
  orderType: 'custom' | 'product';
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
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
  orderType: 'custom' | 'product';
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
  status: Order['status'];
  note?: string;
}

export interface OrdersFilter {
  search?: string;
  status?: Order['status'];
  orderType?: 'custom' | 'product';
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
  'orders/fetchOrders',
  async (params: { page?: number; filters?: OrdersFilter } = {}) => {
    const { page = 1, filters = {} } = params;
    
    // TODO: Replace with actual API call
    const response = await new Promise<{
      orders: Order[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalCount: number;
        pageSize: number;
      };
      stats: OrdersState['stats'];
    }>((resolve) => {
      setTimeout(() => {
        resolve({
          orders: [
            {
              id: '1',
              orderNumber: 'ORD-20240115-0001',
              customer: {
                id: 'cust1',
                fullName: 'Nguyễn Văn An',
                phone: '0901234567',
                email: 'nguyenvanan@gmail.com'
              },
              orderType: 'product',
              status: 'pending',
              totalAmount: 450000,
              shippingCost: 30000,
              isFreeShipping: false,
              items: [
                {
                  id: 'item1',
                  productId: 'prod1',
                  productName: 'Ly Starbucks Classic',
                  quantity: 3,
                  unitPrice: 150000,
                  productSnapshot: {
                    name: 'Ly Starbucks Classic',
                    displayColor: 'Trắng',
                    capacity: '450ml',
                    category: 'Tumblers',
                    images: ['/images/cup1.jpg']
                  }
                }
              ],
              statusHistory: [
                {
                  status: 'pending',
                  timestamp: '2024-01-15T08:30:00Z',
                  note: 'Đơn hàng được tạo',
                  updatedBy: 'admin'
                }
              ],
              createdAt: '2024-01-15T08:30:00Z',
              updatedAt: '2024-01-15T08:30:00Z'
            }
          ],
          pagination: {
            currentPage: page,
            totalPages: 1,
            totalCount: 1,
            pageSize: 10
          },
          stats: {
            total: 156,
            pending: 23,
            confirmed: 18,
            processing: 12,
            shipped: 8,
            delivered: 85,
            cancelled: 10
          }
        });
      }, 1000);
    });
    
    return response;
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (orderId: string) => {
    // TODO: Replace with actual API call
    const response = await new Promise<Order>((resolve, reject) => {
      setTimeout(() => {
        if (orderId === '1') {
          resolve({
            id: '1',
            orderNumber: 'ORD-20240115-0001',
            customer: {
              id: 'cust1',
              fullName: 'Nguyễn Văn An',
              phone: '0901234567',
              email: 'nguyenvanan@gmail.com'
            },
            orderType: 'product',
            status: 'confirmed',
            totalAmount: 450000,
            shippingCost: 30000,
            isFreeShipping: false,
            deliveryAddress: {
              id: 'addr1',
              label: 'Địa chỉ chính',
              streetAddress: '123 Nguyễn Trãi',
              ward: 'Phường 2',
              district: 'Quận 5',
              city: 'TP.HCM'
            },
            notes: 'Khách hàng yêu cầu giao vào buổi sáng',
            items: [
              {
                id: 'item1',
                productId: 'prod1',
                productName: 'Ly Starbucks Classic',
                quantity: 2,
                unitPrice: 150000,
                requestedColor: 'Đỏ',
                productSnapshot: {
                  name: 'Ly Starbucks Classic',
                  displayColor: 'Trắng',
                  capacity: '450ml',
                  category: 'Tumblers',
                  images: ['/images/cup1.jpg']
                }
              },
              {
                id: 'item2',
                productId: 'prod2',
                productName: 'Ly Starbucks Premium',
                quantity: 1,
                unitPrice: 150000,
                productSnapshot: {
                  name: 'Ly Starbucks Premium',
                  displayColor: 'Đen',
                  capacity: '500ml',
                  category: 'Tumblers',
                  images: ['/images/cup2.jpg']
                }
              }
            ],
            statusHistory: [
              {
                status: 'pending',
                timestamp: '2024-01-15T08:30:00Z',
                note: 'Đơn hàng được tạo',
                updatedBy: 'admin'
              },
              {
                status: 'confirmed',
                timestamp: '2024-01-15T09:15:00Z',
                note: 'Đã xác nhận và kiểm tra tồn kho',
                updatedBy: 'admin'
              }
            ],
            createdAt: '2024-01-15T08:30:00Z',
            updatedAt: '2024-01-15T09:15:00Z',
            confirmedAt: '2024-01-15T09:15:00Z'
          });
        } else {
          reject(new Error('Order not found'));
        }
      }, 500);
    });
    
    return response;
  }
);

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData: CreateOrderData) => {
    // TODO: Replace with actual API call
    const response = await new Promise<Order>((resolve) => {
      setTimeout(() => {
        const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`;
        
        const newOrder: Order = {
          id: `order_${Date.now()}`,
          orderNumber,
          customer: {
            id: orderData.customerId,
            fullName: 'Nguyễn Văn An', // Would be fetched from customer data
            phone: '0901234567'
          },
          orderType: orderData.orderType,
          status: 'pending',
          totalAmount: orderData.totalAmount,
          shippingCost: orderData.shippingCost,
          isFreeShipping: orderData.isFreeShipping,
          customDescription: orderData.customDescription,
          notes: orderData.notes,
          items: orderData.items?.map((item, index) => ({
            id: `item_${Date.now()}_${index}`,
            productId: item.productId,
            productName: `Product ${item.productId}`, // Would be fetched from product data
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            requestedColor: item.requestedColor,
            productSnapshot: {
              name: `Product ${item.productId}`,
              displayColor: 'Trắng',
              capacity: '450ml',
              category: 'Tumblers',
              images: ['/images/cup1.jpg']
            }
          })),
          statusHistory: [
            {
              status: 'pending',
              timestamp: new Date().toISOString(),
              note: 'Đơn hàng được tạo',
              updatedBy: 'admin'
            }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        resolve(newOrder);
      }, 1500);
    });
    
    return response;
  }
);

export const updateOrder = createAsyncThunk(
  'orders/updateOrder',
  async (orderData: UpdateOrderData) => {
    // TODO: Replace with actual API call
    const response = await new Promise<Order>((resolve) => {
      setTimeout(() => {
        const updatedOrder: Order = {
          id: orderData.id,
          orderNumber: 'ORD-20240115-0001',
          customer: {
            id: orderData.customerId || 'cust1',
            fullName: 'Nguyễn Văn An',
            phone: '0901234567'
          },
          orderType: orderData.orderType || 'product',
          status: 'pending',
          totalAmount: orderData.totalAmount || 0,
          shippingCost: orderData.shippingCost || 0,
          isFreeShipping: orderData.isFreeShipping || false,
          customDescription: orderData.customDescription,
          notes: orderData.notes,
          items: [],
          statusHistory: [
            {
              status: 'pending',
              timestamp: '2024-01-15T08:30:00Z',
              note: 'Đơn hàng được tạo',
              updatedBy: 'admin'
            }
          ],
          createdAt: '2024-01-15T08:30:00Z',
          updatedAt: new Date().toISOString()
        };
        resolve(updatedOrder);
      }, 1000);
    });
    
    return response;
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async (data: UpdateOrderStatusData) => {
    // TODO: Replace with actual API call
    const response = await new Promise<{
      orderId: string;
      status: Order['status'];
      statusHistory: OrderStatusHistory;
    }>((resolve) => {
      setTimeout(() => {
        resolve({
          orderId: data.orderId,
          status: data.status,
          statusHistory: {
            status: data.status,
            timestamp: new Date().toISOString(),
            note: data.note,
            updatedBy: 'admin'
          }
        });
      }, 1000);
    });
    
    return response;
  }
);

export const deleteOrder = createAsyncThunk(
  'orders/deleteOrder',
  async (orderId: string) => {
    // TODO: Replace with actual API call
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 1000);
    });
    
    return orderId;
  }
);

// Slice
const ordersSlice = createSlice({
  name: 'orders',
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
        state.error = action.error.message || 'Failed to fetch orders';
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
        state.error = action.error.message || 'Failed to fetch order';
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
        state.error = action.error.message || 'Failed to create order';
      });
      
    // Update order
    builder
      .addCase(updateOrder.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.saving = false;
        const index = state.orders.findIndex(o => o.id === action.payload.id);
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
        state.error = action.error.message || 'Failed to update order';
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
        const orderIndex = state.orders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
          const oldStatus = state.orders[orderIndex].status;
          state.orders[orderIndex].status = status;
          state.orders[orderIndex].statusHistory.push(statusHistory);
          state.orders[orderIndex].updatedAt = new Date().toISOString();
          
          if (status === 'confirmed' && !state.orders[orderIndex].confirmedAt) {
            state.orders[orderIndex].confirmedAt = new Date().toISOString();
          }
          if (status === 'delivered' && !state.orders[orderIndex].completedAt) {
            state.orders[orderIndex].completedAt = new Date().toISOString();
          }
          
          // Update stats
          state.stats[oldStatus as keyof typeof state.stats] -= 1;
          state.stats[status as keyof typeof state.stats] += 1;
        }
        
        // Update selected order
        if (state.selectedOrder?.id === orderId) {
          const oldStatus = state.selectedOrder.status;
          state.selectedOrder.status = status;
          state.selectedOrder.statusHistory.push(statusHistory);
          state.selectedOrder.updatedAt = new Date().toISOString();
          
          if (status === 'confirmed' && !state.selectedOrder.confirmedAt) {
            state.selectedOrder.confirmedAt = new Date().toISOString();
          }
          if (status === 'delivered' && !state.selectedOrder.completedAt) {
            state.selectedOrder.completedAt = new Date().toISOString();
          }
        }
        
        state.isStatusModalOpen = false;
        state.editingOrderId = null;
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.updatingStatus = false;
        state.error = action.error.message || 'Failed to update order status';
      });
      
    // Delete order
    builder
      .addCase(deleteOrder.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.deleting = false;
        const deletedOrder = state.orders.find(o => o.id === action.payload);
        state.orders = state.orders.filter(o => o.id !== action.payload);
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
        state.error = action.error.message || 'Failed to delete order';
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