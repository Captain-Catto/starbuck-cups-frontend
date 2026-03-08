"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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

export const useProductAnalytics = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyticsSummary = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/analytics/summary", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch analytics summary: ${response.statusText}`
        );
      }

      const data = await response.json();

      if (data.success) {
        setSummary(data.data);
      } else {
        throw new Error(data.message || "Failed to fetch analytics summary");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsSummary();
  }, []);

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
  const [products, setProducts] = useState<ProductAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestControllerRef = useRef<AbortController | null>(null);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  const fetchTopClicked = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    if (requestControllerRef.current) {
      requestControllerRef.current.abort();
    }

    const controller = new AbortController();
    requestControllerRef.current = controller;

    try {
      setLoading(true);
      setError(null);

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
        setProducts(data.data);
      } else {
        throw new Error(data.message || "Failed to fetch top clicked products");
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }

      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [enabled, limit, page, getAuthHeaders]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    fetchTopClicked();
  }, [enabled, fetchTopClicked]);

  useEffect(() => {
    return () => {
      if (requestControllerRef.current) {
        requestControllerRef.current.abort();
      }
    };
  }, []);

  return {
    products,
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
  const [products, setProducts] = useState<ProductAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestControllerRef = useRef<AbortController | null>(null);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  const fetchTopConversion = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    if (requestControllerRef.current) {
      requestControllerRef.current.abort();
    }

    const controller = new AbortController();
    requestControllerRef.current = controller;

    try {
      setLoading(true);
      setError(null);

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
        setProducts(data.data);
      } else {
        throw new Error(
          data.message || "Failed to fetch top conversion products"
        );
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }

      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [enabled, limit, page, getAuthHeaders]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    fetchTopConversion();
  }, [enabled, fetchTopConversion]);

  useEffect(() => {
    return () => {
      if (requestControllerRef.current) {
        requestControllerRef.current.abort();
      }
    };
  }, []);

  return {
    products,
    loading,
    error,
    refetch: fetchTopConversion,
  };
};
