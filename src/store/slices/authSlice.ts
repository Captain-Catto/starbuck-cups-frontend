import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { clientApi } from "@/lib/client-api";
import type { AuthState } from "@/types";
import { getUserFromToken } from "@/lib/jwt";

const ADMIN_TOKEN_STORAGE_KEY = "admin_token";

function getStoredAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
}

// Create initial state with client-side check
const getInitialState = (): AuthState => {
  if (typeof window !== "undefined") {
    return {
      isAuthenticated: false,
      user: null,
      token: getStoredAdminToken(),
      refreshToken: null, // Refresh token chỉ ở cookie, không localStorage
      loading: false,
      error: null,
      sessionChecked: false,
    };
  }

  // Server-side initial state
  return {
    isAuthenticated: false,
    user: null,
    token: null,
    refreshToken: null,
    loading: false,
    error: null,
    sessionChecked: false,
  };
};

const initialState: AuthState = getInitialState();

// Session check thunk
export const checkAuthStatus = createAsyncThunk(
  "auth/checkStatus",
  async (_, { rejectWithValue }) => {
    try {
      if (typeof window === "undefined") {
        throw new Error("Not on client side");
      }

      const token = getStoredAdminToken();

      if (token) {
        // Có token, verify với backend
        const response = await clientApi.verifyToken();
        return response.data;
      } else {
        // Không có access token, thử restore session bằng refresh token cookie
        // (cookie là HttpOnly nên không check được qua document.cookie — để server quyết định)
        const sessionResponse = await clientApi.checkSession();

        // Lưu token mới vào localStorage
        if (sessionResponse.data.token) {
          localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, sessionResponse.data.token);
        }

        return sessionResponse.data;
      }
    } catch (error: unknown) {
      // Clear invalid tokens
      if (typeof window !== "undefined") {
        localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
      }

      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Authentication check failed");
    }
  }
);

// Token refresh thunk
export const refreshAuthToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      if (typeof window === "undefined") {
        throw new Error("Not on client side");
      }

      // Refresh token sẽ được gửi tự động trong cookie
      const response = await clientApi.refreshToken();
      return response.data;
    } catch (error: unknown) {
      // Clear invalid tokens
      if (typeof window !== "undefined") {
        localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
      }

      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Token refresh failed");
    }
  }
);

// Async thunks
export const login = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await clientApi.adminLogin(email, password);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Login failed");
    }
  }
);

// Admin login action
export const loginAdmin = createAsyncThunk(
  "auth/loginAdmin",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await clientApi.adminLogin(email, password);
      return response.data;
    } catch (error: unknown) {
      // Check HTTP status codes first — clientApi attaches response metadata
      // so generic Error handling does not mask specific auth messages.
      const apiError = error as {
        response?: { status?: number; data?: { message?: string } };
        message?: string;
      };

      if (apiError.response?.status === 401) {
        return rejectWithValue("Email hoặc mật khẩu không đúng");
      } else if (apiError.response?.status === 403) {
        return rejectWithValue("Tài khoản không có quyền truy cập admin");
      } else if (apiError.response?.status && apiError.response.status >= 500) {
        return rejectWithValue("Lỗi server, vui lòng thử lại sau");
      } else if (apiError.response?.data?.message) {
        return rejectWithValue(apiError.response.data.message);
      } else if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Đăng nhập thất bại");
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await clientApi.logout();
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Logout failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSessionChecked: (state) => {
      state.sessionChecked = true;
      state.loading = false;
    },
    setTokens: (
      state,
      action: PayloadAction<{ token: string; refreshToken?: string }>
    ) => {
      state.token = action.payload.token;
      // Refresh token chỉ được manage bởi cookie, không lưu trong state
      if (typeof window !== "undefined") {
        localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, action.payload.token);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Session check
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;

        // Check if payload has token (from session restore)
        const payload = action.payload as {
          user: { id: string; email: string; name: string; role: string };
          token?: string;
        };

        if (payload.token) {
          state.token = payload.token;
          // Update localStorage with new token
          if (typeof window !== "undefined") {
            localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, payload.token);
          }
        }

        // If token exists in state, decode user info from it
        if (state.token) {
          const userFromToken = getUserFromToken(state.token);
          state.user = userFromToken || {
            ...payload.user,
            role: payload.user.role || "user",
          };
        } else {
          state.user = payload.user;
        }

        state.sessionChecked = true;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.sessionChecked = true;
        if (typeof window !== "undefined") {
          localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
        }
      })
      // Token refresh
      .addCase(refreshAuthToken.fulfilled, (state, action) => {
        state.token = action.payload.token;
        // Refresh token chỉ ở cookie
        if (typeof window !== "undefined") {
          localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, action.payload.token);
        }
      })
      .addCase(refreshAuthToken.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        if (typeof window !== "undefined") {
          localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
        }
      })
      // Regular login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;

        // Decode user info from token
        const userFromToken = getUserFromToken(action.payload.token);
        state.user = userFromToken || {
          ...action.payload.user,
          role: "user", // default role if not in token
        };

        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken ?? null;
        if (typeof window !== "undefined") {
          localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, action.payload.token);
          // Refresh token chỉ ở cookie
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Admin login
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;

        // Decode user info from token
        const userFromToken = getUserFromToken(action.payload.token);
        state.user = userFromToken || {
          ...action.payload.user,
          role: "admin", // default admin role if not in token
        };

        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken ?? null;
        if (typeof window !== "undefined") {
          localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, action.payload.token);
          // Refresh token chỉ ở cookie
        }
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        if (typeof window !== "undefined") {
          localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
        }
      });
  },
});

export const { clearError, setTokens, setSessionChecked } = authSlice.actions;
export default authSlice.reducer;
