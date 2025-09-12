"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  Eye,
  EyeOff,
  Package,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";
import type { Product, Category, Color, Capacity } from "@/types";
import ProductModal from "@/components/admin/ProductModal";
import { apiService } from "@/lib/api";

interface ProductListItem extends Product {
  isActive: boolean;
  stock: number;
}

interface ProductFilters {
  search: string;
  category: string;
  color: string;
  capacity: string;
  status: "all" | "active" | "inactive" | "low_stock";
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [capacities, setCapacities] = useState<Capacity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductListItem | null>(
    null
  );

  const [filters, setFilters] = useState<ProductFilters>({
    search: "",
    category: "",
    color: "",
    capacity: "",
    status: "all",
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.category && { categoryId: filters.category }),
        ...(filters.color && { colorId: filters.color }),
        ...(filters.capacity && { capacityId: filters.capacity }),
        ...(filters.status === "active" && { isActive: "true" }),
        ...(filters.status === "inactive" && { isActive: "false" }),
        ...(filters.status === "low_stock" && {
          lowStock: "true",
          lowStockThreshold: "10",
        }),
      });

      const response = await fetch(`/api/admin/products?${params}`);
      const data = await response.json();

      if (data.success) {
        // Map API response to match our interface
        const mappedProducts = (data.data?.items || []).map(
          (item: Product & { stockQuantity: number }) => ({
            ...item,
            stock: item.stockQuantity, // Map stockQuantity to stock
          })
        );

        setProducts(mappedProducts);
        setPagination((prev) => ({
          ...prev,
          total: data.data?.pagination?.total_items || 0,
          totalPages: data.data?.pagination?.total_pages || 0,
        }));
      } else {
        console.error("API Error:", data);
        toast.error(data.message || "Không thể tải danh sách sản phẩm");
      }
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Có lỗi xảy ra khi tải sản phẩm");
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  const loadFilterOptions = async () => {
    try {
      const [categoriesRes, colorsRes, capacitiesRes] = await Promise.all([
        fetch("/api/admin/categories"),
        fetch("/api/admin/colors"),
        fetch("/api/admin/capacities"),
      ]);

      const [categoriesData, colorsData, capacitiesData] = await Promise.all([
        categoriesRes.json(),
        colorsRes.json(),
        capacitiesRes.json(),
      ]);

      console.log("Filter options response:", {
        categoriesData,
        colorsData,
        capacitiesData,
        categoriesDataStructure: categoriesData?.data,
        colorsDataStructure: colorsData?.data,
        capacitiesDataStructure: capacitiesData?.data,
      });

      if (categoriesData.success) {
        const cats = Array.isArray(categoriesData.data?.items)
          ? categoriesData.data.items
          : [];
        console.log("Setting categories:", cats);
        setCategories(cats);
      }
      if (colorsData.success) {
        const cols = Array.isArray(colorsData.data?.items)
          ? colorsData.data.items
          : [];
        console.log("Setting colors:", cols);
        setColors(cols);
      }
      if (capacitiesData.success) {
        const caps = Array.isArray(capacitiesData.data?.items)
          ? capacitiesData.data.items
          : [];
        console.log("Setting capacities:", caps);
        setCapacities(caps);
      }
    } catch (error) {
      console.error("Error loading filter options:", error);
      // Set empty arrays as fallback
      setCategories([]);
      setColors([]);
      setCapacities([]);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadProducts();
    loadFilterOptions();
  }, [loadProducts]);

  const handleFilterChange = (field: keyof ProductFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleBulkAction = async (
    action: "activate" | "deactivate" | "delete"
  ) => {
    if (selectedProducts.length === 0) {
      toast.error("Vui lòng chọn ít nhất một sản phẩm");
      return;
    }

    try {
      setLoading(true);
      const promises = selectedProducts.map(async (productId) => {
        if (action === "delete") {
          return apiService.adminDeleteProduct(productId);
        } else {
          // For activate/deactivate, we need to check current status first
          const product = products.find((p) => p.id === productId);
          if (!product) return Promise.resolve();

          const shouldToggle =
            (action === "activate" && !product.isActive) ||
            (action === "deactivate" && product.isActive);

          if (shouldToggle) {
            return apiService.toggleProductStatus(productId);
          }
          return Promise.resolve();
        }
      });

      await Promise.all(promises);

      toast.success(
        `Đã ${
          action === "delete"
            ? "xóa"
            : action === "activate"
            ? "kích hoạt"
            : "vô hiệu hóa"
        } ${selectedProducts.length} sản phẩm`
      );
      setSelectedProducts([]);
      loadProducts();
    } catch (error) {
      console.error(`Bulk ${action} error:`, error);
      toast.error(
        `Lỗi khi ${
          action === "delete"
            ? "xóa"
            : action === "activate"
            ? "kích hoạt"
            : "vô hiệu hóa"
        } sản phẩm`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleProductAction = async (
    productId: string,
    action: "activate" | "deactivate" | "delete"
  ) => {
    try {
      let result;

      if (action === "delete") {
        result = await apiService.adminDeleteProduct(productId);
      } else {
        result = await apiService.toggleProductStatus(productId);
      }

      if (result.success) {
        const actionText =
          action === "activate"
            ? "kích hoạt"
            : action === "deactivate"
            ? "vô hiệu hóa"
            : "xóa";
        toast.success(`Đã ${actionText} sản phẩm thành công`);
        loadProducts();
      } else {
        toast.error(result.error || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Product action error:", error);
      toast.error("Có lỗi xảy ra khi thực hiện hành động");
    }
  };

  const handleCreateProduct = () => {
    console.log("Opening modal with filter options:", {
      categories,
      colors,
      capacities,
    });
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: ProductListItem) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleModalSuccess = () => {
    loadProducts();
  };

  const getStatusBadge = (product: ProductListItem) => {
    if (!product.isActive) {
      return (
        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
          Không hoạt động
        </span>
      );
    }
    if (product.stock <= 5) {
      return (
        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
          Sắp hết hàng
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
        Hoạt động
      </span>
    );
  };

  const isAllSelected =
    selectedProducts.length === products.length && products.length > 0;
  const isIndeterminate =
    selectedProducts.length > 0 && selectedProducts.length < products.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Quản lý sản phẩm
            </h1>
            <p className="text-gray-600 mt-2">
              Quản lý danh sách sản phẩm, tồn kho và trạng thái
            </p>
          </div>
          <button
            onClick={handleCreateProduct}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Thêm sản phẩm
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Tất cả danh mục</option>
              {Array.isArray(categories) &&
                categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>

            {/* Color Filter */}
            <select
              value={filters.color}
              onChange={(e) => handleFilterChange("color", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Tất cả màu sắc</option>
              {Array.isArray(colors) &&
                colors.map((color) => (
                  <option key={color.id} value={color.id}>
                    {color.name}
                  </option>
                ))}
            </select>

            {/* Capacity Filter */}
            <select
              value={filters.capacity}
              onChange={(e) => handleFilterChange("capacity", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Tất cả dung tích</option>
              {Array.isArray(capacities) &&
                capacities.map((capacity) => (
                  <option key={capacity.id} value={capacity.id}>
                    {capacity.name}
                  </option>
                ))}
            </select>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) =>
                handleFilterChange(
                  "status",
                  e.target.value as ProductFilters["status"]
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Không hoạt động</option>
              <option value="low_stock">Sắp hết hàng</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedProducts.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Đã chọn {selectedProducts.length} sản phẩm
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction("activate")}
                  className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                >
                  Kích hoạt
                </button>
                <button
                  onClick={() => handleBulkAction("deactivate")}
                  className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
                >
                  Vô hiệu hóa
                </button>
                <button
                  onClick={() => handleBulkAction("delete")}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isIndeterminate;
                      }}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProducts(products.map((p) => p.id));
                        } else {
                          setSelectedProducts([]);
                        }
                      }}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Danh mục
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thuộc tính
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tồn kho
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                      <p className="text-gray-500 mt-2">Đang tải...</p>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Không có sản phẩm nào</p>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProducts((prev) => [
                                ...prev,
                                product.id,
                              ]);
                            } else {
                              setSelectedProducts((prev) =>
                                prev.filter((id) => id !== product.id)
                              );
                            }
                          }}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            {product.images && product.images[0] ? (
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                width={48}
                                height={48}
                                className="h-12 w-12 rounded-lg object-cover"
                                onError={(e) => {
                                  // Hide image and show fallback icon on error
                                  e.currentTarget.style.display = "none";
                                  const fallback = e.currentTarget
                                    .nextElementSibling as HTMLElement;
                                  if (fallback) fallback.style.display = "flex";
                                }}
                              />
                            ) : null}
                            <div
                              className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center"
                              style={{
                                display:
                                  product.images && product.images[0]
                                    ? "none"
                                    : "flex",
                              }}
                            >
                              <ImageIcon className="w-6 h-6 text-gray-400" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {product.slug}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {product.category.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full border"
                              style={{ backgroundColor: product.color.hexCode }}
                            />
                            <span>{product.color.name}</span>
                          </div>
                          <div>{product.capacity.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <span
                            className={
                              product.stock <= 5
                                ? "text-red-600 font-medium"
                                : ""
                            }
                          >
                            {product.stock}
                          </span>
                          {product.stock <= 5 && (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(product)}</td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleProductAction(
                                product.id,
                                product.isActive ? "deactivate" : "activate"
                              )
                            }
                            className={`p-1 ${
                              product.isActive
                                ? "text-yellow-600 hover:text-yellow-900"
                                : "text-green-600 hover:text-green-900"
                            }`}
                            title={
                              product.isActive ? "Vô hiệu hóa" : "Kích hoạt"
                            }
                          >
                            {product.isActive ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() =>
                              handleProductAction(product.id, "delete")
                            }
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 border-t flex items-center justify-between sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: Math.max(1, prev.page - 1),
                    }))
                  }
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Trước
                </button>
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: Math.min(prev.totalPages, prev.page + 1),
                    }))
                  }
                  disabled={pagination.page === pagination.totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Hiển thị{" "}
                    <span className="font-medium">
                      {(pagination.page - 1) * pagination.limit + 1}
                    </span>{" "}
                    đến{" "}
                    <span className="font-medium">
                      {Math.min(
                        pagination.page * pagination.limit,
                        pagination.total
                      )}
                    </span>{" "}
                    trong tổng số{" "}
                    <span className="font-medium">{pagination.total}</span> kết
                    quả
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: Math.max(1, prev.page - 1),
                        }))
                      }
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Trước
                    </button>
                    {Array.from(
                      { length: Math.min(5, pagination.totalPages) },
                      (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() =>
                              setPagination((prev) => ({ ...prev, page }))
                            }
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === pagination.page
                                ? "z-10 bg-green-50 border-green-500 text-green-600"
                                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      }
                    )}
                    <button
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: Math.min(prev.totalPages, prev.page + 1),
                        }))
                      }
                      disabled={pagination.page === pagination.totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Sau
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleModalSuccess}
        product={editingProduct}
        categories={Array.isArray(categories) ? categories : []}
        colors={Array.isArray(colors) ? colors : []}
        capacities={Array.isArray(capacities) ? capacities : []}
      />
    </div>
  );
}
