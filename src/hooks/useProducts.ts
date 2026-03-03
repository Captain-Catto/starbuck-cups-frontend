"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { Category, Color, Capacity, CapacityRange } from "@/types";

interface UseProductsReturn {
  // Filter options data
  categories: Category[];
  colors: Color[];
  capacities: Capacity[];

  // State
  isHydrated: boolean;
  searchQuery: string;
  debouncedSearchQuery: string;
  selectedCategory: string;
  selectedColor: string;
  capacityRange: CapacityRange;
  showFilters: boolean;
  sortBy: string;
  currentPage: number;

  // Computed
  hasActiveFilters: boolean;

  // Actions
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
  setSelectedColor: React.Dispatch<React.SetStateAction<string>>;
  setCapacityRange: React.Dispatch<React.SetStateAction<CapacityRange>>;
  setShowFilters: React.Dispatch<React.SetStateAction<boolean>>;
  setSortBy: React.Dispatch<React.SetStateAction<string>>;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  clearFilters: () => void;
  updateURL: (newFilters: {
    search?: string;
    category?: string;
    color?: string;
    minCapacity?: number;
    maxCapacity?: number;
    sort?: string;
    page?: number;
  }) => void;
  debouncedUpdateURL: (newFilters: {
    search?: string;
    category?: string;
    color?: string;
    minCapacity?: number;
    maxCapacity?: number;
    sort?: string;
    page?: number;
  }) => void;
}

export function useProducts(): UseProductsReturn {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Local state
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || ""
  );
  const [selectedColor, setSelectedColor] = useState(
    searchParams.get("color") || ""
  );
  const [capacityRange, setCapacityRange] = useState<CapacityRange>({
    min: parseInt(searchParams.get("minCapacity") || "0"),
    max: parseInt(searchParams.get("maxCapacity") || "9999"),
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "featured");
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1")
  );
  const [isHydrated, setIsHydrated] = useState(false);

  // Filter options data from API
  const [categories, setCategories] = useState<Category[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [capacities, setCapacities] = useState<Capacity[]>([]);

  // Debounce timer refs
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const searchDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch filter options (categories, colors, capacities)
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // Fetch categories
        const categoriesRes = await fetch("/api/categories");
        const categoriesData = await categoriesRes.json();

        if (
          categoriesData.success &&
          categoriesData.data?.items &&
          Array.isArray(categoriesData.data.items)
        ) {
          setCategories(categoriesData.data.items);
        }

        // Fetch colors
        const colorsRes = await fetch("/api/colors");
        const colorsData = await colorsRes.json();

        if (
          colorsData.success &&
          colorsData.data?.items &&
          Array.isArray(colorsData.data.items)
        ) {
          setColors(colorsData.data.items);
        }

        // Fetch capacities
        const capacitiesRes = await fetch("/api/capacities");
        const capacitiesData = await capacitiesRes.json();

        if (
          capacitiesData.success &&
          capacitiesData.data?.items &&
          Array.isArray(capacitiesData.data.items)
        ) {
          setCapacities(capacitiesData.data.items);
        }
      } catch {
        // Silently handle fetch errors
      }
    };

    fetchFilterOptions();
  }, []);

  // Wait for hydration to avoid mismatch
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Debounce search query for API calls (500ms delay)
  useEffect(() => {
    if (searchDebounceTimerRef.current) {
      clearTimeout(searchDebounceTimerRef.current);
    }

    searchDebounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => {
      if (searchDebounceTimerRef.current) {
        clearTimeout(searchDebounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  // Sync state with URL params when they change
  useEffect(() => {
    if (!isHydrated) return; // Wait for hydration

    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const color = searchParams.get("color") || "";
    const minCapacity = parseInt(searchParams.get("minCapacity") || "0");
    const maxCapacity = parseInt(searchParams.get("maxCapacity") || "9999");
    const sort = searchParams.get("sort") || "featured";
    const page = parseInt(searchParams.get("page") || "1");

    // Update state to match URL params
    setSearchQuery(search);
    setDebouncedSearchQuery(search); // Also update debounced version immediately when URL changes
    setSelectedCategory(category);
    setSelectedColor(color);
    //chỉ update khi capacity range thay đổi, nếu ko sẽ trigger render
    setCapacityRange((prev) => {
      if (prev.min !== minCapacity || prev.max !== maxCapacity) {
        return { min: minCapacity, max: maxCapacity };
      }
      return prev;
    });
    setSortBy(sort);
    setCurrentPage(page);
  }, [searchParams, isHydrated]);

  // Update URL with current filter state
  const updateURL = useCallback(
    (newFilters: {
      search?: string;
      category?: string;
      color?: string;
      minCapacity?: number;
      maxCapacity?: number;
      sort?: string;
      page?: number;
    }) => {
      const params = new URLSearchParams();

      const search = "search" in newFilters ? newFilters.search : searchQuery;
      const category =
        "category" in newFilters ? newFilters.category : selectedCategory;
      const color = "color" in newFilters ? newFilters.color : selectedColor;
      const minCapacity =
        "minCapacity" in newFilters
          ? newFilters.minCapacity
          : capacityRange.min;
      const maxCapacity =
        "maxCapacity" in newFilters
          ? newFilters.maxCapacity
          : capacityRange.max;
      const sort = "sort" in newFilters ? newFilters.sort : sortBy;
      const page = "page" in newFilters ? newFilters.page : currentPage;

      if (search) params.set("search", search);
      if (category) params.set("category", category);
      if (color) params.set("color", color);
      if (minCapacity !== undefined && minCapacity > 0)
        params.set("minCapacity", minCapacity.toString());
      if (maxCapacity !== undefined && maxCapacity < 9999)
        params.set("maxCapacity", maxCapacity.toString());
      if (sort && sort !== "featured") params.set("sort", sort);
      if (page && page !== 1) params.set("page", page.toString());

      const newURL = params.toString()
        ? `/products?${params.toString()}`
        : "/products";
      router.replace(newURL, { scroll: false });
    },
    [
      searchQuery,
      selectedCategory,
      selectedColor,
      capacityRange,
      sortBy,
      currentPage,
      router,
    ]
  );

  // Debounced version of updateURL (300ms delay)
  const debouncedUpdateURL = useCallback(
    (newFilters: {
      search?: string;
      category?: string;
      color?: string;
      minCapacity?: number;
      maxCapacity?: number;
      sort?: string;
      page?: number;
    }) => {
      // Clear previous timeout
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new timeout
      debounceTimerRef.current = setTimeout(() => {
        updateURL(newFilters);
      }, 300);
    },
    [updateURL]
  );

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedColor("");
    setCapacityRange({ min: 0, max: 9999 });
    setSortBy("featured");
    setCurrentPage(1);
    router.replace("/products", { scroll: false });
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedCategory !== "" ||
    selectedColor !== "" ||
    capacityRange.min > 0 ||
    capacityRange.max < 9999 ||
    sortBy !== "featured";

  return {
    // Filter options data
    categories,
    colors,
    capacities,

    // State
    isHydrated,
    searchQuery,
    debouncedSearchQuery,
    selectedCategory,
    selectedColor,
    capacityRange,
    showFilters,
    sortBy,
    currentPage,

    // Computed
    hasActiveFilters,

    // Actions
    setSearchQuery,
    setSelectedCategory,
    setSelectedColor,
    setCapacityRange,
    setShowFilters,
    setSortBy,
    setCurrentPage,
    clearFilters,
    updateURL,
    debouncedUpdateURL,
  };
}
