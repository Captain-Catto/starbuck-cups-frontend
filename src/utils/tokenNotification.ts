import { toast } from "sonner";

// Token refresh notification service
export class TokenRefreshNotification {
  private static hasShownRefreshNotification = false;
  private static isRedirecting = false; // Flag để prevent multiple redirects
  private static refreshSuccessTimer: NodeJS.Timeout | null = null;
  private static redirectTimer: NodeJS.Timeout | null = null;

  static showRefreshSuccess() {
    // Silent refresh - không hiển thị thông báo

    this.hasShownRefreshNotification = true;

    // Clear existing timer trước khi tạo mới
    if (this.refreshSuccessTimer) {
      clearTimeout(this.refreshSuccessTimer);
    }

    // Reset flag sau 5 phút
    this.refreshSuccessTimer = setTimeout(() => {
      this.hasShownRefreshNotification = false;
      this.refreshSuccessTimer = null;
    }, 5 * 60 * 1000);
  }

  static showRefreshError() {
    toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", {
      duration: 4000,
      position: "bottom-right",
    });
  }

  static showRefreshErrorWithRedirect(redirectUrl: string = "/admin/login") {
    // Prevent multiple concurrent redirects
    if (this.isRedirecting) {

      return;
    }

    this.isRedirecting = true;

    toast.error("Phiên đăng nhập đã hết hạn. Đang chuyển hướng...", {
      duration: 3000,
      position: "bottom-right",
    });

    // Clear existing redirect timer
    if (this.redirectTimer) {
      clearTimeout(this.redirectTimer);
    }

    // Delay redirect để user có thể đọc thông báo
    this.redirectTimer = setTimeout(() => {
      window.location.href = redirectUrl;
      this.redirectTimer = null;
      this.isRedirecting = false; // Reset sau khi redirect
    }, 3500); // 3.5 giây sau khi toast hiện
  }

  static showSessionExpiredWithRedirect(redirectUrl: string = "/admin/login") {
    // Prevent multiple concurrent redirects
    if (this.isRedirecting) {

      return;
    }

    this.isRedirecting = true;

    toast.error("Phiên đăng nhập không hợp lệ. Đang chuyển hướng...", {
      duration: 3000,
      position: "bottom-right",
    });

    // Clear existing redirect timer
    if (this.redirectTimer) {
      clearTimeout(this.redirectTimer);
    }

    // Delay redirect để user có thể đọc thông báo
    this.redirectTimer = setTimeout(() => {
      window.location.href = redirectUrl;
      this.redirectTimer = null;
      this.isRedirecting = false; // Reset sau khi redirect
    }, 3500); // 3.5 giây sau khi toast hiện
  }

  static showTokenExpiring() {
    // Silent token expiration handling - không hiển thị thông báo

  }

  // Method để cleanup tất cả timers - gọi khi logout hoặc unmount
  static cleanup() {
    if (this.refreshSuccessTimer) {
      clearTimeout(this.refreshSuccessTimer);
      this.refreshSuccessTimer = null;
    }

    if (this.redirectTimer) {
      clearTimeout(this.redirectTimer);
      this.redirectTimer = null;
    }

    // Reset tất cả flags
    this.hasShownRefreshNotification = false;
    this.isRedirecting = false;

  }

  // Method để check timer status (useful for debugging)
  static getTimerStatus() {
    return {
      refreshSuccessTimer: !!this.refreshSuccessTimer,
      redirectTimer: !!this.redirectTimer,
      hasShownRefreshNotification: this.hasShownRefreshNotification,
      isRedirecting: this.isRedirecting
    };
  }
}

// Hook để hiển thị trạng thái token
export function useTokenStatus() {
  return {
    showRefreshSuccess: TokenRefreshNotification.showRefreshSuccess,
    showRefreshError: TokenRefreshNotification.showRefreshError,
    showRefreshErrorWithRedirect:
      TokenRefreshNotification.showRefreshErrorWithRedirect,
    showSessionExpiredWithRedirect:
      TokenRefreshNotification.showSessionExpiredWithRedirect,
    showTokenExpiring: TokenRefreshNotification.showTokenExpiring,
    cleanup: TokenRefreshNotification.cleanup,
    getTimerStatus: TokenRefreshNotification.getTimerStatus,
  };
}
