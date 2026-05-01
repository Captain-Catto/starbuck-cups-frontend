import { useState, useRef } from "react";
import { useAppSelector } from "@/store";
import { Product } from "@/types/orders";

export function useProductSearch() {
  const { token } = useAppSelector((state) => state.auth);

  // Product search state
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [searchingProducts, setSearchingProducts] = useState(false);
  const [productSearchResults, setProductSearchResults] = useState<Product[]>(
    []
  );
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);

  const searchAbortRef = useRef<AbortController | null>(null);

  // Product search logic
  const searchProducts = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setProductSearchResults([]);
      return;
    }

    searchAbortRef.current?.abort();
    const controller = new AbortController();
    searchAbortRef.current = controller;

    setSearchingProducts(true);

    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(
        `/api/admin/products?search=${encodeURIComponent(searchTerm)}&limit=10`,
        { headers, signal: controller.signal }
      );
      const data = await response.json();

      if (data.success && data.data && data.data.items) {
        setProductSearchResults(data.data.items);
      } else {
        setProductSearchResults([]);
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setProductSearchResults([]);
    } finally {
      if (!controller.signal.aborted) {
        setSearchingProducts(false);
        setShowProductDropdown(true);
      }
    }
  };

  const handleProductSearch = (searchTerm: string, itemIndex: number) => {
    setProductSearchTerm(searchTerm);
    setActiveItemIndex(itemIndex);
    searchProducts(searchTerm);
  };

  const selectProduct = (product: Product) => {
    setProductSearchTerm(product.name); // Set product name in search term
    setShowProductDropdown(false);
    setActiveItemIndex(null);
    setProductSearchResults([]); // Clear search results after selection

    return {
      product,
      defaultPrice: product.unitPrice || 150000,
    };
  };

  const clearProductSearch = () => {
    setProductSearchTerm("");
    setShowProductDropdown(false);
    setActiveItemIndex(null);
    setProductSearchResults([]);
  };

  return {
    // Search state
    productSearchTerm,
    searchingProducts,
    productSearchResults,
    showProductDropdown,
    activeItemIndex,

    // Actions
    handleProductSearch,
    selectProduct,
    clearProductSearch,
    setShowProductDropdown,
    setActiveItemIndex,
    setProductSearchTerm,
  };
}
