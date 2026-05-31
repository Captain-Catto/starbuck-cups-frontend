import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { WritableDraft } from "immer";

type StateWithAuth = { auth: { token: string | null } };

export type StatusFilter = "all" | "active" | "inactive";

export interface AdminListPagination {
  current_page: number;
  has_next: boolean;
  has_prev: boolean;
  per_page: number;
  total_items: number;
  total_pages: number;
}

export interface AdminListState<T> {
  items: T[];
  pagination: AdminListPagination | null;
  loading: boolean;
  searchQuery: string;
  statusFilter: StatusFilter;
  currentPage: number;
  error: string | null;
}

interface AdminListSliceConfig {
  name: string;
  apiBase: string;
}

export function createAdminListSlice<T extends { id: string; isActive: boolean }>(
  config: AdminListSliceConfig
) {
  const { name, apiBase } = config;

  const initialState: AdminListState<T> = {
    items: [],
    pagination: null,
    loading: true,
    searchQuery: "",
    statusFilter: "all",
    currentPage: 1,
    error: null,
  };

  const fetchThunk = createAsyncThunk(
    `${name}/fetch`,
    async (
      params: { page: number; search?: string; statusFilter?: StatusFilter },
      { rejectWithValue, getState }
    ) => {
      try {
        const token = (getState() as StateWithAuth).auth.token;
        const { page, search, statusFilter } = params;
        const urlParams = new URLSearchParams({ page: String(page), size: "20" });
        if (search) urlParams.set("search", search);
        if (statusFilter === "active") urlParams.set("isActive", "true");
        else if (statusFilter === "inactive") urlParams.set("isActive", "false");

        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await fetch(`/api/admin/${apiBase}?${urlParams}`, { headers });
        const data = await response.json();

        if (!response.ok || !data.success) {
          return rejectWithValue(data.message || `Failed to fetch ${name}`);
        }
        return {
          items: (data.data?.items || []) as T[],
          pagination: (data.data?.pagination || null) as AdminListPagination | null,
        };
      } catch (err) {
        return rejectWithValue(err instanceof Error ? err.message : `Failed to fetch ${name}`);
      }
    }
  );

  const toggleStatusThunk = createAsyncThunk(
    `${name}/toggleStatus`,
    async (item: T, { rejectWithValue, getState }) => {
      const token = (getState() as StateWithAuth).auth.token;
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
      try {
        const response = await fetch(`/api/admin/${apiBase}/${item.id}/toggle-status`, {
          method: "PATCH",
          headers,
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          return rejectWithValue(data.message || `Failed to toggle ${name} status`);
        }
        return { id: item.id, isActive: !item.isActive };
      } catch (err) {
        return rejectWithValue(err instanceof Error ? err.message : `Failed to toggle ${name} status`);
      }
    }
  );

  const deleteThunk = createAsyncThunk(
    `${name}/delete`,
    async (id: string, { rejectWithValue, getState }) => {
      const token = (getState() as StateWithAuth).auth.token;
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
      try {
        const response = await fetch(`/api/admin/${apiBase}/${id}`, {
          method: "DELETE",
          headers,
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          return rejectWithValue(data.message || `Failed to delete ${name}`);
        }
        return id;
      } catch (err) {
        return rejectWithValue(err instanceof Error ? err.message : `Failed to delete ${name}`);
      }
    }
  );

  const slice = createSlice({
    name,
    initialState,
    reducers: {
      setSearchQuery: (state, action: PayloadAction<string>) => {
        state.searchQuery = action.payload;
        state.currentPage = 1;
      },
      setStatusFilter: (state, action: PayloadAction<StatusFilter>) => {
        state.statusFilter = action.payload;
        state.currentPage = 1;
      },
      setCurrentPage: (state, action: PayloadAction<number>) => {
        state.currentPage = action.payload;
      },
      setItemsDirectly: (state, action: PayloadAction<T[]>) => {
        (state as AdminListState<T>).items = action.payload;
      },
    },
    extraReducers: (builder) => {
      builder
        .addCase(fetchThunk.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchThunk.fulfilled, (state, action) => {
          state.loading = false;
          (state as AdminListState<T>).items = action.payload.items;
          state.pagination = action.payload.pagination;
        })
        .addCase(fetchThunk.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload as string;
        })
        .addCase(toggleStatusThunk.fulfilled, (state, action) => {
          const item = (state as AdminListState<T>).items.find((i) => i.id === action.payload.id);
          if (item) item.isActive = action.payload.isActive;
        })
        .addCase(deleteThunk.fulfilled, (state, action) => {
          (state as AdminListState<T>).items = (state as AdminListState<T>).items.filter(
            (i) => i.id !== action.payload
          );
        });
    },
  });

  return {
    slice,
    fetchThunk,
    toggleStatusThunk,
    deleteThunk,
    actions: slice.actions,
    reducer: slice.reducer,
  };
}
