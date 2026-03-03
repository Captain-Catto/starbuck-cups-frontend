"use client";

import { useRef, useEffect, useState } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { useAppDispatch } from "@/store";
import { addToCart } from "@/store/slices/cartSlice";
import type { Product } from "@/types";
import { trackAddToCart, trackSearch } from "@/lib/analytics";

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

  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
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
          `/api/products?search=${encodeURIComponent(query)}&limit=8`
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.items) {
            setProducts(data.data.items);
            setShowSuggestions(true);

            // Track search event
            trackSearch(query, data.data.items.length);
          }
        }
      } catch (error) {

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
  }, [query]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleProductClick = (slug: string) => {
    if (onProductSelect) {
      onProductSelect(slug);
    } else {
      router.push(`/products/${slug}`);
    }
    handleClose();
  };

  const handleClose = () => {
    setQuery("");
    setProducts([]);
    setShowSuggestions(false);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      handleClose();
    }
  };

  const handleViewAllResults = () => {
    if (query.trim()) {
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
      <div className="bg-zinc-900 rounded-lg max-w-2xl w-full mx-4 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700">
          <h2 className="text-lg font-bold text-white">Tìm kiếm sản phẩm</h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-zinc-800 text-white transition-colors"
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
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm... (tối thiểu 2 ký tự)"
                  className="flex-1 bg-transparent text-white placeholder-zinc-400 outline-none"
                />
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
              <div className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-zinc-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang tìm kiếm...</span>
                </div>
              </div>
            ) : showSuggestions && products.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleProductClick(product.slug)}
                      className="cursor-pointer"
                    >
                      <ProductCard
                        product={product}
                        onAddToCart={handleAddToCart}
                        showAddToCart={false}
                      />
                    </div>
                  ))}
                </div>

                {/* View All Results Button */}
                <div className="p-4 border-t border-zinc-700">
                  <button
                    onClick={handleViewAllResults}
                    className="w-full bg-white text-black py-2 px-4 rounded-lg font-medium hover:bg-zinc-200 transition-colors text-sm"
                  >
                    Xem tất cả kết quả cho &quot;{query}&quot;
                  </button>
                </div>
              </div>
            ) : query.length >= 2 && !isLoading ? (
              <div className="p-8 text-center">
                <Search className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-400">Không tìm thấy sản phẩm nào</p>
                <button
                  onClick={handleViewAllResults}
                  className="mt-4 bg-white text-black py-2 px-4 rounded-lg font-medium hover:bg-zinc-200 transition-colors text-sm"
                >
                  Tìm kiếm trên trang sản phẩm
                </button>
              </div>
            ) : null}
          </div>
        )}

        {/* Empty State */}
        {query.length < 2 && (
          <div className="p-8 text-center border-t border-zinc-700">
            <Search className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400">
              Nhập ít nhất 2 ký tự để bắt đầu tìm kiếm
            </p>
            <p className="text-zinc-500 text-sm mt-2">
              Suggestions sẽ xuất hiện trong vòng 300ms
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
