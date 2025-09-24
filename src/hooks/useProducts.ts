"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppDispatch } from "@/store";
import { addToCart } from "@/store/slices/cartSlice";
import type { Product, Category, Color, Capacity, CapacityRange, PaginationMeta } from "@/types";
import { toast } from "sonner";

interface UseProductsReturn {
  // Data
  products: Product[];
  categories: Category[];
  colors: Color[];
  capacities: Capacity[];
  totalItems: number;
  paginationData: PaginationMeta | null;
  totalPages: number;

  // State
  loading: boolean;
  isHydrated: boolean;
  searchQuery: string;
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
  handleAddToCart: (product: Product) => void;
  clearFilters: () => void;
  updateURL: (newFilters: {
    search?: string;
    category?: string;
    color?: string;
    capacityMin?: number;
    capacityMax?: number;
    sort?: string;
    page?: number;
  }) => void;
}

export function useProducts(): UseProductsReturn {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Local state
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || ""
  );
  const [selectedColor, setSelectedColor] = useState(
    searchParams.get("color") || ""
  );
  const [capacityRange, setCapacityRange] = useState<CapacityRange>({
    min: parseInt(searchParams.get("capacityMin") || "0"),
    max: parseInt(searchParams.get("capacityMax") || "9999")
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1")
  );
  const [loading, setLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  // Real data from API
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [capacities, setCapacities] = useState<Capacity[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [paginationData, setPaginationData] = useState<PaginationMeta | null>(null);

  // Fetch filter options (categories, colors, capacities)
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // Fetch categories
        const categoriesRes = await fetch("/api/categories");
        const categoriesData = await categoriesRes.json();
        console.log("categoriesData", categoriesData);
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
        console.log("colorsData", colorsData);
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
        console.log("capacitiesData", capacitiesData);
        if (
          capacitiesData.success &&
          capacitiesData.data?.items &&
          Array.isArray(capacitiesData.data.items)
        ) {
          setCapacities(capacitiesData.data.items);
        }
      } catch (error) {
        console.error("Error fetching filter options:", error);
      }
    };

    fetchFilterOptions();
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();

        if (searchQuery) params.append("search", searchQuery);
        if (selectedCategory) params.append("category", selectedCategory);
        if (selectedColor) params.append("color", selectedColor);
        if (capacityRange.min > 0) params.append("capacityMin", capacityRange.min.toString());
        if (capacityRange.max < 9999) params.append("capacityMax", capacityRange.max.toString());
        params.append("page", currentPage.toString());
        params.append("limit", "20");

        // Enhanced sorting options
        switch (sortBy) {
          case "name_asc":
            params.append("sortBy", "name");
            params.append("sortOrder", "asc");
            break;
          case "name_desc":
            params.append("sortBy", "name");
            params.append("sortOrder", "desc");
            break;
          case "newest":
            params.append("sortBy", "createdAt");
            params.append("sortOrder", "desc");
            break;
          case "oldest":
            params.append("sortBy", "createdAt");
            params.append("sortOrder", "asc");
            break;
          default:
            params.append("sortBy", "name");
            params.append("sortOrder", "asc");
        }

        const response = await fetch(`/api/products?${params.toString()}`);
        const data = await response.json();
        console.log("productsData", data);

        if (data.success) {
          // Normalize products data to handle both old and new image structure
          const normalizedProducts = (data.data?.items || []).map(
            (product: Product) => ({
              ...product,
              // Ensure backward compatibility - convert productImages to images array
              images: product.productImages?.map(
                (img: { url: string; order: number }) => img.url
              ),
            })
          );

          setProducts(normalizedProducts);
          setTotalItems(data.data?.pagination?.total_items || 0);
          setPaginationData(data.data?.pagination || null);
        } else {
          console.error("Error fetching products:", data.message);
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    searchQuery,
    selectedCategory,
    selectedColor,
    capacityRange,
    currentPage,
    sortBy,
  ]);

  // Get pagination info from API response
  const totalPages = paginationData?.total_pages || 1;

  // Wait for hydration to avoid mismatch
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Update URL with current filter state
  const updateURL = (newFilters: {
    search?: string;
    category?: string;
    color?: string;
    capacityMin?: number;
    capacityMax?: number;
    sort?: string;
    page?: number;
  }) => {
    const params = new URLSearchParams();

    const search = newFilters.search ?? searchQuery;
    const category = newFilters.category ?? selectedCategory;
    const color = newFilters.color ?? selectedColor;
    const capacityMin = newFilters.capacityMin ?? capacityRange.min;
    const capacityMax = newFilters.capacityMax ?? capacityRange.max;
    const sort = newFilters.sort ?? sortBy;
    const page = newFilters.page ?? currentPage;

    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (color) params.set("color", color);
    if (capacityMin > 0) params.set("capacityMin", capacityMin.toString());
    if (capacityMax < 9999) params.set("capacityMax", capacityMax.toString());
    if (sort && sort !== "newest") params.set("sort", sort);
    if (page && page !== 1) params.set("page", page.toString());

    const newURL = params.toString()
      ? `/products?${params.toString()}`
      : "/products";
    router.replace(newURL, { scroll: false });
  };

  const handleAddToCart = (product: Product) => {
    dispatch(addToCart({ product, quantity: 1 }));
    toast.success(`Đã thêm ${product.name} vào giỏ hàng`, {
      duration: 2000,
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedColor("");
    setCapacityRange({ min: 0, max: 9999 });
    setSortBy("newest");
    setCurrentPage(1);
    router.replace("/products", { scroll: false });
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedCategory !== "" ||
    selectedColor !== "" ||
    (capacityRange.min > 0 || capacityRange.max < 9999) ||
    sortBy !== "newest";

  return {
    // Data
    products,
    categories,
    colors,
    capacities,
    totalItems,
    paginationData,
    totalPages,

    // State
    loading,
    isHydrated,
    searchQuery,
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
    handleAddToCart,
    clearFilters,
    updateURL,
  };
}