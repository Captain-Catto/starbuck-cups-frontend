import { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import type { RootState } from "@/store";

export interface HeroImage {
  id: string;
  title: string;
  imageUrl: string;
  altText: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdByAdmin: {
    id: string;
    username: string;
  };
}

export interface UseHeroImagesReturn {
  heroImages: HeroImage[];
  loading: boolean;
  error: string | null;
  fetchHeroImages: () => Promise<void>;
  deleteHeroImage: (id: string) => Promise<boolean>;
  updateHeroImageOrder: (
    imageOrders: { id: string; order: number }[]
  ) => Promise<boolean>;
  clearError: () => void;
}

export function useHeroImages(): UseHeroImagesReturn {
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get auth token from Redux store
  const token = useSelector((state: RootState) => state.auth.token);

  // Fetch hero images
  const fetchHeroImages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const authHeaders: Record<string, string> = token
        ? { Authorization: `Bearer ${token}` }
        : {};
      const response = await fetch("/api/admin/hero-images", {
        headers: authHeaders,
      });

      const data = await response.json();
      console.log("Hero images response:", data);

      if (data.success) {
        setHeroImages(data.data || []);
      } else {
        setError(data.message || "Không thể tải danh sách hero images");
      }
    } catch (error) {
      console.error("Error fetching hero images:", error);
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Delete hero image
  const deleteHeroImage = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const authHeaders: Record<string, string> = token
          ? { Authorization: `Bearer ${token}` }
          : {};
        const response = await fetch(`/api/admin/hero-images/${id}`, {
          method: "DELETE",
          headers: authHeaders,
        });

        const data = await response.json();

        if (data.success) {
          setHeroImages((prev) => prev.filter((img) => img.id !== id));
          return true;
        } else {
          setError(data.message || "Không thể xóa hero image");
          toast.error("Không thể xóa hero image");
          return false;
        }
      } catch (error) {
        console.error("Error deleting hero image:", error);
        setError("Lỗi kết nối. Vui lòng thử lại.");
        toast.error("Lỗi kết nối khi xóa hero image");
        return false;
      }
    },
    [token]
  );

  // Update hero image order
  const updateHeroImageOrder = useCallback(
    async (imageOrders: { id: string; order: number }[]): Promise<boolean> => {
      try {
        const authHeaders: Record<string, string> = token
          ? { Authorization: `Bearer ${token}` }
          : {};
        const response = await fetch("/api/admin/hero-images/reorder", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
          body: JSON.stringify({ imageOrders }),
        });

        const data = await response.json();

        if (data.success) {
          toast.success("Đã cập nhật thứ tự thành công!", {
            duration: 3000,
          });
          return true;
        } else {
          setError(data.message || "Không thể sắp xếp lại hero images");
          toast.error("Không thể cập nhật thứ tự hero images");
          return false;
        }
      } catch (error) {
        console.error("Error reordering hero images:", error);
        setError("Lỗi kết nối. Vui lòng thử lại.");
        toast.error("Lỗi kết nối khi cập nhật thứ tự");
        return false;
      }
    },
    [token]
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    heroImages,
    loading,
    error,
    fetchHeroImages,
    deleteHeroImage,
    updateHeroImageOrder,
    clearError,
  };
}
