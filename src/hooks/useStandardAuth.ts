import { useEffect, useCallback, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  checkAuthStatus,
  logout,
  setSessionChecked,
} from "@/store/slices/authSlice";
import { useAuthRefresh } from "./useAuthRefresh";
import { TokenRefreshNotification } from "@/utils/tokenNotification";

/**
 * Standardized authentication hook
 * Handles all authentication states and automatic refresh
 * Use this hook instead of useAuthRefresh for consistent behavior
 */
export function useStandardAuth() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, sessionChecked, loading, user, token } =
    useAppSelector((state) => state.auth);

  // Use the auth refresh functionality
  const { checkAndRefreshToken } = useAuthRefresh();

  const initializationRef = useRef(false);

  // Initialize authentication state on first load
  const initializeAuth = useCallback(async () => {
    if (initializationRef.current || typeof window === "undefined") return;

    try {
      initializationRef.current = true;

      const storedToken = localStorage.getItem("admin_token");
      const hasRefreshCookie = document.cookie.includes("admin_refresh_token");

      if (storedToken || hasRefreshCookie) {
        await dispatch(checkAuthStatus()).unwrap();
      } else {
        // No tokens found: avoid an unnecessary API call and mark checked locally
        dispatch(setSessionChecked());
      }
    } catch (error) {
      
    } finally {
      initializationRef.current = false;
    }
  }, [dispatch]);

  // Initialize auth on mount
  useEffect(() => {
    if (!sessionChecked) {
      initializeAuth();
    }
  }, [initializeAuth, sessionChecked]);

  // Re-check auth when tab becomes active again (instead of polling every second).
  useEffect(() => {
    if (!sessionChecked) return;

    const lastVisibilityCheckRef = { current: 0 };

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") {
        return;
      }

      const now = Date.now();
      if (now - lastVisibilityCheckRef.current < 30000) {
        return;
      }
      lastVisibilityCheckRef.current = now;

      // Authenticated sessions are already handled by useAuthRefresh (focus + interval).
      if (!isAuthenticated) {
        dispatch(checkAuthStatus());
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [sessionChecked, isAuthenticated, dispatch]);

  // Provide a standardized logout function
  const performLogout = useCallback(async () => {
    try {
      // Cleanup all notification timers first
      TokenRefreshNotification.cleanup();

      await dispatch(logout()).unwrap();
      // Clear all local storage
      localStorage.removeItem("admin_token");
      // Cookie will be cleared by the backend
    } catch (error) {
      // Force clear local storage even if server call fails
      localStorage.removeItem("admin_token");
      TokenRefreshNotification.cleanup();
    } finally {
      // Always redirect to login page after logout
      window.location.href = "/admin/login";
    }
  }, [dispatch]);

  // Force refresh token manually
  const forceRefresh = useCallback(async () => {
    try {
      await checkAndRefreshToken();
    } catch (error) {
      
      throw error;
    }
  }, [checkAndRefreshToken]);

  return {
    // Authentication state
    isAuthenticated,
    isLoading: loading || !sessionChecked,
    sessionChecked,
    user,
    token,

    // Authentication actions
    logout: performLogout,
    refresh: forceRefresh,
    initialize: initializeAuth,

    // Status helpers
    get isReady() {
      return sessionChecked && !loading;
    },

    get needsAuthentication() {
      return sessionChecked && !loading && !isAuthenticated;
    },

    get isAuthenticating() {
      return loading && !sessionChecked;
    }
  };
}

/**
 * Hook for components that require authentication
 * Will automatically redirect to login if not authenticated
 */
export function useRequireAuth(redirectUrl: string = "/admin/login") {
  const auth = useStandardAuth();

  useEffect(() => {
    if (auth.needsAuthentication) {
      
      window.location.href = redirectUrl;
    }
  }, [auth.needsAuthentication, redirectUrl]);

  return auth;
}

/**
 * Hook for admin pages specifically
 * Includes role checking for admin privileges
 */
export function useAdminAuth(redirectUrl: string = "/admin/login") {
  const auth = useRequireAuth(redirectUrl);

  const hasAdminRole = auth.user && ["SUPER_ADMIN", "ADMIN", "STAFF"].includes(auth.user.role);

  useEffect(() => {
    if (auth.isReady && auth.isAuthenticated && !hasAdminRole) {
      
      window.location.href = redirectUrl;
    }
  }, [auth.isReady, auth.isAuthenticated, hasAdminRole, redirectUrl]);

  return {
    ...auth,
    hasAdminRole,
    get isAdminReady() {
      return auth.isReady && auth.isAuthenticated && hasAdminRole;
    }
  };
}

/**
 * Hook for public pages that can optionally show auth state
 * Won't redirect but provides auth information
 */
export function useOptionalAuth() {
  const auth = useStandardAuth();

  return {
    ...auth,
    isGuest: auth.isReady && !auth.isAuthenticated,
  };
}
