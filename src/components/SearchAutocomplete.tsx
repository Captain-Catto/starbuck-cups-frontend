"use client";

import { useRef, useEffect, useReducer, useCallback } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { useAppDispatch } from "@/store";
import { addToCart } from "@/store/slices/cartSlice";
import type { Product } from "@/types";
import { trackAddToCart, trackSearch } from "@/lib/analytics";

// Helper utilities and components import
import {
  getSearchHistory,
  saveSearchTermToStorage,
  getRecentlyViewed,
  saveRecentlyViewedProduct,
} from "@/lib/searchHistory";
import { SearchSuggestionsPanel } from "@/components/search/SearchSuggestionsPanel";
import { TrendingAndHistoryPanel } from "@/components/search/TrendingAndHistoryPanel";

interface SearchAutocompleteProps {
  isOpen: boolean;
  onClose: () => void;
  onProductSelect?: (slug: string) => void;
}

interface SearchState {
  query: string;
  products: Product[];
  isLoading: boolean;
  showSuggestions: boolean;
  searchHistory: string[];
  recentlyViewed: Product[];
  focusedIndex: number;
  hotProducts: Product[];
  hasLoadedHotProducts: boolean;
}

type SearchAction =
  | { type: "SET_QUERY"; payload: string }
  | { type: "SET_PRODUCTS"; payload: Product[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_SHOW_SUGGESTIONS"; payload: boolean }
  | { type: "SET_SEARCH_HISTORY"; payload: string[] }
  | { type: "SET_RECENTLY_VIEWED"; payload: Product[] }
  | { type: "SET_FOCUSED_INDEX"; payload: number }
  | { type: "SET_HOT_PRODUCTS"; payload: Product[] }
  | { type: "SET_HAS_LOADED_HOT_PRODUCTS"; payload: boolean }
  | { type: "OPEN_MODAL"; payload: { history: string[]; viewed: Product[] } }
  | { type: "LOCALE_CHANGE" }
  | { type: "CLEAR_HISTORY"; payload: "search" | "viewed" }
  | { type: "CLOSE_MODAL" }
  | { type: "SEARCH_RESULTS"; payload: { products: Product[]; showSuggestions: boolean } }
  | { type: "RESET_RESULTS" };

const initialSearchState: SearchState = {
  query: "",
  products: [],
  isLoading: false,
  showSuggestions: false,
  searchHistory: [],
  recentlyViewed: [],
  focusedIndex: -1,
  hotProducts: [],
  hasLoadedHotProducts: false,
};

function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case "SET_QUERY":
      return { ...state, query: action.payload };
    case "SET_PRODUCTS":
      return { ...state, products: action.payload };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_SHOW_SUGGESTIONS":
      return { ...state, showSuggestions: action.payload };
    case "SET_SEARCH_HISTORY":
      return { ...state, searchHistory: action.payload };
    case "SET_RECENTLY_VIEWED":
      return { ...state, recentlyViewed: action.payload };
    case "SET_FOCUSED_INDEX":
      return { ...state, focusedIndex: action.payload };
    case "SET_HOT_PRODUCTS":
      return { ...state, hotProducts: action.payload };
    case "SET_HAS_LOADED_HOT_PRODUCTS":
      return { ...state, hasLoadedHotProducts: action.payload };
    case "OPEN_MODAL":
      return {
        ...state,
        searchHistory: action.payload.history,
        recentlyViewed: action.payload.viewed,
        focusedIndex: -1,
      };
    case "LOCALE_CHANGE":
      return {
        ...state,
        hotProducts: [],
        hasLoadedHotProducts: false,
      };
    case "CLEAR_HISTORY":
      if (action.payload === "search") {
        return { ...state, searchHistory: [] };
      } else {
        return { ...state, recentlyViewed: [] };
      }
    case "CLOSE_MODAL":
      return {
        ...state,
        query: "",
        products: [],
        showSuggestions: false,
      };
    case "SEARCH_RESULTS":
      return {
        ...state,
        products: action.payload.products,
        showSuggestions: action.payload.showSuggestions,
        focusedIndex: -1,
      };
    case "RESET_RESULTS":
      return {
        ...state,
        products: [],
        showSuggestions: false,
        isLoading: false,
      };
    default:
      return state;
  }
}

export function SearchAutocomplete({
  isOpen,
  onClose,
  onProductSelect,
}: SearchAutocompleteProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const inputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("searchModal");
  const locale = useLocale();

  const [state, dispatchState] = useReducer(searchReducer, initialSearchState);
  const {
    query,
    products,
    isLoading,
    showSuggestions,
    searchHistory,
    recentlyViewed,
    focusedIndex,
    hotProducts,
    hasLoadedHotProducts,
  } = state;

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousIsOpenRef = useRef(isOpen);
  const previousLocaleRef = useRef(locale);

  if (isOpen !== previousIsOpenRef.current) {
    previousIsOpenRef.current = isOpen;

    if (isOpen) {
      dispatchState({
        type: "OPEN_MODAL",
        payload: { history: getSearchHistory(), viewed: getRecentlyViewed() },
      });
    }
  }

  if (locale !== previousLocaleRef.current) {
    previousLocaleRef.current = locale;
    dispatchState({ type: "LOCALE_CHANGE" });
  }

  const isLoadingHot =
    isOpen && recentlyViewed.length === 0 && !hasLoadedHotProducts;

  // Clean timeout on unmount
  useEffect(() => {
    const activeTimeout = timeoutRef.current;
    return () => {
      if (activeTimeout) {
        clearTimeout(activeTimeout);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    dispatchState({ type: "SET_QUERY", payload: val });

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (val.length < 2) {
      dispatchState({ type: "RESET_RESULTS" });
      return;
    }

    dispatchState({ type: "SET_LOADING", payload: true });
    timeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/products?search=${encodeURIComponent(val)}&limit=12&locale=${locale}`
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.items) {
            dispatchState({
              type: "SEARCH_RESULTS",
              payload: { products: data.data.items, showSuggestions: true },
            });

            // Track search event
            trackSearch(val, data.data.items.length);
          }
        }
      } catch {
        dispatchState({ type: "SET_PRODUCTS", payload: [] });
      } finally {
        dispatchState({ type: "SET_LOADING", payload: false });
      }
    }, 300);
  };

  // Focus input when modal opens
  // react-doctor-disable-next-line react-doctor/no-effect-event-handler, react-doctor/no-fetch-in-effect -- synchronizing state, focusing input, and fetching hot products are valid layout side-effects
  useEffect(() => {
    if (isOpen) {
      if (inputRef.current) {
        inputRef.current.focus();
      }

      if (recentlyViewed.length === 0 && !hasLoadedHotProducts) {
        let isMounted = true;
        // react-doctor-disable-next-line react-doctor/no-fetch-in-effect -- fetching featured/trending products on modal display synchronizes with initial layout requirements
        fetch(`/api/products?sort=featured&limit=4&locale=${locale}`)
          .then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
          })
          .then((data) => {
            if (isMounted && data.success && data.data?.items) {
              dispatchState({ type: "SET_HOT_PRODUCTS", payload: data.data.items });
            }
          })
          .catch((err) => {
            console.error("Failed to load hot products:", err);
          })
          .finally(() => {
            if (isMounted) dispatchState({ type: "SET_HAS_LOADED_HOT_PRODUCTS", payload: true });
          });

        return () => {
          isMounted = false;
        };
      }
    }
  }, [isOpen, locale, recentlyViewed.length, hasLoadedHotProducts]);

  const handleProductClick = (product: Product) => {
    const updatedHistory = saveRecentlyViewedProduct(product);
    if (updatedHistory) {
      dispatchState({ type: "SET_RECENTLY_VIEWED", payload: updatedHistory });
    }
    if (onProductSelect) {
      onProductSelect(product.slug);
    } else {
      router.push(`/products/${product.slug}`);
    }
    handleClose();
  };

  const handleClose = () => {
    dispatchState({ type: "CLOSE_MODAL" });
    onClose();
  };

  const handleClearHistory = (type: "search" | "viewed") => {
    if (type === "search") {
      localStorage.removeItem("starbucks-search-history");
      dispatchState({ type: "CLEAR_HISTORY", payload: "search" });
    } else {
      localStorage.removeItem("starbucks-recently-viewed");
      dispatchState({ type: "CLEAR_HISTORY", payload: "viewed" });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const updatedHistory = saveSearchTermToStorage(query.trim());
      if (updatedHistory) dispatchState({ type: "SET_SEARCH_HISTORY", payload: updatedHistory });
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      handleClose();
    }
  };

  const handleViewAllResults = () => {
    if (query.trim()) {
      const updatedHistory = saveSearchTermToStorage(query.trim());
      if (updatedHistory) dispatchState({ type: "SET_SEARCH_HISTORY", payload: updatedHistory });
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      handleClose();
    }
  };

  const handleAddToCart = useCallback((product: Product) => {
    dispatch(addToCart({ product }));
    trackAddToCart({
      id: product.id,
      name: product.name,
      category: product.productCategories?.[0]?.category?.name,
    });
  }, [dispatch]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-10"
      onClick={handleClose}
      role="presentation"
    >
      <div
        className="bg-zinc-900 rounded-lg max-w-2xl lg:max-w-4xl w-full mx-4 overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="presentation"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700">
          <h2 className="text-lg font-bold text-white">{t("title")}</h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-zinc-800 text-white transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4">
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <div className="flex items-center gap-2 bg-zinc-800 rounded-lg p-3">
                <Search className="size-5 text-zinc-400 flex-shrink-0" />
                <input
                  ref={inputRef}
                  id="search-autocomplete"
                  name="search-autocomplete"
                  type="text"
                  value={query}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (!showSuggestions || products.length === 0) return;
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      dispatchState({ type: "SET_FOCUSED_INDEX", payload: Math.min(focusedIndex + 1, products.length - 1) });
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      dispatchState({ type: "SET_FOCUSED_INDEX", payload: Math.max(focusedIndex - 1, -1) });
                    } else if (e.key === "Enter" && focusedIndex >= 0) {
                      e.preventDefault();
                      handleProductClick(products[focusedIndex]);
                    }
                  }}
                  placeholder={t("placeholder")}
                  aria-label={t("placeholder")}
                  className="flex-1 bg-transparent text-white placeholder-zinc-400 outline-none"
                />
                {query.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      dispatchState({ type: "SET_QUERY", payload: "" });
                      inputRef.current?.focus();
                    }}
                    className="text-zinc-400 hover:text-white transition-colors flex-shrink-0 cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="size-4" />
                  </button>
                )}
                {isLoading && (
                  <Loader2 className="size-4 text-zinc-400 animate-spin flex-shrink-0" />
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Suggestions Panel */}
        <SearchSuggestionsPanel
          query={query}
          products={products}
          isLoading={isLoading}
          showSuggestions={showSuggestions}
          focusedIndex={focusedIndex}
          handleProductClick={handleProductClick}
          handleAddToCart={handleAddToCart}
          handleViewAllResults={handleViewAllResults}
          t={t}
        />

        {/* Trending & History Panel */}
        <TrendingAndHistoryPanel
          query={query}
          searchHistory={searchHistory}
          recentlyViewed={recentlyViewed}
          hotProducts={hotProducts}
          isLoadingHot={isLoadingHot}
          setQuery={(q) => dispatchState({ type: "SET_QUERY", payload: q })}
          handleClearHistory={handleClearHistory}
          handleProductClick={handleProductClick}
          handleAddToCart={handleAddToCart}
          t={t}
        />
      </div>
    </div>
  );
}
