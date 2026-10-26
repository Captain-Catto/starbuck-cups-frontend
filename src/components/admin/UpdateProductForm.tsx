"use client";

import React, { useState, useCallback } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import type { Category, Color, Capacity } from "@/types";
import { useUpdateProduct } from "@/hooks/business/useUpdateProduct";
import { uploadAPI } from "@/lib/client-upload-api";
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
    pinStats,
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
      const input = e.target;
      const files = input.files;
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);

      setIsUploading(true);
      try {
        const uploadResponse = await uploadAPI.uploadProductImages(fileArray);

        if (uploadResponse.success && uploadResponse.data) {
          const currentImages = formData.images || [];
          const newImageUrls = uploadResponse.data.map((item) => item.url);
          const newImages = [...currentImages, ...newImageUrls];
          updateField("images", newImages);
        } else {
          toast.error(uploadResponse.message || "Không thể tải hình ảnh lên");
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Lỗi khi tải lên hình ảnh"
        );
      } finally {
        // Only now: on iOS, clearing the input earlier can invalidate the picked files
        // before they are read. Reset so choosing the same file again still fires onChange.
        input.value = "";
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
    <div className="p-4 pb-0 sm:p-6 sm:pb-0">
      <div className="sticky top-0 z-10 -mx-4 -mt-4 mb-4 flex items-center justify-between border-b bg-white px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:static sm:mx-0 sm:mt-0 sm:mb-6 sm:border-0 sm:p-0">
        <h2 className="text-lg font-semibold sm:text-xl">Chỉnh sửa sản phẩm</h2>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Đóng"
          className="flex size-11 cursor-pointer items-center justify-center text-gray-500 hover:text-gray-700 sm:size-auto"
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
          showPinToggle={true}
          pinStats={pinStats}
        />

        {/* Submit Buttons */}
        <div className="sticky bottom-0 -mx-4 mt-6 flex gap-3 border-t bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:static sm:mx-0 sm:justify-end sm:px-0 sm:pb-4 sm:pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-11 flex-1 cursor-pointer rounded border border-gray-300 px-4 py-2 text-gray-600 hover:bg-gray-50 sm:flex-none"
            disabled={isSubmitting}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="min-h-11 flex-[2] cursor-pointer rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50 sm:flex-none"
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
