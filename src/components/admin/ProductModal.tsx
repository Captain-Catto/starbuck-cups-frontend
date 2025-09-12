"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { X, Upload, ImageIcon } from "lucide-react";
import type { Product, Category, Color, Capacity } from "@/types";

// Extended product type for admin operations
interface AdminProduct extends Product {
  stockQuantity?: number;
  productUrl?: string;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: AdminProduct | null;
  categories: Category[];
  colors: Color[];
  capacities: Capacity[];
}

interface ProductFormData {
  name: string;
  description: string;
  categoryId: string;
  colorId: string;
  capacityId: string;
  stockQuantity: number;
  images: string[];
  productUrl: string;
}

export default function ProductModal({
  isOpen,
  onClose,
  onSuccess,
  product,
  categories,
  colors,
  capacities,
}: ProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // Debug log
  console.log("ProductModal props:", { categories, colors, capacities });

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    categoryId: "",
    colorId: "",
    capacityId: "",
    stockQuantity: 0,
    images: [],
    productUrl: "",
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || "",
        categoryId: product.categoryId,
        colorId: product.colorId,
        capacityId: product.capacityId,
        stockQuantity: product.stockQuantity || 0,
        images: Array.isArray(product.images) ? product.images : [],
        productUrl: product.productUrl || "",
      });
      setImageUrls(Array.isArray(product.images) ? product.images : []);
    } else {
      setFormData({
        name: "",
        description: "",
        categoryId: "",
        colorId: "",
        capacityId: "",
        stockQuantity: 0,
        images: [],
        productUrl: "",
      });
      setImageUrls([]);
    }
  }, [product, isOpen]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For now, create a simple data URL preview
      // In production, this would upload to a file server or cloud storage
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const newImages = [...imageUrls, dataUrl];
        setImageUrls(newImages);
        setFormData((prev) => ({ ...prev, images: newImages }));
        toast.success("Đã thêm hình ảnh");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlAdd = () => {
    const url = prompt("Nhập URL hình ảnh:");
    if (url && url.trim()) {
      const newImages = [...imageUrls, url.trim()];
      setImageUrls(newImages);
      setFormData((prev) => ({ ...prev, images: newImages }));
    }
  };

  const handleImageUrlRemove = (index: number) => {
    const newImages = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newImages);
    setFormData((prev) => ({ ...prev, images: newImages }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name.trim()) {
      toast.error("Tên sản phẩm không được để trống");
      return;
    }
    if (!formData.categoryId) {
      toast.error("Vui lòng chọn danh mục");
      return;
    }
    if (!formData.colorId) {
      toast.error("Vui lòng chọn màu sắc");
      return;
    }
    if (!formData.capacityId) {
      toast.error("Vui lòng chọn dung tích");
      return;
    }

    setLoading(true);
    try {
      const url = product
        ? `/api/admin/products/${product.id}`
        : "/api/admin/products";

      const method = product ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          product ? "Cập nhật sản phẩm thành công" : "Tạo sản phẩm thành công"
        );
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Có lỗi xảy ra khi lưu sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {product ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên sản phẩm *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Nhập tên sản phẩm"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Nhập mô tả sản phẩm"
              rows={3}
            />
          </div>

          {/* Category, Color, Capacity Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Danh mục *
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    categoryId: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Chọn danh mục</option>
                {Array.isArray(categories) &&
                  categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Màu sắc *
              </label>
              <select
                value={formData.colorId}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, colorId: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Chọn màu sắc</option>
                {Array.isArray(colors) &&
                  colors.map((color) => (
                    <option key={color.id} value={color.id}>
                      {color.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dung tích *
              </label>
              <select
                value={formData.capacityId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    capacityId: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Chọn dung tích</option>
                {Array.isArray(capacities) &&
                  capacities.map((capacity) => (
                    <option key={capacity.id} value={capacity.id}>
                      {capacity.name} ({capacity.volumeMl}ml)
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Stock and Product URL Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số lượng tồn kho
              </label>
              <input
                type="number"
                min="0"
                value={formData.stockQuantity}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    stockQuantity: parseInt(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL sản phẩm
              </label>
              <input
                type="url"
                value={formData.productUrl}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    productUrl: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="https://example.com/product"
              />
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hình ảnh sản phẩm
            </label>
            <div className="space-y-2">
              {imageUrls.map((url, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 border border-gray-200 rounded"
                >
                  <ImageIcon className="w-4 h-4 text-gray-400" />
                  <span className="flex-1 text-sm truncate">{url}</span>
                  <button
                    type="button"
                    onClick={() => handleImageUrlRemove(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <label className="flex items-center gap-2 px-3 py-2 text-sm border border-dashed border-gray-300 rounded hover:border-green-500 hover:text-green-600 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Tải lên hình ảnh
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleImageUrlAdd}
                  className="flex items-center gap-2 px-3 py-2 text-sm border border-dashed border-gray-300 rounded hover:border-green-500 hover:text-green-600"
                >
                  <ImageIcon className="w-4 h-4" />
                  Thêm URL hình ảnh
                </button>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Đang lưu..." : product ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
