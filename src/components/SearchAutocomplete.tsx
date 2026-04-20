"use client";

import { useRef, useEffect, useState } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import ProductCard from "@/components/ProductCard";
import ProductSkeleton from "@/components/ui/ProductSkeleton";
import { useAppDispatch } from "@/store";
import { addToCart } from "@/store/slices/cartSlice";
import type { Product } from "@/types";
import { trackAddToCart, trackSearch } from "@/lib/analytics";

const SEARCH_HISTORY_KEY = "starbucks-search-history";
const RECENTLY_VIEWED_KEY = "starbucks-recently-viewed";

const getSearchHistory = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveSearchTermToStorage = (term: string): string[] | undefined => {
  if (typeof window === "undefined" || !term.trim()) return;
  const history = getSearchHistory();
  const newHistory = [
    term.trim(),
    ...history.filter((t) => t.toLowerCase() !== term.trim().toLowerCase()),
  ].slice(0, 8);
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
  return newHistory;
};

const getRecentlyViewed = (): Product[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveRecentlyViewedProduct = (product: Product): Product[] | undefined => {
  if (typeof window === "undefined") return;
  const history = getRecentlyViewed();
  const newHistory = [
    product,
    ...history.filter((p) => p.id !== product.id),
  ].slice(0, 8);
  localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(newHistory));
  return newHistory;
};

interface SearchAutocompleteProps {
  isOpen: boolean;
  onClose: () => void;
  onProductSelect?: (slug: string) => void;
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

  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [hotProducts, setHotProducts] = useState<Product[]>([]);
  const [isLoadingHot, setIsLoadingHot] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);


  // Custom debounced search effect - sử dụng cùng endpoint với products page
  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // If query is too short, clear suggestions immediately
    if (query.length < 2) {
      setProducts([]);
      setShowSuggestions(false);
      setIsLoading(false);
      return;
    }

    // Set new timeout for search
    timeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        // Sử dụng cùng endpoint với products page
        const response = await fetch(
          `/api/products?search=${encodeURIComponent(query)}&limit=12&locale=${locale}`
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.items) {
            setProducts(data.data.items);
            setShowSuggestions(true);
            setFocusedIndex(-1);

            // Track search event
            trackSearch(query, data.data.items.length);
          }
        }
      } catch (error) {
        console.error("Search autocomplete error:", error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query, locale]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      if (inputRef.current) {
        inputRef.current.focus();
      }
      const history = getSearchHistory();
      const viewed = getRecentlyViewed();
      
      setSearchHistory(history);
      setRecentlyViewed(viewed);
      setFocusedIndex(-1);

      if (viewed.length === 0) {
        let isMounted = true;
        setIsLoadingHot(true);
        fetch(`/api/products?sort=featured&limit=4&locale=${locale}`)
          .then((res) => res.json())
          .then((data) => {
            if (isMounted && data.success && data.data?.items) {
              setHotProducts(data.data.items);
            }
          })
          .catch((error) => console.error("Error fetching hot products:", error))
          .finally(() => {
            if (isMounted) setIsLoadingHot(false);
          });

        return () => {
          isMounted = false;
        };
      }
    }
  }, [isOpen, locale]);

  const handleProductClick = (product: Product) => {
    const updatedHistory = saveRecentlyViewedProduct(product);
    if (updatedHistory) {
      setRecentlyViewed(updatedHistory);
    }
    if (onProductSelect) {
      onProductSelect(product.slug);
    } else {
      router.push(`/products/${product.slug}`);
    }
    handleClose();
  };

  const handleClose = () => {
    setQuery("");
    setProducts([]);
    setShowSuggestions(false);
    onClose();
  };

  const handleClearHistory = (type: "search" | "viewed") => {
    if (type === "search") {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
      setSearchHistory([]);
    } else {
      localStorage.removeItem(RECENTLY_VIEWED_KEY);
      setRecentlyViewed([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const updatedHistory = saveSearchTermToStorage(query.trim());
      if (updatedHistory) setSearchHistory(updatedHistory);
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      handleClose();
    }
  };

  const handleViewAllResults = () => {
    if (query.trim()) {
      const updatedHistory = saveSearchTermToStorage(query.trim());
      if (updatedHistory) setSearchHistory(updatedHistory);
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      handleClose();
    }
  };

  const handleAddToCart = (product: Product) => {
    dispatch(addToCart({ product }));

    // Track add to cart event
    trackAddToCart({
      id: product.id,
      name: product.name,
      category: product.productCategories?.[0]?.category?.name,
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20"
      onClick={handleClose}
    >
      <div
        className="bg-zinc-900 rounded-lg max-w-2xl lg:max-w-4xl w-full mx-4 overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700">
          <h2 className="text-lg font-bold text-white">{t("title")}</h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-zinc-800 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4">
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <div className="flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-3">
                <Search className="w-5 h-5 text-zinc-400 flex-shrink-0" />
                <input
                  ref={inputRef}
                  id="search-autocomplete"
                  name="search-autocomplete"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (!showSuggestions || products.length === 0) return;
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setFocusedIndex((prev) => Math.min(prev + 1, products.length - 1));
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setFocusedIndex((prev) => Math.max(prev - 1, -1));
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
                      setQuery("");
                      inputRef.current?.focus();
                    }}
                    className="text-zinc-400 hover:text-white transition-colors flex-shrink-0 cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                {isLoading && (
                  <Loader2 className="w-4 h-4 text-zinc-400 animate-spin flex-shrink-0" />
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Suggestions */}
        {query.length >= 2 && (
          <div className="border-t border-zinc-700">
            {isLoading && products.length === 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <ProductSkeleton key={i} count={1} layout="homepage" />
                ))}
              </div>
            ) : showSuggestions && products.length > 0 ? (
              <div className="max-h-[60vh] lg:max-h-[75vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
                  {products.map((product, index) => (
                    <div
                      key={product.id}
                      onClick={() => handleProductClick(product)}
                      className={`cursor-pointer rounded-2xl transition-shadow ${
                        focusedIndex === index ? "ring-2 ring-emerald-500" : ""
                      }`}
                    >
                      <ProductCard
                        product={product}
                        onAddToCart={handleAddToCart}
                        showAddToCart={false}
                        showSecondaryImage={false}
                        highlightText={query}
                      />
                    </div>
                  ))}
                </div>

                {/* View All Results Button */}
                <div className="p-4 border-t border-zinc-700">
                  <button
                    onClick={handleViewAllResults}
                    className="w-full bg-white text-black py-2 px-4 rounded-lg font-medium hover:bg-zinc-200 transition-colors text-sm cursor-pointer"
                  >
                    {t("viewAllResults", { query })}
                  </button>
                </div>
              </div>
            ) : query.length >= 2 && !isLoading ? (
              <div className="p-8 text-center">
                <Search className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-400">{t("noResults")}</p>
                <button
                  onClick={handleViewAllResults}
                  className="mt-4 bg-white text-black py-2 px-4 rounded-lg font-medium hover:bg-zinc-200 transition-colors text-sm cursor-pointer"
                >
                  {t("searchOnProductsPage")}
                </button>
              </div>
            ) : null}
          </div>
        )}

        {/* Empty State / History */}
        {query.length < 2 && (
          <div className="p-4 border-t border-zinc-700 min-h-[300px] overflow-y-auto max-h-[60vh] lg:max-h-[75vh] custom-scrollbar">
            {searchHistory.length === 0 && recentlyViewed.length === 0 ? (
              <div className="p-4 space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-white mb-3 px-2">{t("trending")}</h3>
                  <div className="trending flex flex-wrap gap-2 px-2">
                    {t("trendingKeywords").split(",").map((keyword) => (
                      <button
                        key={keyword.trim()}
                        type="button"
                        onClick={() => setQuery(keyword.trim())}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-full transition-colors cursor-pointer"
                      >
                        {keyword.trim()}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-white mb-3 px-2">{t("hotProducts")}</h3>
                  {isLoadingHot ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <ProductSkeleton key={i} count={1} layout="homepage" />
                      ))}
                    </div>
                  ) : hotProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-2">
                      {hotProducts.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => handleProductClick(product)}
                          className="cursor-pointer"
                        >
                          <ProductCard
                            product={product}
                            onAddToCart={handleAddToCart}
                            showAddToCart={false}
                            showSecondaryImage={false}
                          />
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Search History */}
                {searchHistory.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3 px-2">
                      <h3 className="text-sm font-medium text-white">{t("recentSearches")}</h3>
                      <button 
                        onClick={() => handleClearHistory("search")}
                        type="button"
                        className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      >
                        {t("clearHistory")}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 px-2">
                      {searchHistory.map((term, index) => (
                        <button
                          key={index}
                          onClick={() => setQuery(term)}
                          type="button"
                          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-full transition-colors cursor-pointer"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recently Viewed */}
                {recentlyViewed.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3 px-2">
                      <h3 className="text-sm font-medium text-white">{t("recentlyViewed")}</h3>
                      <button 
                        onClick={() => handleClearHistory("viewed")}
                        type="button"
                        className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      >
                        {t("clearHistory")}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {recentlyViewed.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => handleProductClick(product)}
                          className="cursor-pointer"
                        >
                          <ProductCard
                            product={product}
                            onAddToCart={handleAddToCart}
                            showAddToCart={false}
                            showSecondaryImage={false}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
