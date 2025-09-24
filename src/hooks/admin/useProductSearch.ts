import { useState } from "react";
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

  // Mock products data (as in original component)
  const [products] = useState<Product[]>([
    {
      id: "1",
      name: "Ly Starbucks Classic",
      slug: "ly-starbucks-classic-trang-450ml",
      description: "Ly Starbucks Classic màu trắng 450ml",
      unitPrice: 150000,
      stockQuantity: 25,
      isActive: true,
      isDeleted: false,
      capacity: {
        id: "cap1",
        name: "450ml",
        volumeMl: 450,
      },
      color: {
        id: "col1",
        name: "Trắng",
        hexCode: "#FFFFFF",
      },
      category: {
        id: "cat1",
        name: "Tumblers",
        slug: "tumblers",
      },
      productImages: [{ url: "/images/cup1.jpg", order: 1 }],
      _count: { orderItems: 0 },
    },
    {
      id: "2",
      name: "Ly Starbucks Premium",
      slug: "ly-starbucks-premium-den-500ml",
      description: "Ly Starbucks Premium màu đen 500ml",
      unitPrice: 180000,
      stockQuantity: 15,
      isActive: true,
      isDeleted: false,
      capacity: {
        id: "cap2",
        name: "500ml",
        volumeMl: 500,
      },
      color: {
        id: "col2",
        name: "Đen",
        hexCode: "#000000",
      },
      category: {
        id: "cat1",
        name: "Tumblers",
        slug: "tumblers",
      },
      productImages: [{ url: "/images/cup2.jpg", order: 1 }],
      _count: { orderItems: 0 },
    },
  ]);

  // Product search logic
  const searchProducts = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setProductSearchResults([]);
      return;
    }

    setSearchingProducts(true);

    try {
      // Include authorization header
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // Real API call to search products
      const response = await fetch(
        `/api/admin/products?search=${encodeURIComponent(searchTerm)}&limit=10`,
        { headers }
      );
      const data = await response.json();

      if (data.success && data.data && data.data.items) {
        setProductSearchResults(data.data.items);
      } else {
        console.error("Failed to search products:", data.message);
        setProductSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching products:", error);
      setProductSearchResults([]);
    } finally {
      setSearchingProducts(false);
      setShowProductDropdown(true);
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
    // Static products data
    products,

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
