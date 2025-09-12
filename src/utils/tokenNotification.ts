import { toast } from "sonner";

// Token refresh notification service
export class TokenRefreshNotification {
  private static hasShownRefreshNotification = false;
  private static isRedirecting = false; // Flag để prevent multiple redirects

  static showRefreshSuccess() {
    if (!this.hasShownRefreshNotification) {
      toast.success("Phiên đăng nhập đã được gia hạn tự động", {
        duration: 2000,
        position: "bottom-right",
      });
      this.hasShownRefreshNotification = true;

      // Reset flag sau 5 phút
      setTimeout(() => {
        this.hasShownRefreshNotification = false;
      }, 5 * 60 * 1000);
    }
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
      console.log("Redirect already in progress, skipping...");
      return;
    }

    this.isRedirecting = true;

    toast.error("Phiên đăng nhập đã hết hạn. Đang chuyển hướng...", {
      duration: 3000,
      position: "bottom-right",
    });

    // Delay redirect để user có thể đọc thông báo
    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 3500); // 3.5 giây sau khi toast hiện
  }

  static showSessionExpiredWithRedirect(redirectUrl: string = "/admin/login") {
    // Prevent multiple concurrent redirects
    if (this.isRedirecting) {
      console.log("Redirect already in progress, skipping...");
      return;
    }

    this.isRedirecting = true;

    toast.error("Phiên đăng nhập không hợp lệ. Đang chuyển hướng...", {
      duration: 3000,
      position: "bottom-right",
    });

    // Delay redirect để user có thể đọc thông báo
    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 3500); // 3.5 giây sau khi toast hiện
  }

  static showTokenExpiring() {
    toast.warning("Phiên đăng nhập sắp hết hạn. Đang gia hạn tự động...", {
      duration: 3000,
      position: "bottom-right",
    });
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
  };
}
