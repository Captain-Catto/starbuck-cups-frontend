"use client";

import React from "react";
import type { Category, Color, Capacity, ProductLocale } from "@/types";
import type { ProductTranslationsInput } from "@/types";
import { VipToggle } from "./VipRadio";
import { FeaturedToggle } from "./FeaturedToggle";
import { ProductTranslationsFields } from "./ProductTranslationsFields";
import { ProductImageFields } from "./ProductImageFields";

// Shared shape used by both useProductForm's ProductFormData (capacityIds)
// and useUpdateProduct's UpdateProductFormData (capacityId) — this component
// is duck-typed across both forms, so only the fields it actually reads are listed.
interface ProductFormFieldsData {
  translations: ProductTranslationsInput;
  hasVariants: boolean;
  categoryIds: string[];
  colorIds: string[];
  capacityId?: string;
  capacityIds?: string[];
  stockQuantity: number;
  productUrl: string;
  isActive: boolean;
  isVip: boolean;
  isFeatured: boolean;
}

interface ProductFormFieldsProps {
  formData: ProductFormFieldsData;
  errors: Record<string, string>;
  categories: Category[];
  colors: Color[];
  capacities: Capacity[];
  // Method shorthand (bivariant params) so either form's narrower updateField/toggleArrayField can be passed.
  updateField(key: string, value: unknown): void;
  updateTranslation(
    lang: ProductLocale,
    field: "name" | "description" | "metaTitle" | "metaDescription",
    value: string
  ): void;
  toggleArrayField(key: string, value: string): void;
  images: string[];
  isUploading: boolean;
  handleImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleImageReorder: (newImages: string[]) => void;
  handleImageUrlRemove: (index: number) => void;
  handleImageUrlAdd: () => void;
  showActiveToggle?: boolean;
}

export function ProductFormFields({
  formData,
  errors,
  categories,
  colors,
  capacities,
  updateField,
  updateTranslation,
  toggleArrayField,
  images,
  isUploading,
  handleImageSelect,
  handleImageReorder,
  handleImageUrlRemove,
  handleImageUrlAdd,
  showActiveToggle = false,
}: ProductFormFieldsProps) {
  return (
    <div className="space-y-4">
      {/* Multilingual Product Name & Description */}
      <ProductTranslationsFields
        translations={formData.translations}
        onChange={updateTranslation}
      />

      {/* Variants Toggle */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            aria-label="checkbox"
            type="checkbox"
            checked={formData.hasVariants || false}
            onChange={(e) => updateField("hasVariants", e.target.checked)}
            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Sản phẩm này có phân loại Màu Sắc & Dung Tích
          </span>
        </label>
      </div>

      {/* Category, Color, Capacity Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <span className="block text-sm font-medium text-gray-700 mb-1">
            Danh mục <span className="text-red-500">*</span>
          </span>
          <div
            className={`space-y-2 max-h-32 overflow-y-auto border rounded-md p-2 ${
              errors.categoryIds ? "border-red-500" : "border-gray-300"
            }`}
          >
            {Array.isArray(categories) &&
              categories.map((category) => (
                <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    aria-label="checkbox"
                    type="checkbox"
                    checked={formData.categoryIds?.includes(category.id) || false}
                    onChange={() => toggleArrayField("categoryIds", category.id)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm">{category.name}</span>
                </label>
              ))}
          </div>
          {errors.categoryIds && (
            <p className="mt-1 text-sm text-red-600">{errors.categoryIds}</p>
          )}
        </div>

        {formData.hasVariants && (
          <>
            <div>
              <span className="block text-sm font-medium text-gray-700 mb-1">
                Màu sắc <span className="text-red-500">*</span>
              </span>
              <div
                className={`space-y-2 max-h-32 overflow-y-auto border rounded-md p-2 ${
                  errors.colorIds ? "border-red-500" : "border-gray-300"
                }`}
              >
                {Array.isArray(colors) &&
                  colors.map((color) => (
                    <label key={color.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        aria-label="checkbox"
                        type="checkbox"
                        checked={formData.colorIds?.includes(color.id) || false}
                        onChange={() => toggleArrayField("colorIds", color.id)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm flex items-center gap-2">
                        <div
                          className="size-4 rounded border border-gray-300"
                          style={{ backgroundColor: color.hexCode }}
                        ></div>
                        {color.name}
                      </span>
                    </label>
                  ))}
              </div>
              {errors.colorIds && (
                <p className="mt-1 text-sm text-red-600">{errors.colorIds}</p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="product-capacity-select"
              >
                Dung tích <span className="text-red-500">*</span>
              </label>
              <select
                aria-label="Select option"
                value={formData.capacityId || formData.capacityIds?.[0] || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  if (formData.capacityId !== undefined) {
                    updateField("capacityId", val);
                  } else {
                    updateField("capacityIds", val ? [val] : []);
                  }
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.capacityId || errors.capacityIds
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                required
                id="product-capacity-select"
              >
                <option value="">Chọn dung tích</option>
                {Array.isArray(capacities) &&
                  capacities.map((capacity) => (
                    <option key={capacity.id} value={capacity.id}>
                      {capacity.name} ({capacity.volumeMl}ml)
                    </option>
                  ))}
              </select>
              {(errors.capacityId || errors.capacityIds) && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.capacityId || errors.capacityIds}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Stock and Product URL Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="product-stock">
            Số lượng tồn kho
          </label>
          <input
            aria-label="stock quantity"
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
            id="product-stock"
          />
          {errors.stockQuantity && (
            <p className="mt-1 text-sm text-red-600">{errors.stockQuantity}</p>
          )}
        </div>

        <div>
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor="product-url"
          >
            URL sản phẩm
          </label>
          <input
            aria-label="product URL"
            type="url"
            value={formData.productUrl}
            onChange={(e) => updateField("productUrl", e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.productUrl ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="https://example.com/product"
            id="product-url"
          />
          {errors.productUrl && (
            <p className="mt-1 text-sm text-red-600">{errors.productUrl}</p>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="space-y-4">
        {showActiveToggle && (
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                aria-label="checkbox"
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
        )}

        {/* VIP Status */}
        <div>
          <span className="block text-sm font-medium text-gray-700 mb-2">
            Trạng thái VIP
          </span>
          <VipToggle
            value={formData.isVip || false}
            onChange={(isVip) => updateField("isVip", isVip)}
          />
        </div>

        {/* Featured Status */}
        <div>
          <span className="block text-sm font-medium text-gray-700 mb-2">
            Trạng thái Nổi bật
          </span>
          <FeaturedToggle
            value={formData.isFeatured || false}
            onChange={(isFeatured) => updateField("isFeatured", isFeatured)}
          />
        </div>
      </div>

      {/* Images Section */}
      <ProductImageFields
        images={images}
        isUploading={isUploading}
        handleImageSelect={handleImageSelect}
        handleImageReorder={handleImageReorder}
        handleImageUrlRemove={handleImageUrlRemove}
        handleImageUrlAdd={handleImageUrlAdd}
        errors={errors}
      />
    </div>
  );
}
