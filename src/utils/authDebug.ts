import { TokenRefreshNotification } from "./tokenNotification";

/**
 * Debug utilities for authentication system
 * Use in development to monitor timer status and performance
 */
export class AuthDebug {
  private static isDebugEnabled = process.env.NODE_ENV === "development";

  /**
   * Log current timer status
   */
  static logTimerStatus() {
    if (!this.isDebugEnabled) return;

    const status = TokenRefreshNotification.getTimerStatus();
    console.group("🔍 Auth Timer Status");
    console.table(status);
    console.groupEnd();
  }

  /**
   * Monitor memory usage của authentication system
   */
  static logMemoryUsage() {
    if (!this.isDebugEnabled || typeof window === "undefined") return;

    const memory = (performance as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
    if (!memory) {

      return;
    }

    console.group("💾 Auth Memory Usage");



    console.groupEnd();
  }

  /**
   * Check for potential memory leaks
   */
  static checkForLeaks() {
    if (!this.isDebugEnabled) return;

    const status = TokenRefreshNotification.getTimerStatus();
    const activeTimers = Object.values(status).filter(val => typeof val === "boolean" && val).length;

    if (activeTimers > 2) {

      this.logTimerStatus();
    } else {

    }
  }

  /**
   * Performance monitoring for auth operations
   */
  static timeOperation<T>(name: string, operation: () => Promise<T>): Promise<T> {
    if (!this.isDebugEnabled) {
      return operation();
    }

    const startTime = performance.now();
    console.time(`⏱️ Auth Operation: ${name}`);

    return operation().finally(() => {
      const duration = performance.now() - startTime;
      console.timeEnd(`⏱️ Auth Operation: ${name}`);

      if (duration > 1000) {

      }
    });
  }

  /**
   * Setup periodic monitoring
   */
  static startMonitoring(intervalMs: number = 30000) { // 30 seconds
    if (!this.isDebugEnabled) return;

    const monitorInterval = setInterval(() => {
      this.checkForLeaks();
      this.logMemoryUsage();
    }, intervalMs);

    // Return cleanup function
    return () => {
      clearInterval(monitorInterval);

    };
  }

  /**
   * Log authentication event
   */
  static logEvent(event: string, details?: Record<string, unknown>) {
    if (!this.isDebugEnabled) return;

    console.group(`🔐 Auth Event: ${event}`);
    if (details) {

    }

    this.logTimerStatus();
    console.groupEnd();
  }

  /**
   * Force cleanup and log results
   */
  static forceCleanup() {
    if (!this.isDebugEnabled) return;

    const beforeStatus = TokenRefreshNotification.getTimerStatus();

    TokenRefreshNotification.cleanup();

    const afterStatus = TokenRefreshNotification.getTimerStatus();

    console.group("🧹 Cleanup Results");


    console.groupEnd();
  }
}

// Global debug functions cho console
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as { authDebug?: typeof AuthDebug }).authDebug = AuthDebug;

}