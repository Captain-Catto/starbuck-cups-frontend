"use client";

import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import type { Category, Color, Capacity } from "@/types";
import { useProductForm } from "@/hooks/business/useProductForm";
import { useUpload } from "@/hooks/useUpload";
import { ProductFormFields } from "./ProductFormFields";

interface CreateProductFormProps {
  onCancel: () => void;
  onSuccess: () => void;
  categories: Category[];
  colors: Color[];
  capacities: Capacity[];
}

export function CreateProductForm({
  onCancel,
  onSuccess,
  categories,
  colors,
  capacities,
}: CreateProductFormProps) {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const selectedFilesRef = useRef<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Upload hook
  const { uploadProductImages } = useUpload();

  const {
    formData,
    errors,
    isSubmitting,
    updateField,
    updateTranslation,
    toggleArrayField,
    submitFormWithImages,
  } = useProductForm({
    initialData: undefined,
    isEditing: false,
    productId: undefined,
    onSuccess: () => {
      onSuccess?.();
    },
  });

  // Callback for image reordering
  const handleImageReorder = useCallback(
    (newImageUrls: string[]) => {
      setImageUrls(newImageUrls);
      updateField("images", newImageUrls);
      updateField("imageUrl", newImageUrls[0] || "");
    },
    [updateField]
  );

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Convert FileList to Array and add to selected files
    const fileArray = Array.from(files);
    const newFiles = [...selectedFilesRef.current, ...fileArray];
    selectedFilesRef.current = newFiles;

    // Create preview URLs for display
    const previewUrls = fileArray.map((file) => URL.createObjectURL(file));
    const allPreviews = [...imageUrls, ...previewUrls];
    setImageUrls(allPreviews);

    // Update form state
    updateField("images", allPreviews);
    updateField("imageUrl", allPreviews[0] || "");

    toast.success(`Đã chọn ${fileArray.length} hình ảnh`);

    // Reset input value
    e.target.value = "";
  };

  const handleImageUrlAdd = () => {
    const url = prompt("Nhập URL hình ảnh:");
    if (url && url.trim()) {
      const newImages = [...imageUrls, url.trim()];
      setImageUrls(newImages);
      updateField("images", newImages);
      updateField("imageUrl", newImages[0] || "");
    }
  };

  const handleImageUrlRemove = (index: number) => {
    const removedUrl = imageUrls[index];

    // Remove from image URLs
    const newImages = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newImages);

    // Update form data
    updateField("images", newImages);
    updateField("imageUrl", newImages[0] || "");

    // If it's a blob URL (preview), remove from selected files too
    if (removedUrl.startsWith("blob:")) {
      const existingUrlsCount = imageUrls
        .slice(0, index)
        .filter((url) => !url.startsWith("blob:")).length;

      if (index >= existingUrlsCount) {
        const fileIndex = index - existingUrlsCount;
        const newFiles = selectedFilesRef.current.filter((_, i) => i !== fileIndex);
        selectedFilesRef.current = newFiles;
      }

      // Revoke blob URL to prevent memory leaks
      URL.revokeObjectURL(removedUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalImageUrls = [...imageUrls];

    // Upload selected files first if any
    if (selectedFilesRef.current.length > 0) {
      setIsUploading(true);
      try {
        const response = await uploadProductImages(selectedFilesRef.current);

        if (response.success) {
          const uploadedUrls = response.data.map(
            (item: { url: string }) => item.url
          );

          // Replace blob URLs with actual uploaded URLs
          finalImageUrls = imageUrls.map((url) => {
            if (url.startsWith("blob:")) {
              const blobIndex = imageUrls
                .filter((u) => u.startsWith("blob:"))
                .indexOf(url);
              return uploadedUrls[blobIndex] || url;
            }
            return url;
          });

          // Update form state
          updateField("images", finalImageUrls);
          updateField("imageUrl", finalImageUrls[0] || "");

          toast.success(
            `Đã tải lên ${selectedFilesRef.current.length} hình ảnh thành công`
          );

          // Clear selected files and update URLs
          selectedFilesRef.current = [];
          setImageUrls(finalImageUrls);
        }
      } catch (error: unknown) {
        toast.error(
          error instanceof Error ? error.message : "Lỗi khi tải lên hình ảnh"
        );
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    // Submit form with final image URLs
    await submitFormWithImages(finalImageUrls);
  };

  return (
    <div>
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-xl font-semibold">Thêm sản phẩm mới</h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          <X className="size-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <ProductFormFields
          formData={formData}
          errors={errors}
          categories={categories}
          colors={colors}
          capacities={capacities}
          updateField={updateField}
          updateTranslation={updateTranslation}
          toggleArrayField={toggleArrayField}
          images={imageUrls}
          isUploading={isUploading}
          handleImageSelect={handleImageSelect}
          handleImageReorder={handleImageReorder}
          handleImageUrlRemove={handleImageUrlRemove}
          handleImageUrlAdd={handleImageUrlAdd}
          showActiveToggle={false}
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
              ? "Đang lưu..."
              : "Tạo mới"}
          </button>
        </div>
      </form>
    </div>
  );
}
