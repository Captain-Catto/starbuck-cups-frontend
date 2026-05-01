"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  usePromotionalBanner,
  PromotionalBanner,
  CreatePromotionalBannerData,
  UpdatePromotionalBannerData,
} from "@/hooks/admin/usePromotionalBanner";
import { BannerCard } from "@/components/admin/promotional-banners/BannerCard";
import { BannerFormModal } from "@/components/admin/promotional-banners/BannerFormModal";
import { LoadingState } from "@/components/admin/LoadingState";
import { ErrorMessage } from "@/components/admin/ErrorMessage";
import { EmptyState } from "@/components/admin/EmptyState";
import { PageHeader } from "@/components/admin/PageHeader";

export const dynamic = "force-dynamic";

export default function PromotionalBannersPage() {
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBanner, setSelectedBanner] =
    useState<PromotionalBanner | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const {
    banners,
    loading,
    error,
    fetchBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    clearError,
  } = usePromotionalBanner();

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleCreate = () => {
    setSelectedBanner(null);
    setIsEditing(false);
    setShowFormModal(true);
  };

  const handleEdit = (banner: PromotionalBanner) => {
    setSelectedBanner(banner);
    setIsEditing(true);
    setShowFormModal(true);
  };

  const handleDelete = (banner: PromotionalBanner) => {
    setSelectedBanner(banner);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBanner) return;

    const success = await deleteBanner(selectedBanner.id);
    if (success) {
      toast.success(`Đã xóa banner "${selectedBanner.title}" thành công!`);
      setShowDeleteModal(false);
      setSelectedBanner(null);
    }
  };

  const handleToggleActive = async (banner: PromotionalBanner) => {
    const success = await updateBanner(banner.id, {
      isActive: !banner.isActive,
    });

    if (success) {
      toast.success(
        `Banner đã được ${!banner.isActive ? "kích hoạt" : "vô hiệu hóa"}!`
      );
    }
  };

  const handleFormSubmit = async (
    data: CreatePromotionalBannerData | UpdatePromotionalBannerData
  ) => {
    if (isEditing && selectedBanner) {
      return await updateBanner(
        selectedBanner.id,
        data as UpdatePromotionalBannerData
      );
    } else {
      return await createBanner(data as CreatePromotionalBannerData);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading && banners.length === 0) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6 bg-gray-900 min-h-screen p-6">
      <PageHeader
        title="Quản lý Banner Quảng cáo"
        description="Quản lý banner promotional hiển thị trên hero section của trang chủ"
        action={
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tạo Banner mới
          </button>
        }
      />

      {/* Error Message */}
      {error && (
        <ErrorMessage
          error={error}
          onRetry={() => {
            clearError();
            fetchBanners();
          }}
        />
      )}

      {/* Content */}
      {banners.length === 0 ? (
        <EmptyState
          title="Chưa có banner nào"
          description="Tạo banner promotional để hiển thị trên trang chủ"
          actionLabel="Tạo Banner đầu tiên"
          onAction={handleCreate}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <BannerCard
              key={banner.id}
              banner={banner}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showFormModal && (
        <BannerFormModal
          isOpen={showFormModal}
          onClose={() => {
            setShowFormModal(false);
            setSelectedBanner(null);
          }}
          onSubmit={handleFormSubmit}
          banner={selectedBanner}
          loading={loading}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedBanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-white mb-4">
                Xác nhận xóa Banner
              </h3>
              <p className="text-gray-300 mb-6">
                Bạn có chắc chắn muốn xóa banner &quot;{selectedBanner.title}
                &quot;? Thao tác này không thể hoàn tác.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedBanner(null);
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
