"use client";

import { Search } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import ProductSkeleton from "@/components/ui/ProductSkeleton";
import type { Product } from "@/types";

interface SearchSuggestionsPanelProps {
  query: string;
  products: Product[];
  isLoading: boolean;
  showSuggestions: boolean;
  focusedIndex: number;
  handleProductClick: (product: Product) => void;
  handleAddToCart: (product: Product) => void;
  handleViewAllResults: () => void;
  t: (key: string, values?: any) => string;
}

export function SearchSuggestionsPanel({
  query,
  products,
  isLoading,
  showSuggestions,
  focusedIndex,
  handleProductClick,
  handleAddToCart,
  handleViewAllResults,
  t,
}: SearchSuggestionsPanelProps) {
  if (query.length < 2) return null;

  return (
    <div className="border-t border-zinc-700">
      {isLoading && products.length === 0 ? (
        <div className="p-4">
          <ProductSkeleton
            count={8}
            layout="custom"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          />
        </div>
      ) : showSuggestions && products.length > 0 ? (
        <div className="max-h-[60vh] lg:max-h-[75vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
            {products.map((product, index) => (
              <button
                type="button"
                key={product.id}
                onClick={() => handleProductClick(product)}
                aria-label={product.name}
                className={`block w-full text-left cursor-pointer rounded-2xl transition-shadow ${
                  focusedIndex === index ? "ring-2 ring-white/60" : ""
                }`}
              >
                <ProductCard
                  product={product}
                  onAddToCart={handleAddToCart}
                  showAddToCart={false}
                  showSecondaryImage={false}
                  highlightText={query}
                />
              </button>
            ))}
          </div>

          {/* View All Results Button */}
          <div className="p-4 border-t border-zinc-700">
            <button
              type="button"
              onClick={handleViewAllResults}
              className="w-full bg-white text-black py-2 px-4 rounded-lg font-medium hover:bg-zinc-200 transition-colors text-sm cursor-pointer"
            >
              {t("viewAllResults", { query })}
            </button>
          </div>
        </div>
      ) : !isLoading ? (
        <div className="p-8 text-center">
          <Search className="size-12 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400">{t("noResults")}</p>
          <button
            type="button"
            onClick={handleViewAllResults}
            className="mt-4 bg-white text-black py-2 px-4 rounded-lg font-medium hover:bg-zinc-200 transition-colors text-sm cursor-pointer"
          >
            {t("searchOnProductsPage")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
