"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { X, Save, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { HeroImage } from "@/hooks/admin/useHeroImages";
import type { RootState } from "@/store";

interface EditModalProps {
  image: HeroImage;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditModal({ image, onClose, onSuccess }: EditModalProps) {
  const [formData, setFormData] = useState({
    title: image.title,
    altText: image.altText,
    isActive: image.isActive,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Get auth token from Redux store
  const token = useSelector((state: RootState) => state.auth.token);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh hợp lệ!");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước file không được vượt quá 5MB!");
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const getAuthHeaders = (): Record<string, string> => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề!");
      return;
    }

    if (!formData.altText.trim()) {
      toast.error("Vui lòng nhập alt text!");
      return;
    }

    setUpdating(true);

    try {
      const submitData = new FormData();

      // Add image file if selected
      if (selectedFile) {
        submitData.append("image", selectedFile);
      }

      submitData.append("title", formData.title.trim());
      submitData.append("altText", formData.altText.trim());
      submitData.append("isActive", formData.isActive.toString());

      const response = await fetch(`/api/admin/hero-images/${image.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: submitData,
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Đã cập nhật hero image thành công!");
        onSuccess();
      } else {
        toast.error(data.message || "Không thể cập nhật hero image");
      }
    } catch (error) {
      console.error("Error updating hero image:", error);
      toast.error("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">
              Chỉnh sửa Hero Image
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Current Image */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Ảnh hiện tại
              </label>
              <div className="relative h-48 bg-gray-700 rounded-lg overflow-hidden">
                <Image
                  src={image.imageUrl}
                  alt={image.altText}
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            {/* New Image Upload */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Thay đổi ảnh (tùy chọn)
              </label>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center relative">
                {preview ? (
                  <div className="space-y-4">
                    <div className="relative h-48 mx-auto max-w-sm">
                      <Image
                        src={preview}
                        alt="Preview"
                        fill
                        className="object-contain rounded"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreview(null);
                      }}
                      className="text-sm text-gray-400 hover:text-white"
                    >
                      Hủy thay đổi
                    </button>
                  </div>
                ) : (
                  <div>
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-300 mb-2">
                      Kéo thả ảnh mới vào đây hoặc click để chọn
                    </p>
                    <p className="text-gray-500 text-sm">
                      PNG, JPG, WEBP (tối đa 5MB)
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Tiêu đề *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập tiêu đề cho hero image"
                required
              />
            </div>

            {/* Alt Text */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Alt Text *
              </label>
              <input
                type="text"
                value={formData.altText}
                onChange={(e) =>
                  setFormData({ ...formData, altText: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Mô tả ngắn gọn về ảnh (cho SEO và accessibility)"
                required
              />
            </div>

            {/* Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-white">
                Hiển thị ngay trên trang chủ
              </label>
            </div>

            {/* Image Info */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">Thông tin ảnh</h4>
              <div className="text-sm text-gray-300 space-y-1">
                <div>Thứ tự: #{image.order}</div>
                <div>Tạo bởi: {image.createdByAdmin.username}</div>
                <div>
                  Ngày tạo:{" "}
                  {new Date(image.createdAt).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div>
                  Cập nhật lần cuối:{" "}
                  {new Date(image.updatedAt).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 justify-end p-6 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={updating}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {updating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
