"use client";

import React, { useState } from "react";
import { VipRadio } from "@/components/admin/VipRadio";

interface ProductFormData {
  name: string;
  description: string;
  slug: string;
  stockQuantity: number;
  productUrl: string;
  isVip: boolean;
  // Add other fields as needed
}

export default function AdminProductForm() {
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    slug: "",
    stockQuantity: 0,
    productUrl: "",
    isVip: false,
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // API call to create/update product
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add auth headers
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Sản phẩm đã được tạo thành công!");
        // Reset form or redirect
      }
    } catch (error) {
      console.error("Error creating product:", error);
      alert("Có lỗi xảy ra khi tạo sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Tạo sản phẩm mới
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Tên sản phẩm *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Nhập tên sản phẩm"
            required
          />
        </div>

        {/* Product Description */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Mô tả sản phẩm
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Nhập mô tả sản phẩm"
          />
        </div>

        {/* Stock Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Số lượng trong kho *
          </label>
          <input
            type="number"
            min="0"
            value={formData.stockQuantity}
            onChange={(e) =>
              setFormData({
                ...formData,
                stockQuantity: parseInt(e.target.value) || 0,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="0"
            required
          />
        </div>

        {/* Product URL */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            URL sản phẩm
          </label>
          <input
            type="url"
            value={formData.productUrl}
            onChange={(e) =>
              setFormData({ ...formData, productUrl: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="https://example.com/product"
          />
        </div>

        {/* VIP Status - Radio Version */}
        <VipRadio
          value={formData.isVip}
          onChange={(isVip) => setFormData({ ...formData, isVip })}
          disabled={loading}
        />

        {/* Alternative: VIP Status - Toggle Version */}
        {/* 
        <VipToggle
          value={formData.isVip}
          onChange={(isVip) => setFormData({ ...formData, isVip })}
          disabled={loading}
        />
        */}

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`
              px-6 py-2 rounded-md font-medium text-white
              ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200"
              }
              transition-colors duration-200
            `}
          >
            {loading ? "Đang tạo..." : "Tạo sản phẩm"}
          </button>
        </div>
      </form>

      {/* Preview */}
      {formData.name && (
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            Preview
          </h3>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {formData.name}
                </h4>
                {formData.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {formData.description}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  Kho: {formData.stockQuantity} sản phẩm
                </p>
              </div>
              {formData.isVip && (
                <div className="ml-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs font-semibold">
                    ⭐ VIP
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
