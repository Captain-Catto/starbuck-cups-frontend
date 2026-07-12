import { createSlice } from "@reduxjs/toolkit";
import type { AuthState } from "@/types";

const ADMIN_TOKEN_STORAGE_KEY = "admin_token";

// Lean auth slice for the PUBLIC store. Public pages only ever READ
// state.auth.token (SettingsSocketProvider — so a logged-in admin browsing
// the public site still gets live effect-settings socket updates). All auth
// mutations (login/logout/refresh) happen in the admin tree, which uses the
// full authSlice. Keeping this slice thunk-free avoids bundling
// @/lib/client-api into every public page.
const getInitialState = (): AuthState => ({
  isAuthenticated: false,
  user: null,
  token:
    typeof window !== "undefined"
      ? localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY)
      : null,
  refreshToken: null,
  loading: false,
  error: null,
  sessionChecked: false,
});

const publicAuthSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {},
});

export default publicAuthSlice.reducer;
