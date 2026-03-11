"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  PromotionalBanner,
  CreatePromotionalBannerData,
  UpdatePromotionalBannerData,
} from "@/hooks/admin/usePromotionalBanner";

interface BannerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: CreatePromotionalBannerData | UpdatePromotionalBannerData
  ) => Promise<boolean>;
  banner?: PromotionalBanner | null;
  loading?: boolean;
}

export function BannerFormModal({
  isOpen,
  onClose,
  onSubmit,
  banner,
  loading = false,
}: BannerFormModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    highlightText: "",
    highlightColor: "",
    description: "",
    buttonText: "",
    buttonLink: "",
    priority: 0,
    validFrom: "",
    validUntil: "",
  });

  useEffect(() => {
    if (banner) {
      setFormData({
        title: banner.title || "",
        highlightText: banner.highlightText || "",
        highlightColor: banner.highlightColor || "",
        description: banner.description || "",
        buttonText: banner.buttonText || "",
        buttonLink: banner.buttonLink || "",
        priority: banner.priority || 0,
        validFrom: banner.validFrom ? banner.validFrom.split("T")[0] : "",
        validUntil: banner.validUntil ? banner.validUntil.split("T")[0] : "",
      });
    } else {
      // Reset form for new banner
      setFormData({
        title: "",
        highlightText: "",
        highlightColor: "",
        description: "",
        buttonText: "Khám Phá Ngay",
        buttonLink: "/products",
        priority: 0,
        validFrom: "",
        validUntil: "",
      });
    }
  }, [banner, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitData: CreatePromotionalBannerData = {
      title: formData.title,
      highlightText: formData.highlightText || null,
      highlightColor: formData.highlightColor || null,
      description: formData.description,
      buttonText: formData.buttonText,
      buttonLink: formData.buttonLink,
      priority: formData.priority,
      validFrom: formData.validFrom || null,
      validUntil: formData.validUntil || null,
    };

    const success = await onSubmit(submitData);
    if (success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">
            {banner ? "Chỉnh sửa Banner" : "Tạo Banner mới"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Tiêu đề chính *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              placeholder="Bộ Sưu Tập"
              required
            />
          </div>

          {/* Highlight Text */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Highlight Text
            </label>
            <input
              type="text"
              value={formData.highlightText}
              onChange={(e) =>
                setFormData({ ...formData, highlightText: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              placeholder="Ly Starbucks"
            />
          </div>

          {/* Highlight Color */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Màu Highlight Text
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                value={formData.highlightColor || "#10b981"}
                onChange={(e) =>
                  setFormData({ ...formData, highlightColor: e.target.value })
                }
                className="w-16 h-10 bg-gray-700 border border-gray-600 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={formData.highlightColor || "#10b981"}
                onChange={(e) =>
                  setFormData({ ...formData, highlightColor: e.target.value })
                }
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                placeholder="#10b981"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Chọn màu cho highlight text (mặc định: xanh lá)
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Mô tả *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              placeholder="Khám phá bộ sưu tập ly Starbucks đa dạng với nhiều màu sắc và dung tích..."
              rows={3}
              required
            />
          </div>

          {/* Button Text and Link */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Text Button *
              </label>
              <input
                type="text"
                value={formData.buttonText}
                onChange={(e) =>
                  setFormData({ ...formData, buttonText: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                placeholder="Khám Phá Ngay"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Link Button *
              </label>
              <input
                type="text"
                value={formData.buttonLink}
                onChange={(e) =>
                  setFormData({ ...formData, buttonLink: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                placeholder="/products"
                required
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Độ ưu tiên
            </label>
            <input
              type="number"
              value={formData.priority}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  priority: parseInt(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              min="0"
            />
            <p className="text-xs text-gray-400 mt-1">
              Số càng cao càng ưu tiên hiển thị
            </p>
          </div>

          {/* Valid Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Hiệu lực từ ngày
              </label>
              <input
                type="date"
                value={formData.validFrom}
                onChange={(e) =>
                  setFormData({ ...formData, validFrom: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Hết hạn ngày
              </label>
              <input
                type="date"
                value={formData.validUntil}
                onChange={(e) =>
                  setFormData({ ...formData, validUntil: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? "Đang xử lý..." : banner ? "Cập nhật" : "Tạo Banner"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
