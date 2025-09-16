"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { X, Upload, ImageIcon } from "lucide-react";
import type { Product, Category, Color, Capacity } from "@/types";
import {
  useProductForm,
  type ProductFormData as HookFormData,
} from "@/hooks/business/useProductForm";
import { UpdateProductForm } from "./UpdateProductForm";
import { useUpload } from "@/hooks/useUpload";
import ImageReorder from "./ImageReorder";

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
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Upload hook
  const { uploadProductImages } = useUpload();

  // Debug log
  console.log("ProductModal props:", { categories, colors, capacities });

  // Prepare initial data for hook
  const initialData = product
    ? {
        name: product.name,
        description: product.description || "",
        imageUrl: Array.isArray(product.images) ? product.images[0] : "",
        colorIds: product.colorId ? [product.colorId] : [],
        capacityIds: product.capacityId ? [product.capacityId] : [],
        categoryIds: product.categoryId ? [product.categoryId] : [],
        isActive: product.isActive ?? true,
      }
    : undefined;

  const {
    formData,
    errors,
    isSubmitting,
    updateField,
    toggleArrayField,
    submitForm,
    submitFormWithImages,
  } = useProductForm({
    initialData,
    isEditing: !!product,
    productId: product?.id,
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
  });

  // Callback for image reordering (after updateField is available)
  const handleImageReorder = useCallback(
    (newImageUrls: string[]) => {
      setImageUrls(newImageUrls);
      updateField("images", newImageUrls);
      updateField("imageUrl", newImageUrls[0] || "");
    },
    [updateField]
  );

  useEffect(() => {
    if (product) {
      setImageUrls(Array.isArray(product.images) ? product.images : []);
      setSelectedFiles([]);
    } else {
      setImageUrls([]);
      setSelectedFiles([]);
    }
  }, [product, isOpen]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Convert FileList to Array and add to selected files
    const fileArray = Array.from(files);
    const newFiles = [...selectedFiles, ...fileArray];
    setSelectedFiles(newFiles);

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
      const urlToFileIndex = imageUrls
        .slice(0, index)
        .filter((url) => url.startsWith("blob:")).length;
      const existingUrlsCount = imageUrls
        .slice(0, index)
        .filter((url) => !url.startsWith("blob:")).length;

      if (index >= existingUrlsCount) {
        const fileIndex = index - existingUrlsCount;
        const newFiles = selectedFiles.filter((_, i) => i !== fileIndex);
        setSelectedFiles(newFiles);
      }

      // Revoke blob URL to prevent memory leaks
      URL.revokeObjectURL(removedUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalImageUrls = [...imageUrls];

    // Upload selected files first if any
    if (selectedFiles.length > 0) {
      setIsUploading(true);
      try {
        const response = await uploadProductImages(selectedFiles);

        if (response.success) {
          const uploadedUrls = response.data.map((item) => item.url);

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
            `Đã tải lên ${selectedFiles.length} hình ảnh thành công`
          );

          // Clear selected files and update URLs
          setSelectedFiles([]);
          setImageUrls(finalImageUrls);
        }
      } catch (error: any) {
        console.error("Upload error:", error);
        toast.error(error.message || "Lỗi khi tải lên hình ảnh");
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    // Submit form with final image URLs
    await submitFormWithImages(finalImageUrls);
  };

  if (!isOpen) return null;

  // If editing existing product, use UpdateProductForm
  if (product) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <UpdateProductForm
            productId={product.id}
            onCancel={onClose}
            onSuccess={() => {
              onSuccess?.();
              onClose();
            }}
            categories={Array.isArray(categories) ? categories : []}
            colors={Array.isArray(colors) ? colors : []}
            capacities={Array.isArray(capacities) ? capacities : []}
          />
        </div>
      </div>
    );
  }

  // For creating new product, keep existing form
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Thêm sản phẩm mới</h2>
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
              onChange={(e) => updateField("name", e.target.value)}
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
                Danh mục *
              </label>
              <select
                value={formData.categoryIds[0] || ""}
                onChange={(e) => {
                  updateField(
                    "categoryIds",
                    e.target.value ? [e.target.value] : []
                  );
                }}
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
                value={formData.colorIds[0] || ""}
                onChange={(e) => {
                  updateField(
                    "colorIds",
                    e.target.value ? [e.target.value] : []
                  );
                }}
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
                value={formData.capacityIds[0] || ""}
                onChange={(e) => {
                  updateField(
                    "capacityIds",
                    e.target.value ? [e.target.value] : []
                  );
                }}
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
                  updateField("stockQuantity", parseInt(e.target.value) || 0)
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
                onChange={(e) => updateField("productUrl", e.target.value)}
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

            {/* Image Reorder Component */}
            {imageUrls.length > 0 && (
              <div className="mb-4">
                <ImageReorder
                  images={imageUrls}
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
              onClick={onClose}
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
                ? "Đang lưu..."
                : product
                ? "Cập nhật"
                : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
