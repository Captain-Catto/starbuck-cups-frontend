import { useEffect, useCallback, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { checkAuthStatus, logout } from "@/store/slices/authSlice";
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
        // No tokens found - mark session as checked but not authenticated

        // Manually set sessionChecked to true by dispatching a rejected action
        dispatch(checkAuthStatus()).catch(() => {
          // Expected to fail when no tokens, this will set sessionChecked = true
        });
      }
    } catch (error) {

    } finally {
      initializationRef.current = false;
    }
  }, [dispatch]);

  // Initialize auth on mount and check periodically for token changes
  useEffect(() => {
    if (!sessionChecked) {
      initializeAuth();
    }
  }, [initializeAuth, sessionChecked]);

  // Check for token removal (user manually cleared localStorage/cookies)
  useEffect(() => {
    if (!sessionChecked) return;

    const interval = setInterval(() => {
      const currentToken = localStorage.getItem("admin_token");
      const hasRefreshCookie = document.cookie.includes("admin_refresh_token");

      // If we think we're authenticated but have no tokens, re-check auth
      if (isAuthenticated && !currentToken && !hasRefreshCookie) {

        dispatch(checkAuthStatus());
      }
    }, 1000); // Check every second

    return () => clearInterval(interval);
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