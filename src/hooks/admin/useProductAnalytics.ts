"use client";

import { useReducer, useEffect, useCallback, useRef } from "react";
import { useAppSelector } from "@/store";

export interface ProductAnalytics {
  productId: string;
  productName?: string;
  clickCount: number;
  addToCartCount: number;
  conversionRate: number;
  lastClicked?: string;
  lastAddedToCart?: string;
  productSlug?: string;
}

export interface AnalyticsSummary {
  totalClicks: number;
  totalAddToCarts: number;
  overallConversionRate: number;
  topClickedProducts: ProductAnalytics[];
  topConversionProducts: ProductAnalytics[];
  uniqueProductsClicked: number;
  uniqueProductsAddedToCart: number;
}

interface SummaryState {
  summary: AnalyticsSummary | null;
  loading: boolean;
  error: string | null;
}

type SummaryAction =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: AnalyticsSummary }
  | { type: "FETCH_ERROR"; payload: string };

const initialSummaryState: SummaryState = {
  summary: null,
  loading: true,
  error: null,
};

function summaryReducer(
  state: SummaryState,
  action: SummaryAction
): SummaryState {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return { summary: action.payload, loading: false, error: null };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

interface ProductAnalyticsListState {
  products: ProductAnalytics[];
  totalPages: number;
  loading: boolean;
  error: string | null;
}

type ProductAnalyticsListAction =
  | { type: "FETCH_START" }
  | {
      type: "FETCH_SUCCESS";
      products: ProductAnalytics[];
      totalPages: number;
    }
  | { type: "FETCH_ERROR"; payload: string }
  | { type: "DISABLED" };

const initialProductAnalyticsListState: ProductAnalyticsListState = {
  products: [],
  totalPages: 1,
  loading: true,
  error: null,
};

function productAnalyticsListReducer(
  state: ProductAnalyticsListState,
  action: ProductAnalyticsListAction
): ProductAnalyticsListState {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return {
        products: action.products,
        totalPages: action.totalPages,
        loading: false,
        error: null,
      };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };
    case "DISABLED":
      return { ...state, loading: false };
    default:
      return state;
  }
}

export const useProductAnalytics = () => {
  const [{ summary, loading, error }, dispatch] = useReducer(
    summaryReducer,
    initialSummaryState
  );

  const fetchAnalyticsSummary = useCallback(async () => {
    try {
      dispatch({ type: "FETCH_START" });

      const response = await fetch("/api/analytics/summary", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics summary: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        dispatch({ type: "FETCH_SUCCESS", payload: data.data });
      } else {
        throw new Error(data.message || "Failed to fetch analytics summary");
      }
    } catch (err) {
      dispatch({
        type: "FETCH_ERROR",
        payload: err instanceof Error ? err.message : "Unknown error occurred",
      });
    }
  }, []);

  useEffect(() => {
    fetchAnalyticsSummary();
  }, [fetchAnalyticsSummary]);

  return {
    summary,
    loading,
    error,
    refetch: fetchAnalyticsSummary,
  };
};

export const useTopClickedProducts = (
  limit: number = 10,
  page: number = 1,
  enabled: boolean = true
) => {
  const { token } = useAppSelector((state) => state.auth);
  const [{ products, totalPages, loading, error }, dispatch] = useReducer(
    productAnalyticsListReducer,
    initialProductAnalyticsListState
  );
  const requestControllerRef = useRef<AbortController | null>(null);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  const fetchTopClicked = useCallback(async () => {
    if (!enabled) {
      dispatch({ type: "DISABLED" });
      return;
    }

    if (requestControllerRef.current) {
      requestControllerRef.current.abort();
    }

    const controller = new AbortController();
    requestControllerRef.current = controller;

    try {
      dispatch({ type: "FETCH_START" });

      const response = await fetch(
        `/api/analytics/top-clicked?limit=${limit}&page=${page}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch top clicked products: ${response.statusText}`
        );
      }

      const data = await response.json();

      if (data.success) {
        dispatch({
          type: "FETCH_SUCCESS",
          products: data.data,
          totalPages: data.pagination?.totalPages ?? 1,
        });
      } else {
        throw new Error(data.message || "Failed to fetch top clicked products");
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }

      dispatch({
        type: "FETCH_ERROR",
        payload: err instanceof Error ? err.message : "Unknown error occurred",
      });
    }
  }, [enabled, limit, page, getAuthHeaders]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    fetchTopClicked();
  }, [enabled, fetchTopClicked]);

  useEffect(() => {
    const controller = requestControllerRef.current;
    return () => {
      if (controller) {
        controller.abort();
      }
    };
  }, []);

  return {
    products,
    totalPages,
    loading,
    error,
    refetch: fetchTopClicked,
  };
};

export const useTopConversionProducts = (
  limit: number = 10,
  page: number = 1,
  enabled: boolean = true
) => {
  const { token } = useAppSelector((state) => state.auth);
  const [{ products, totalPages, loading, error }, dispatch] = useReducer(
    productAnalyticsListReducer,
    initialProductAnalyticsListState
  );
  const requestControllerRef = useRef<AbortController | null>(null);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  const fetchTopConversion = useCallback(async () => {
    if (!enabled) {
      dispatch({ type: "DISABLED" });
      return;
    }

    if (requestControllerRef.current) {
      requestControllerRef.current.abort();
    }

    const controller = new AbortController();
    requestControllerRef.current = controller;

    try {
      dispatch({ type: "FETCH_START" });

      const response = await fetch(
        `/api/analytics/top-conversion?limit=${limit}&page=${page}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch top conversion products: ${response.statusText}`
        );
      }

      const data = await response.json();

      if (data.success) {
        dispatch({
          type: "FETCH_SUCCESS",
          products: data.data,
          totalPages: data.pagination?.totalPages ?? 1,
        });
      } else {
        throw new Error(
          data.message || "Failed to fetch top conversion products"
        );
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }

      dispatch({
        type: "FETCH_ERROR",
        payload: err instanceof Error ? err.message : "Unknown error occurred",
      });
    }
  }, [enabled, limit, page, getAuthHeaders]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    fetchTopConversion();
  }, [enabled, fetchTopConversion]);

  useEffect(() => {
    const controller = requestControllerRef.current;
    return () => {
      if (controller) {
        controller.abort();
      }
    };
  }, []);

  return {
    products,
    totalPages,
    loading,
    error,
    refetch: fetchTopConversion,
  };
};
