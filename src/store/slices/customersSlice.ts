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
  async (params: { page?: number; filters?: CustomersFilter } = {}, { rejectWithValue }) => {
    try {
      const { page = 1, filters = {} } = params;

      // Build query parameters
      const searchParams = new URLSearchParams();
      searchParams.append('page', page.toString());
      searchParams.append('limit', '10');

      if (filters.search) searchParams.append('search', filters.search);
      if (filters.status) searchParams.append('status', filters.status);
      if (filters.createdBy) searchParams.append('createdBy', filters.createdBy);

      if (filters.dateRange) {
        searchParams.append('startDate', filters.dateRange.from);
        searchParams.append('endDate', filters.dateRange.to);
      }

      const response = await fetch(`/api/customers?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch customers');
      }

      if (!data.success) {
        return rejectWithValue(data.message || 'Failed to fetch customers');
      }

      return {
        customers: data.data?.items || [],
        pagination: {
          currentPage: data.data?.currentPage || page,
          totalPages: data.data?.totalPages || 1,
          totalCount: data.data?.totalItems || 0,
          pageSize: data.data?.limit || 10,
        },
      };
    } catch {
      return rejectWithValue('Network error: Failed to fetch customers');
    }
  }
);

export const fetchCustomerById = createAsyncThunk(
  'customers/fetchCustomerById',
  async (customerId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch customer');
      }

      if (!data.success) {
        return rejectWithValue(data.message || 'Failed to fetch customer');
      }

      return data.data;
    } catch {
      return rejectWithValue('Network error: Failed to fetch customer');
    }
  }
);

export const createCustomer = createAsyncThunk(
  'customers/createCustomer',
  async (customerData: CreateCustomerData, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to create customer');
      }

      if (!data.success) {
        return rejectWithValue(data.message || 'Failed to create customer');
      }

      return data.data;
    } catch {
      return rejectWithValue('Network error: Failed to create customer');
    }
  }
);

export const updateCustomer = createAsyncThunk(
  'customers/updateCustomer',
  async (customerData: UpdateCustomerData, { rejectWithValue }) => {
    try {
      const { id, ...updateData } = customerData;

      const response = await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to update customer');
      }

      if (!data.success) {
        return rejectWithValue(data.message || 'Failed to update customer');
      }

      return data.data;
    } catch {
      return rejectWithValue('Network error: Failed to update customer');
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  'customers/deleteCustomer',
  async (customerId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to delete customer');
      }

      if (!data.success) {
        return rejectWithValue(data.message || 'Failed to delete customer');
      }

      return customerId;
    } catch {
      return rejectWithValue('Network error: Failed to delete customer');
    }
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