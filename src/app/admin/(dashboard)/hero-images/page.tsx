"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useHeroImages, HeroImage } from "@/hooks/admin/useHeroImages";
import { HeroImageGrid } from "@/components/admin/hero-images/HeroImageGrid";
import { UploadModal } from "@/components/admin/hero-images/UploadModal";
import { EditModal } from "@/components/admin/hero-images/EditModal";
import { LoadingState } from "@/components/admin/LoadingState";
import { ErrorMessage } from "@/components/admin/ErrorMessage";
import { EmptyState } from "@/components/admin/EmptyState";
import { PageHeader } from "@/components/admin/PageHeader";

export default function HeroImagesPage() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<HeroImage | null>(null);

  const {
    heroImages,
    loading,
    error,
    fetchHeroImages,
    deleteHeroImage,
    updateHeroImageOrder,
    clearError,
  } = useHeroImages();

  useEffect(() => {
    fetchHeroImages();
  }, [fetchHeroImages]);

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!selectedImage) return;

    const success = await deleteHeroImage(selectedImage.id);
    if (success) {
      toast.success(`Đã xóa hero image "${selectedImage.title}" thành công!`);
      setShowDeleteModal(false);
      setSelectedImage(null);
    }
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6 bg-gray-900 min-h-screen p-6">
      <PageHeader
        title="Quản lý Hero Images"
        description="Quản lý ảnh hiển thị trên hero section của trang chủ"
        action={
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Thêm Hero Image
          </button>
        }
      />

      {/* Error Message */}
      {error && (
        <ErrorMessage
          error={error}
          onRetry={() => {
            clearError();
            fetchHeroImages();
          }}
        />
      )}

      {/* Content */}
      {heroImages.length === 0 ? (
        <EmptyState
          title="Chưa có hero image nào"
          description="Thêm hero images để hiển thị trên trang chủ"
          actionLabel="Thêm Hero Image đầu tiên"
          onAction={() => setShowUploadModal(true)}
        />
      ) : (
        <HeroImageGrid
          heroImages={heroImages}
          onEdit={(img) => {
            setSelectedImage(img);
            setShowEditModal(true);
          }}
          onDelete={(img) => {
            setSelectedImage(img);
            setShowDeleteModal(true);
          }}
          onReorder={updateHeroImageOrder}
          formatDate={formatDate}
        />
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            fetchHeroImages();
          }}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedImage && (
        <EditModal
          image={selectedImage}
          onClose={() => {
            setShowEditModal(false);
            setSelectedImage(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedImage(null);
            fetchHeroImages();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-white mb-4">
                Xác nhận xóa Hero Image
              </h3>
              <p className="text-gray-300 mb-6">
                Bạn có chắc chắn muốn xóa hero image &quot;{selectedImage.title}
                &quot;? Thao tác này không thể hoàn tác.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedImage(null);
                  }}
                  className="px-4 py-2 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
