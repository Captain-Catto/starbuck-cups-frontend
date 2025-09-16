"use client";

import React, { useState, useCallback } from "react";
import { X, Upload, ImageIcon } from "lucide-react";
import type { Category, Color, Capacity } from "@/types";
import { useUpdateProduct } from "@/hooks/business/useUpdateProduct";
import { uploadAPI } from "@/lib/api/upload";
import ImageReorder from "./ImageReorder";

interface UpdateProductFormProps {
  productId: string;
  onCancel: () => void;
  onSuccess: () => void;
  categories: Category[];
  colors: Color[];
  capacities: Capacity[];
}

export function UpdateProductForm({
  productId,
  onCancel,
  onSuccess,
  categories,
  colors,
  capacities,
}: UpdateProductFormProps) {
  const [isUploading, setIsUploading] = useState(false);

  const { formData, errors, loading, isSubmitting, updateField, submitForm } =
    useUpdateProduct({
      productId,
      onSuccess,
    });

  // Image upload handler - similar to ProductModal
  const handleImageSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      setIsUploading(true);
      try {
        const fileArray = Array.from(files);
        const uploadResponse = await uploadAPI.uploadProductImages(fileArray);

        if (uploadResponse.success && uploadResponse.data) {
          const currentImages = formData.images || [];
          const newImageUrls = uploadResponse.data.map((item) => item.url);
          const newImages = [...currentImages, ...newImageUrls];
          updateField("images", newImages);
        }
      } catch (error) {
        console.error("Upload failed:", error);
      } finally {
        setIsUploading(false);
      }
    },
    [formData.images, updateField]
  );

  // Image reorder handler - similar to ProductModal
  const handleImageReorder = useCallback(
    (newImageUrls: string[]) => {
      console.log("🔄 [UpdateProductForm] Image reorder triggered");
      console.log("📊 Old images order:", formData.images);
      console.log("📊 New images order:", newImageUrls);
      console.log(
        "📊 Images changed:",
        JSON.stringify(formData.images) !== JSON.stringify(newImageUrls)
      );
      updateField("images", newImageUrls);
    },
    [updateField, formData.images]
  );

  const handleImageUrlRemove = useCallback(
    (index: number) => {
      const newImages = formData.images.filter((_, i) => i !== index);
      updateField("images", newImages);
    },
    [formData.images, updateField]
  );

  const handleImageUrlAdd = () => {
    const url = prompt("Nhập URL hình ảnh:");
    if (url && url.trim()) {
      const newImages = [...formData.images, url.trim()];
      updateField("images", newImages);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🚀 [UpdateProductForm] Form submission started");
    console.log("📋 Current form data:", {
      productId,
      name: formData.name,
      images: formData.images,
      imageCount: formData.images.length,
    });
    await submitForm();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Chỉnh sửa sản phẩm</h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {errors.general && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{errors.general}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tên sản phẩm <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Nhập tên sản phẩm"
            required
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Nhập mô tả sản phẩm"
            rows={3}
          />
        </div>

        {/* Category, Color, Capacity Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Danh mục <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => updateField("categoryId", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.categoryId ? "border-red-500" : "border-gray-300"
              }`}
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
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Màu sắc <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.colorId}
              onChange={(e) => updateField("colorId", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.colorId ? "border-red-500" : "border-gray-300"
              }`}
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
            {errors.colorId && (
              <p className="mt-1 text-sm text-red-600">{errors.colorId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dung tích <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.capacityId}
              onChange={(e) => updateField("capacityId", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.capacityId ? "border-red-500" : "border-gray-300"
              }`}
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
            {errors.capacityId && (
              <p className="mt-1 text-sm text-red-600">{errors.capacityId}</p>
            )}
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
                updateField("stockQuantity", parseInt(e.target.value) || 0)
              }
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.stockQuantity ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="0"
            />
            {errors.stockQuantity && (
              <p className="mt-1 text-sm text-red-600">
                {errors.stockQuantity}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL sản phẩm
            </label>
            <input
              type="url"
              value={formData.productUrl}
              onChange={(e) => updateField("productUrl", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.productUrl ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="https://example.com/product"
            />
            {errors.productUrl && (
              <p className="mt-1 text-sm text-red-600">{errors.productUrl}</p>
            )}
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => updateField("isActive", e.target.checked)}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Sản phẩm đang hoạt động
            </span>
          </label>
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hình ảnh sản phẩm
          </label>

          {/* Image Reorder Component */}
          {formData.images.length > 0 && (
            <div className="mb-4">
              <ImageReorder
                images={formData.images}
                onReorder={handleImageReorder}
                onRemove={handleImageUrlRemove}
                className="bg-gray-50 p-3 rounded-md border"
              />
            </div>
          )}

          {/* Upload Controls */}
          <div className="flex gap-2">
            <label
              className={`flex items-center gap-2 px-3 py-2 text-sm border border-dashed border-gray-300 rounded hover:border-green-500 hover:text-green-600 cursor-pointer ${
                isUploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Upload className="w-4 h-4" />
              {isUploading ? "Đang tải lên..." : "Chọn hình ảnh"}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
                disabled={isUploading}
              />
            </label>
            <button
              type="button"
              onClick={handleImageUrlAdd}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-dashed border-gray-300 rounded hover:border-green-500 hover:text-green-600"
              disabled={isUploading}
            >
              <ImageIcon className="w-4 h-4" />
              Thêm URL hình ảnh
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-2">
            Chọn nhiều hình ảnh và kéo thả để sắp xếp thứ tự hiển thị
          </p>

          {/* Error message for images */}
          {errors.images && (
            <p className="text-red-500 text-sm mt-1">{errors.images}</p>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            disabled={isSubmitting || isUploading}
          >
            {isUploading
              ? "Đang tải hình..."
              : isSubmitting
              ? "Đang cập nhật..."
              : "Cập nhật sản phẩm"}
          </button>
        </div>
      </form>
    </div>
  );
}
