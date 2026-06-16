"use client";

import ProductCard from "@/components/ProductCard";
import ProductSkeleton from "@/components/ui/ProductSkeleton";
import type { Product } from "@/types";
import type { TranslationValues } from "use-intl";

interface TrendingAndHistoryPanelProps {
  query: string;
  searchHistory: string[];
  recentlyViewed: Product[];
  hotProducts: Product[];
  isLoadingHot: boolean;
  setQuery: (query: string) => void;
  handleClearHistory: (type: "search" | "viewed") => void;
  handleProductClick: (product: Product) => void;
  handleAddToCart: (product: Product) => void;
  t: (key: string, values?: TranslationValues) => string;
}

export function TrendingAndHistoryPanel({
  query,
  searchHistory,
  recentlyViewed,
  hotProducts,
  isLoadingHot,
  setQuery,
  handleClearHistory,
  handleProductClick,
  handleAddToCart,
  t,
}: TrendingAndHistoryPanelProps) {
  if (query.length >= 2) return null;

  return (
    <div className="p-4 border-t border-zinc-700 min-h-[300px] overflow-y-auto max-h-[60vh] lg:max-h-[75vh] custom-scrollbar">
      {searchHistory.length === 0 && recentlyViewed.length === 0 ? (
        <div className="p-4 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-white mb-3 px-2">
              {t("trending")}
            </h3>
            <div className="trending flex flex-wrap gap-2 px-2">
              {t("trendingKeywords")
                .split(",")
                .map((keyword) => (
                  <button
                    type="button"
                    key={keyword.trim()}
                    onClick={() => setQuery(keyword.trim())}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-full transition-colors cursor-pointer"
                  >
                    {keyword.trim()}
                  </button>
                ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-white mb-3 px-2">
              {t("hotProducts")}
            </h3>
            {isLoadingHot ? (
              <ProductSkeleton
                count={4}
                layout="custom"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-2"
              />
            ) : hotProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-2">
                {hotProducts.map((product) => (
                  <button
                    type="button"
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                    aria-label={product.name}
                    className="block w-full text-left cursor-pointer"
                  >
                    <ProductCard
                      product={product}
                      onAddToCart={handleAddToCart}
                      showAddToCart={false}
                      showSecondaryImage={false}
                    />
                  </button>
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
                <h3 className="text-sm font-medium text-white">
                  {t("recentSearches")}
                </h3>
                <button
                  type="button"
                  onClick={() => handleClearHistory("search")}
                  className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  {t("clearHistory")}
                </button>
              </div>
              <div className="flex flex-wrap gap-2 px-2">
                {searchHistory.map((term) => (
                  <button
                    type="button"
                    key={term}
                    onClick={() => setQuery(term)}
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
                <h3 className="text-sm font-medium text-white">
                  {t("recentlyViewed")}
                </h3>
                <button
                  type="button"
                  onClick={() => handleClearHistory("viewed")}
                  className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  {t("clearHistory")}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentlyViewed.map((product) => (
                  <button
                    type="button"
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                    aria-label={product.name}
                    className="block w-full text-left cursor-pointer"
                  >
                    <ProductCard
                      product={product}
                      onAddToCart={handleAddToCart}
                      showAddToCart={false}
                      showSecondaryImage={false}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
