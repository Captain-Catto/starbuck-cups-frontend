import { useEffect, useCallback, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  checkAuthStatus,
  refreshAuthToken,
  logout,
} from "@/store/slices/authSlice";
import { decodeJWT, isTokenExpired } from "@/lib/jwt";
import { TokenRefreshNotification } from "@/utils/tokenNotification";
import { AuthDebug } from "@/utils/authDebug";

export function useAuthRefresh() {
  const dispatch = useAppDispatch();
  const { token, refreshToken, isAuthenticated, sessionChecked } =
    useAppSelector((state) => state.auth);

  // Thêm ref để track đang kiểm tra
  const isCheckingRef = useRef(false);

  // Hàm check và refresh token nếu cần với debounce protection
  const checkAndRefreshToken = useCallback(async () => {
    if (typeof window === "undefined") return;

    // Prevent multiple concurrent checks
    if (isCheckingRef.current) {
      console.log("Auth check already in progress, skipping...");
      return;
    }

    try {
      isCheckingRef.current = true;

      const storedToken = localStorage.getItem("admin_token");

      if (!storedToken) {
        // Kiểm tra có refresh token cookie không
        if (!document.cookie.includes("admin_refresh_token")) {
          console.log("No access token and no refresh token cookie found");
          if (isAuthenticated) {
            dispatch(logout());
          }
          return;
        }

        // Không có access token, thử check session bằng refresh token trong cookie
        try {
          console.log("No access token found, checking session...");
          const sessionResult = await dispatch(checkAuthStatus()).unwrap();
          console.log("Session restored successfully");
          return sessionResult;
        } catch {
          console.log("No valid session found");
          if (isAuthenticated) {
            dispatch(logout());
          }
          return;
        }
      }

      try {
        // Kiểm tra token có hết hạn không
        if (isTokenExpired(storedToken)) {
          console.log("Token expired, attempting silent refresh...");
          AuthDebug.logEvent("Token Expired", { storedToken: !!storedToken });
          TokenRefreshNotification.showTokenExpiring();

          try {
            const result = await AuthDebug.timeOperation("Token Refresh (Expired)", async () => {
              return await dispatch(refreshAuthToken()).unwrap();
            });

            TokenRefreshNotification.showRefreshSuccess();
            AuthDebug.logEvent("Token Refresh Success", { method: "expired" });
            console.log("Token refreshed silently");
            return result;
          } catch (error) {
            console.error("Silent token refresh failed:", error);
            AuthDebug.logEvent("Token Refresh Failed", { method: "expired", error });
            TokenRefreshNotification.showRefreshError();
            dispatch(logout());
            throw error;
          }
        }

        // Kiểm tra token có gần hết hạn không (còn dưới 5 phút)
        const payload = decodeJWT(storedToken);
        if (payload && payload.exp) {
          const currentTime = Date.now() / 1000;
          const timeUntilExpiry = payload.exp - currentTime;

          if (timeUntilExpiry < 600) {
            // 10 phút = 600 giây - refresh sớm hơn để đảm bảo mượt mà
            console.log("Token expiring soon, attempting silent refresh...");
            TokenRefreshNotification.showTokenExpiring();

            try {
              const result = await dispatch(refreshAuthToken()).unwrap();
              TokenRefreshNotification.showRefreshSuccess();
              console.log("Token refreshed silently");
              return result;
            } catch (error) {
              console.error("Proactive silent token refresh failed:", error);
              TokenRefreshNotification.showRefreshError();
              dispatch(logout());
              throw error;
            }
          }
        }

        // Token vẫn còn hạn, verify với server nếu chưa check
        if (!sessionChecked) {
          await dispatch(checkAuthStatus()).unwrap();
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        TokenRefreshNotification.showRefreshError();
        dispatch(logout());
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      TokenRefreshNotification.showRefreshError();
      dispatch(logout());
    } finally {
      isCheckingRef.current = false;
    }
  }, [dispatch, isAuthenticated, sessionChecked]);

  // Auto check token khi component mount - chỉ gọi khi có token hoặc có thể có session
  useEffect(() => {
    const storedToken = localStorage.getItem("admin_token");

    // Chỉ check nếu có token trong localStorage hoặc có thể có session cookie
    if (storedToken || document.cookie.includes("admin_refresh_token")) {
      const timer = setTimeout(() => {
        checkAndRefreshToken();
      }, 100); // Delay 100ms để tránh race condition

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty để chỉ chạy 1 lần

  // Setup interval để check token định kỳ (mỗi 3 phút) - check thường xuyên hơn
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      checkAndRefreshToken();
    }, 3 * 60 * 1000); // 3 phút - check thường xuyên hơn để đảm bảo mượt mà

    return () => clearInterval(interval);
  }, [isAuthenticated, checkAndRefreshToken]);

  // Listen for focus event để check token khi user quay lại tab
  useEffect(() => {
    if (!isAuthenticated) return;

    let focusTimer: NodeJS.Timeout | null = null;

    const handleFocus = () => {
      // Clear existing timer nếu có
      if (focusTimer) {
        clearTimeout(focusTimer);
      }

      // Debounce để tránh multiple calls
      focusTimer = setTimeout(() => {
        checkAndRefreshToken();
        focusTimer = null;
      }, 200);
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
      if (focusTimer) {
        clearTimeout(focusTimer);
      }
    };
  }, [isAuthenticated, checkAndRefreshToken]);

  // Cleanup timers khi component unmount
  useEffect(() => {
    return () => {
      AuthDebug.logEvent("Component Unmounting", { cleanup: true });
      TokenRefreshNotification.cleanup();
    };
  }, []);

  return {
    isAuthenticated,
    token,
    refreshToken,
    sessionChecked,
    checkAndRefreshToken,
  };
}

// Hook để sử dụng trong admin layout
export function useAdminAuth() {
  const { isAuthenticated, sessionChecked } = useAuthRefresh();

  return {
    isAuthenticated,
    sessionChecked,
    isLoading: !sessionChecked,
  };
}
