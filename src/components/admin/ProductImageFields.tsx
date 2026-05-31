"use client";

import React from "react";
import { Upload, ImageIcon } from "lucide-react";
import ImageReorder from "./ImageReorder";

interface ProductImageFieldsProps {
  images: string[];
  isUploading: boolean;
  handleImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleImageReorder: (newImages: string[]) => void;
  handleImageUrlRemove: (index: number) => void;
  handleImageUrlAdd: () => void;
  errors: Record<string, string>;
}

export function ProductImageFields({
  images,
  isUploading,
  handleImageSelect,
  handleImageReorder,
  handleImageUrlRemove,
  handleImageUrlAdd,
  errors,
}: ProductImageFieldsProps) {
  return (
    <div>
      <span className="block text-sm font-medium text-gray-700 mb-1">
        Hình ảnh sản phẩm
      </span>

      {/* Image Reorder Component */}
      {images.length > 0 && (
        <div className="mb-4">
          <ImageReorder
            images={images}
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
          <Upload className="size-4" />
          {isUploading ? "Đang tải lên..." : "Chọn hình ảnh"}
          <input
            aria-label="file"
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
          className="flex items-center gap-2 px-3 py-2 text-sm border border-dashed border-gray-300 rounded hover:border-green-500 hover:text-green-600 cursor-pointer"
          disabled={isUploading}
        >
          <ImageIcon className="size-4" />
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
  );
}
