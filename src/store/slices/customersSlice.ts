import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface Customer {
  id: string;
  fullName?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdByAdmin: {
    id: string;
    username: string;
  };
  addresses: CustomerAddress[];
  socialAccounts: CustomerSocialAccount[];
}

export interface CustomerAddress {
  id: string;
  label: string;
  streetAddress: string;
  ward?: string;
  district: string;
  city: string;
  postalCode?: string;
  isDefault: boolean;
}

export interface CustomerSocialAccount {
  id: string;
  platform: 'facebook' | 'zalo';
  accountIdentifier: string;
  displayName?: string;
}

export interface CreateCustomerData {
  fullName?: string;
  phone: string;
  email?: string;
  addresses: Omit<CustomerAddress, 'id'>[];
  socialAccounts: Omit<CustomerSocialAccount, 'id'>[];
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {
  id: string;
}

export interface CustomersFilter {
  search?: string;
  status?: 'active' | 'inactive';
  createdBy?: string;
  dateRange?: {
    from: string;
    to: string;
  };
}

export interface CustomersState {
  // Data
  customers: Customer[];
  selectedCustomer: Customer | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  
  // Filters
  filters: CustomersFilter;
  
  // UI State
  loading: boolean;
  saving: boolean;
  deleting: boolean;
  error: string | null;
  
  // Modal/Form state
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  editingCustomerId: string | null;
}

const initialState: CustomersState = {
  customers: [],
  selectedCustomer: null,
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
  pageSize: 10,
  filters: {},
  loading: false,
  saving: false,
  deleting: false,
  error: null,
  isCreateModalOpen: false,
  isEditModalOpen: false,
  editingCustomerId: null,
};

// Async thunks
export const fetchCustomers = createAsyncThunk(
  'customers/fetchCustomers',
  async (params: { page?: number; filters?: CustomersFilter } = {}) => {
    const { page = 1, filters = {} } = params;
    
    // TODO: Replace with actual API call
    const response = await new Promise<{
      customers: Customer[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalCount: number;
        pageSize: number;
      };
    }>((resolve) => {
      setTimeout(() => {
        resolve({
          customers: [
            {
              id: '1',
              fullName: 'Nguyễn Văn An',
              phone: '0901234567',
              email: 'nguyenvanan@gmail.com',
              isActive: true,
              createdAt: '2024-01-15T08:30:00Z',
              updatedAt: '2024-01-15T08:30:00Z',
              createdByAdmin: {
                id: 'admin1',
                username: 'admin'
              },
              addresses: [
                {
                  id: 'addr1',
                  label: 'Địa chỉ chính',
                  streetAddress: '123 Nguyễn Trãi',
                  ward: 'Phường 2',
                  district: 'Quận 5',
                  city: 'TP.HCM',
                  postalCode: '70000',
                  isDefault: true
                }
              ],
              socialAccounts: [
                {
                  id: 'social1',
                  platform: 'facebook',
                  accountIdentifier: 'nguyenvanan',
                  displayName: 'Nguyễn Văn An'
                }
              ]
            }
          ],
          pagination: {
            currentPage: page,
            totalPages: 1,
            totalCount: 1,
            pageSize: 10
          }
        });
      }, 1000);
    });
    
    return response;
  }
);

export const fetchCustomerById = createAsyncThunk(
  'customers/fetchCustomerById',
  async (customerId: string) => {
    // TODO: Replace with actual API call
    const response = await new Promise<Customer>((resolve, reject) => {
      setTimeout(() => {
        if (customerId === '1') {
          resolve({
            id: '1',
            fullName: 'Nguyễn Văn An',
            phone: '0901234567',
            email: 'nguyenvanan@gmail.com',
            isActive: true,
            createdAt: '2024-01-15T08:30:00Z',
            updatedAt: '2024-01-15T08:30:00Z',
            createdByAdmin: {
              id: 'admin1',
              username: 'admin'
            },
            addresses: [
              {
                id: 'addr1',
                label: 'Địa chỉ chính',
                streetAddress: '123 Nguyễn Trãi',
                ward: 'Phường 2',
                district: 'Quận 5',
                city: 'TP.HCM',
                postalCode: '70000',
                isDefault: true
              }
            ],
            socialAccounts: [
              {
                id: 'social1',
                platform: 'facebook',
                accountIdentifier: 'nguyenvanan',
                displayName: 'Nguyễn Văn An'
              }
            ]
          });
        } else {
          reject(new Error('Customer not found'));
        }
      }, 500);
    });
    
    return response;
  }
);

export const createCustomer = createAsyncThunk(
  'customers/createCustomer',
  async (customerData: CreateCustomerData) => {
    // TODO: Replace with actual API call
    const response = await new Promise<Customer>((resolve) => {
      setTimeout(() => {
        const newCustomer: Customer = {
          id: `customer_${Date.now()}`,
          ...customerData,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdByAdmin: {
            id: 'admin1',
            username: 'admin'
          },
          addresses: customerData.addresses.map((addr, index) => ({
            ...addr,
            id: `addr_${Date.now()}_${index}`
          })),
          socialAccounts: customerData.socialAccounts.map((social, index) => ({
            ...social,
            id: `social_${Date.now()}_${index}`
          }))
        };
        resolve(newCustomer);
      }, 1000);
    });
    
    return response;
  }
);

export const updateCustomer = createAsyncThunk(
  'customers/updateCustomer',
  async (customerData: UpdateCustomerData) => {
    // TODO: Replace with actual API call
    const response = await new Promise<Customer>((resolve) => {
      setTimeout(() => {
        const updatedCustomer: Customer = {
          id: customerData.id,
          fullName: customerData.fullName,
          phone: customerData.phone || '',
          email: customerData.email,
          isActive: true,
          createdAt: '2024-01-15T08:30:00Z',
          updatedAt: new Date().toISOString(),
          createdByAdmin: {
            id: 'admin1',
            username: 'admin'
          },
          addresses: customerData.addresses?.map((addr, index) => ({
            ...addr,
            id: addr.id || `addr_${Date.now()}_${index}`
          })) || [],
          socialAccounts: customerData.socialAccounts?.map((social, index) => ({
            ...social,
            id: social.id || `social_${Date.now()}_${index}`
          })) || []
        };
        resolve(updatedCustomer);
      }, 1000);
    });
    
    return response;
  }
);

export const deleteCustomer = createAsyncThunk(
  'customers/deleteCustomer',
  async (customerId: string) => {
    // TODO: Replace with actual API call
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 1000);
    });
    
    return customerId;
  }
);

// Slice
const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    // Filter actions
    setFilters: (state, action: PayloadAction<CustomersFilter>) => {
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
      state.editingCustomerId = action.payload;
    },
    closeEditModal: (state) => {
      state.isEditModalOpen = false;
      state.editingCustomerId = null;
    },
    
    // Selection actions
    selectCustomer: (state, action: PayloadAction<Customer>) => {
      state.selectedCustomer = action.payload;
    },
    clearSelectedCustomer: (state) => {
      state.selectedCustomer = null;
    },
    
    // Error handling
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch customers
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload.customers;
        state.currentPage = action.payload.pagination.currentPage;
        state.totalPages = action.payload.pagination.totalPages;
        state.totalCount = action.payload.pagination.totalCount;
        state.pageSize = action.payload.pagination.pageSize;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch customers';
      });
      
    // Fetch customer by ID
    builder
      .addCase(fetchCustomerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCustomer = action.payload;
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch customer';
      });
      
    // Create customer
    builder
      .addCase(createCustomer.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.saving = false;
        state.customers.unshift(action.payload);
        state.totalCount += 1;
        state.isCreateModalOpen = false;
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || 'Failed to create customer';
      });
      
    // Update customer
    builder
      .addCase(updateCustomer.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.saving = false;
        const index = state.customers.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
        if (state.selectedCustomer?.id === action.payload.id) {
          state.selectedCustomer = action.payload;
        }
        state.isEditModalOpen = false;
        state.editingCustomerId = null;
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || 'Failed to update customer';
      });
      
    // Delete customer
    builder
      .addCase(deleteCustomer.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.deleting = false;
        state.customers = state.customers.filter(c => c.id !== action.payload);
        state.totalCount -= 1;
        if (state.selectedCustomer?.id === action.payload) {
          state.selectedCustomer = null;
        }
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.error.message || 'Failed to delete customer';
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
  selectCustomer,
  clearSelectedCustomer,
  clearError,
} = customersSlice.actions;

export default customersSlice.reducer;