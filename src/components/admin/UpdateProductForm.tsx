"use client";

import React, { useState, useCallback } from "react";
import { X } from "lucide-react";
import type { Category, Color, Capacity } from "@/types";
import { useUpdateProduct } from "@/hooks/business/useUpdateProduct";
import { uploadAPI } from "@/lib/api/upload";
import { ProductFormFields } from "./ProductFormFields";

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

  const {
    formData,
    errors,
    loading,
    isSubmitting,
    updateField,
    updateTranslation,
    toggleArrayField,
    submitForm,
  } = useUpdateProduct({
    productId,
    onSuccess,
  });

  // Image upload handler
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
      } catch {
      } finally {
        setIsUploading(false);
      }
    },
    [formData.images, updateField]
  );

  // Image reorder handler
  const handleImageReorder = useCallback(
    (newImageUrls: string[]) => {
      updateField("images", newImageUrls);
    },
    [updateField]
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
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          <X className="size-6" />
        </button>
      </div>

      {errors.general && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{errors.general}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <ProductFormFields
          formData={formData}
          errors={errors}
          categories={categories}
          colors={colors}
          capacities={capacities}
          updateField={updateField}
          updateTranslation={updateTranslation}
          toggleArrayField={toggleArrayField}
          images={formData.images || []}
          isUploading={isUploading}
          handleImageSelect={handleImageSelect}
          handleImageReorder={handleImageReorder}
          handleImageUrlRemove={handleImageUrlRemove}
          handleImageUrlAdd={handleImageUrlAdd}
          showActiveToggle={true}
        />

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer"
            disabled={isSubmitting}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 cursor-pointer"
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
