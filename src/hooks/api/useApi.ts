"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface UseApiOptions {
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

export interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (url: string, options?: RequestInit) => Promise<T>;
  reset: () => void;
}

export function useApi<T = unknown>(options: UseApiOptions = {}): UseApiReturn<T> {
  const {
    showSuccessToast = false,
    showErrorToast = true,
    successMessage,
    errorMessage,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = (): Record<string, string> => {
    if (typeof window === "undefined") return {};
    const token = localStorage.getItem("admin_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const execute = useCallback(async (url: string, options: RequestInit = {}): Promise<T> => {
    try {
      setLoading(true);
      setError(null);

      const headers = {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
        ...options.headers,
      };

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<T> = await response.json();

      if (!result.success) {
        throw new Error(result.message || result.error || "API request failed");
      }

      setData(result.data || null);

      if (showSuccessToast) {
        toast.success(successMessage || result.message || "Thao tác thành công");
      }

      return result.data as T;

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Có lỗi xảy ra";
      setError(errorMsg);

      if (showErrorToast) {
        toast.error(errorMessage || errorMsg);
      }

      throw err;
    } finally {
      setLoading(false);
    }
  }, [showSuccessToast, showErrorToast, successMessage, errorMessage]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}

// Specific hooks for common operations
export function useApiPost<T = unknown>(options?: UseApiOptions) {
  return useApi<T>({ showSuccessToast: true, ...options });
}

export function useApiPut<T = unknown>(options?: UseApiOptions) {
  return useApi<T>({ showSuccessToast: true, ...options });
}

export function useApiDelete<T = unknown>(options?: UseApiOptions) {
  return useApi<T>({
    showSuccessToast: true,
    successMessage: "Xóa thành công",
    ...options
  });
}