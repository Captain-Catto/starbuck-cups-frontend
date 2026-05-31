"use client";

import type { Product } from "@/types";

export const SEARCH_HISTORY_KEY = "starbucks-search-history";
export const RECENTLY_VIEWED_KEY = "starbucks-recently-viewed";

export const getSearchHistory = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveSearchTermToStorage = (term: string): string[] | undefined => {
  if (typeof window === "undefined" || !term.trim()) return;
  const history = getSearchHistory();
  const newHistory = [
    term.trim(),
    ...history.filter((t) => t.toLowerCase() !== term.trim().toLowerCase()),
  ].slice(0, 8);
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
  return newHistory;
};

export const getRecentlyViewed = (): Product[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveRecentlyViewedProduct = (product: Product): Product[] | undefined => {
  if (typeof window === "undefined") return;
  const history = getRecentlyViewed();
  const newHistory = [
    product,
    ...history.filter((p) => p.id !== product.id),
  ].slice(0, 8);
  localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(newHistory));
  return newHistory;
};
