"use client";


import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useReducer,
  useSyncExternalStore,
} from "react";
import { usePathname, useRouter } from "@/i18n/routing";
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

interface UseProductsOptions {
  /** Initial filter option lists pre-fetched on the server (SSR) */
  initialCategories?: Category[];
  initialColors?: Color[];
  initialCapacities?: Capacity[];
  searchParams?: SearchParamReader;
}

interface ProductFilterState {
  searchQuery: string;
  debouncedSearchQuery: string;
  selectedCategory: string;
  selectedColor: string;
  capacityRange: CapacityRange;
  showFilters: boolean;
  sortBy: string;
  currentPage: number;
}

type ProductFilterAction =
  | { type: "SYNC_FROM_URL"; payload: ProductFilterState }
  | { type: "CLEAR_FILTERS" }
  | { type: "SET_SEARCH_QUERY"; payload: React.SetStateAction<string> }
  | { type: "SET_DEBOUNCED_SEARCH_QUERY"; payload: string }
  | { type: "SET_SELECTED_CATEGORY"; payload: React.SetStateAction<string> }
  | { type: "SET_SELECTED_COLOR"; payload: React.SetStateAction<string> }
  | {
      type: "SET_CAPACITY_RANGE";
      payload: React.SetStateAction<CapacityRange>;
    }
  | { type: "SET_SHOW_FILTERS"; payload: React.SetStateAction<boolean> }
  | { type: "SET_SORT_BY"; payload: React.SetStateAction<string> }
  | { type: "SET_CURRENT_PAGE"; payload: React.SetStateAction<number> };

type SearchParamReader = {
  get(name: string): string | null;
};

const DEFAULT_SEARCH_PARAMS: SearchParamReader = {
  get: () => null,
};

const DEFAULT_FILTER_STATE: ProductFilterState = {
  searchQuery: "",
  debouncedSearchQuery: "",
  selectedCategory: "",
  selectedColor: "",
  capacityRange: { min: 0, max: 9999 },
  showFilters: false,
  sortBy: "featured",
  currentPage: 1,
};

function resolveStateValue<T>(value: React.SetStateAction<T>, current: T): T {
  return typeof value === "function"
    ? (value as (previous: T) => T)(current)
    : value;
}

function getFilterStateFromSearchParams(
  searchParams: SearchParamReader
): ProductFilterState {
  const search = searchParams.get("search") || "";

  return {
    searchQuery: search,
    debouncedSearchQuery: search,
    selectedCategory: searchParams.get("category") || "",
    selectedColor: searchParams.get("color") || "",
    capacityRange: {
      min: parseInt(searchParams.get("minCapacity") || "0"),
      max: parseInt(searchParams.get("maxCapacity") || "9999"),
    },
    showFilters: false,
    sortBy: searchParams.get("sort") || "featured",
    currentPage: parseInt(searchParams.get("page") || "1"),
  };
}

function productFilterReducer(
  state: ProductFilterState,
  action: ProductFilterAction
): ProductFilterState {
  switch (action.type) {
    case "SYNC_FROM_URL":
      return {
        ...action.payload,
        showFilters: state.showFilters,
      };
    case "CLEAR_FILTERS":
      return {
        ...DEFAULT_FILTER_STATE,
        showFilters: state.showFilters,
      };
    case "SET_SEARCH_QUERY":
      return {
        ...state,
        searchQuery: resolveStateValue(action.payload, state.searchQuery),
      };
    case "SET_DEBOUNCED_SEARCH_QUERY":
      return { ...state, debouncedSearchQuery: action.payload };
    case "SET_SELECTED_CATEGORY":
      return {
        ...state,
        selectedCategory: resolveStateValue(
          action.payload,
          state.selectedCategory
        ),
      };
    case "SET_SELECTED_COLOR":
      return {
        ...state,
        selectedColor: resolveStateValue(action.payload, state.selectedColor),
      };
    case "SET_CAPACITY_RANGE":
      return {
        ...state,
        capacityRange: resolveStateValue(action.payload, state.capacityRange),
      };
    case "SET_SHOW_FILTERS":
      return {
        ...state,
        showFilters: resolveStateValue(action.payload, state.showFilters),
      };
    case "SET_SORT_BY":
      return {
        ...state,
        sortBy: resolveStateValue(action.payload, state.sortBy),
      };
    case "SET_CURRENT_PAGE":
      return {
        ...state,
        currentPage: resolveStateValue(action.payload, state.currentPage),
      };
    default:
      return state;
  }
}

export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const {
    initialCategories = [],
    initialColors = [],
    initialCapacities = [],
    searchParams = DEFAULT_SEARCH_PARAMS,
  } = options;

  const router = useRouter();
  const pathname = usePathname();

  const [filterState, filterDispatch] = useReducer(
    productFilterReducer,
    searchParams,
    getFilterStateFromSearchParams
  );
  const {
    searchQuery,
    debouncedSearchQuery,
    selectedCategory,
    selectedColor,
    capacityRange,
    showFilters,
    sortBy,
    currentPage,
  } = filterState;
  const isHydrated = useSyncExternalStore(() => () => {}, () => true, () => false);

  // Filter options data — initialized from SSR props to avoid client-side waterfall fetch
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [colors, setColors] = useState<Color[]>(initialColors);
  const [capacities, setCapacities] = useState<Capacity[]>(initialCapacities);

  // Suppress unused-variable warning — these setters are kept for potential
  // future use (e.g., optimistic updates when admin adds a new category).
  void setCategories;
  void setColors;
  void setCapacities;

  // Debounce timer refs
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const searchDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const setSearchQuery = useCallback(
    (value: React.SetStateAction<string>) => {
      filterDispatch({ type: "SET_SEARCH_QUERY", payload: value });
    },
    []
  );

  const setSelectedCategory = useCallback(
    (value: React.SetStateAction<string>) => {
      filterDispatch({ type: "SET_SELECTED_CATEGORY", payload: value });
    },
    []
  );

  const setSelectedColor = useCallback(
    (value: React.SetStateAction<string>) => {
      filterDispatch({ type: "SET_SELECTED_COLOR", payload: value });
    },
    []
  );

  const setCapacityRange = useCallback(
    (value: React.SetStateAction<CapacityRange>) => {
      filterDispatch({ type: "SET_CAPACITY_RANGE", payload: value });
    },
    []
  );

  const setShowFilters = useCallback(
    (value: React.SetStateAction<boolean>) => {
      filterDispatch({ type: "SET_SHOW_FILTERS", payload: value });
    },
    []
  );

  const setSortBy = useCallback((value: React.SetStateAction<string>) => {
    filterDispatch({ type: "SET_SORT_BY", payload: value });
  }, []);

  const setCurrentPage = useCallback((value: React.SetStateAction<number>) => {
    filterDispatch({ type: "SET_CURRENT_PAGE", payload: value });
  }, []);

  // Debounce search query for API calls (500ms delay)
  useEffect(() => {
    if (searchDebounceTimerRef.current) {
      clearTimeout(searchDebounceTimerRef.current);
    }

    searchDebounceTimerRef.current = setTimeout(() => {
      filterDispatch({
        type: "SET_DEBOUNCED_SEARCH_QUERY",
        payload: searchQuery,
      });
    }, 500);

    return () => {
      const timer = searchDebounceTimerRef.current;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [searchQuery]);

  // Sync state with URL params when they change
  useEffect(() => {
    if (!isHydrated) return; // Wait for hydration

    filterDispatch({
      type: "SYNC_FROM_URL",
      payload: getFilterStateFromSearchParams(searchParams),
    });
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
        ? `${pathname}?${params.toString()}`
        : pathname;
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
      pathname,
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
    const currentTimer = debounceTimerRef.current;
    return () => {
      if (currentTimer) {
        clearTimeout(currentTimer);
      }
    };
  }, []);

  const clearFilters = () => {
    filterDispatch({ type: "CLEAR_FILTERS" });
    router.replace(pathname, { scroll: false });
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
