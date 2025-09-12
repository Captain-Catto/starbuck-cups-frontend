"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Filter, Search, Grid3X3, List, ShoppingCart } from "lucide-react";
import { useAppDispatch } from "@/store";
import { addToCart } from "@/store/slices/cartSlice";
import type { Product, Category, Color, Capacity } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

export default function ProductsPage() {
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
  const [selectedCapacity, setSelectedCapacity] = useState(
    searchParams.get("capacity") || ""
  );
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Real data from API
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [capacities, setCapacities] = useState<Capacity[]>([]);
  const [totalItems, setTotalItems] = useState(0);

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
        if (selectedCategory) params.append("categoryId", selectedCategory);
        if (selectedColor) params.append("colorId", selectedColor);
        if (selectedCapacity) params.append("capacityId", selectedCapacity);
        params.append("page", currentPage.toString());
        params.append("limit", "12");
        if (sortBy === "name") params.append("sortBy", "name");

        const response = await fetch(`/api/products?${params.toString()}`);
        const data = await response.json();
        console.log("productsData", data);

        if (data.success) {
          setProducts(data.data?.items || []);
          setTotalItems(data.data?.pagination?.total_items || 0);
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
    selectedCapacity,
    currentPage,
    sortBy,
  ]);

  // Products are already filtered by API, so we just use them directly
  const filteredProducts = products;
  const sortedProducts = filteredProducts; // Sorting is handled by API
  const paginatedProducts = sortedProducts; // Pagination is handled by API

  // Calculate total pages from API response
  const itemsPerPage = 12;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

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
    setSelectedCapacity("");
    setCurrentPage(1);
    router.push("/products");
  };

  const hasActiveFilters =
    searchQuery || selectedCategory || selectedColor || selectedCapacity;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Sản Phẩm Starbucks</h1>
            <p className="text-xl text-green-100">
              Khám phá bộ sưu tập ly Starbucks đa dạng với nhiều màu sắc và dung
              tích
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-15 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Bộ lọc</h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-green-600 hover:text-green-700"
                  >
                    Xóa tất cả
                  </button>
                )}
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tìm kiếm
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm sản phẩm..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Danh mục
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Color Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Màu sắc
                </label>
                <select
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Tất cả màu</option>
                  {colors.map((color) => (
                    <option key={color.id} value={color.id}>
                      {color.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Capacity Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dung tích
                </label>
                <select
                  value={selectedCapacity}
                  onChange={(e) => setSelectedCapacity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Tất cả dung tích</option>
                  {capacities.map((capacity) => (
                    <option key={capacity.id} value={capacity.id}>
                      {capacity.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* Mobile Filter Toggle */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Filter className="w-4 h-4" />
                    Bộ lọc
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="name">Tên A-Z</option>
                  </select>

                  {/* View Mode */}
                  <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 ${
                        viewMode === "grid"
                          ? "bg-green-600 text-white"
                          : "bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 ${
                        viewMode === "list"
                          ? "bg-green-600 text-white"
                          : "bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : paginatedProducts.length > 0 ? (
              <>
                <div
                  className={`grid gap-6 mb-8 ${
                    viewMode === "grid"
                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                      : "grid-cols-1"
                  }`}
                >
                  {paginatedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      viewMode={viewMode}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Trước
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 border rounded-lg ${
                            currentPage === page
                              ? "bg-green-600 text-white border-green-600"
                              : "border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}

                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Sau
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Không tìm thấy sản phẩm
                </h3>
                <p className="text-gray-600">
                  Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  viewMode: "grid" | "list";
  onAddToCart: (product: Product) => void;
}

function ProductCard({ product, viewMode, onAddToCart }: ProductCardProps) {
  if (viewMode === "list") {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
        <div className="flex gap-6">
          <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={product.images[0] || "/images/placeholder-product.jpg"}
              alt={product.name}
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              <Link
                href={`/products/${product.slug}`}
                className="hover:text-green-600"
              >
                {product.name}
              </Link>
            </h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {product.description}
            </p>

            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: product.color.hexCode }}
                />
                <span className="text-sm text-gray-600">
                  {product.color.name}
                </span>
              </div>
              <span className="text-sm text-gray-600">
                {product.capacity.name}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => onAddToCart(product)}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <ShoppingCart className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-square bg-gray-100 overflow-hidden">
        <Image
          src={product.images[0] || "/images/placeholder-product.jpg"}
          alt={product.name}
          width={300}
          height={300}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          <Link
            href={`/products/${product.slug}`}
            className="hover:text-green-600"
          >
            {product.name}
          </Link>
        </h3>

        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-3 h-3 rounded-full border border-gray-300"
            style={{ backgroundColor: product.color.hexCode }}
          />
          <span className="text-sm text-gray-600">{product.color.name}</span>
          <span className="text-sm text-gray-400">•</span>
          <span className="text-sm text-gray-600">{product.capacity.name}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onAddToCart(product)}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            <ShoppingCart className="w-4 h-4" />
            Giỏ
          </button>
        </div>
      </div>
    </div>
  );
}
