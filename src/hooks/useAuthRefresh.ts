import { useEffect, useCallback, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  setTokens,
  logout,
} from "@/store/slices/authSlice";
import { decodeJWT, isTokenExpired } from "@/lib/jwt";
import { TokenRefreshNotification } from "@/utils/tokenNotification";
import { AuthDebug } from "@/utils/authDebug";
import { clientApi } from "@/lib/client-api";

const ADMIN_TOKEN_STORAGE_KEY = "admin_token";

function getStoredAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
}

export function useAuthRefresh() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const refreshToken = useAppSelector((state) => state.auth.refreshToken);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const sessionChecked = useAppSelector((state) => state.auth.sessionChecked);

  // Thêm ref để track đang kiểm tra
  const isCheckingRef = useRef(false);

  // Hàm check và refresh token nếu cần với debounce protection
  const checkAndRefreshToken = useCallback(async () => {
    if (typeof window === "undefined") return;

    // Prevent multiple concurrent checks
    if (isCheckingRef.current) {

      return;
    }

    try {
      isCheckingRef.current = true;

      const storedToken = getStoredAdminToken();

      if (!storedToken) {
        // Không có access token — useStandardAuth.initializeAuth xử lý session restore.
        // Ở đây chỉ cần đảm bảo Redux state phản ánh đúng.
        if (isAuthenticated) {
          dispatch(logout());
        }
        return;
      }

      try {
        // Kiểm tra token có hết hạn không
        if (isTokenExpired(storedToken)) {

          AuthDebug.logEvent("Token Expired", { storedToken: !!storedToken });
          TokenRefreshNotification.showTokenExpiring();

          try {
            const newToken = await AuthDebug.timeOperation("Token Refresh (Expired)", async () => {
              return await clientApi.doProactiveRefresh();
            });

            if (newToken) {
              dispatch(setTokens({ token: newToken }));
              TokenRefreshNotification.showRefreshSuccess();
              AuthDebug.logEvent("Token Refresh Success", { method: "expired" });
              return;
            } else {
              AuthDebug.logEvent("Token Refresh Failed", { method: "expired" });
              TokenRefreshNotification.showRefreshError();
              dispatch(logout());
              return;
            }
          } catch (error) {

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

            TokenRefreshNotification.showTokenExpiring();

            const newToken = await clientApi.doProactiveRefresh();
            if (newToken) {
              dispatch(setTokens({ token: newToken }));
              TokenRefreshNotification.showRefreshSuccess();
              return;
            } else {
              TokenRefreshNotification.showRefreshError();
              dispatch(logout());
              return;
            }
          }
        }

        // Token còn hạn và không cần refresh — useStandardAuth.initializeAuth
        // đã xử lý session check ban đầu, không gọi lại ở đây.
      } catch (error) {

        TokenRefreshNotification.showRefreshError();
        dispatch(logout());
      }
    } catch (error) {

      TokenRefreshNotification.showRefreshError();
      dispatch(logout());
    } finally {
      isCheckingRef.current = false;
    }
  }, [dispatch, isAuthenticated]);

  // Auto check token khi component mount - chỉ gọi khi có token hoặc có thể có session
  useEffect(() => {
    const storedToken = getStoredAdminToken();

    // Chỉ check nếu có access token (session restore được handle bởi useStandardAuth)
    if (storedToken) {
      const timer = setTimeout(() => {
        checkAndRefreshToken();
      }, 100); // Delay 100ms để tránh race condition

      return () => clearTimeout(timer);
    }
  }, [checkAndRefreshToken]);

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

