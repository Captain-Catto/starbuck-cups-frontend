import { useState, useCallback } from "react";
import { toast } from "sonner";

export interface PromotionalBanner {
  id: string;
  title: string;
  highlightText: string | null;
  highlightColor: string | null;
  description: string;
  buttonText: string;
  buttonLink: string;
  isActive: boolean;
  priority: number;
  validFrom: string | null;
  validUntil: string | null;
  createdAt: string;
  updatedAt: string;
  createdByAdmin?: {
    id: string;
    username: string;
  };
}

export interface CreatePromotionalBannerData {
  title: string;
  highlightText?: string | null;
  highlightColor?: string | null;
  description: string;
  buttonText: string;
  buttonLink: string;
  priority?: number;
  validFrom?: string | null;
  validUntil?: string | null;
}

export interface UpdatePromotionalBannerData {
  title?: string;
  highlightText?: string | null;
  highlightColor?: string | null;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  isActive?: boolean;
  priority?: number;
  validFrom?: string | null;
  validUntil?: string | null;
}

export function usePromotionalBanner() {
  const [banners, setBanners] = useState<PromotionalBanner[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem("admin_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/promotional-banners", {
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch promotional banners");
      }

      setBanners(data.data || []);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch promotional banners";
      setError(errorMessage);
      toast.error(errorMessage);

    } finally {
      setLoading(false);
    }
  }, []);

  const createBanner = async (
    bannerData: CreatePromotionalBannerData
  ): Promise<boolean> => {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/promotional-banners", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(bannerData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to create promotional banner");
      }

      toast.success("Banner quảng cáo đã được tạo thành công!");
      await fetchBanners(); // Refresh list
      return true;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to create promotional banner";
      toast.error(errorMessage);

      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateBanner = async (
    bannerId: string,
    bannerData: UpdatePromotionalBannerData
  ): Promise<boolean> => {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/admin/promotional-banners/${bannerId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(bannerData),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update promotional banner");
      }

      toast.success("Banner quảng cáo đã được cập nhật thành công!");
      await fetchBanners(); // Refresh list
      return true;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to update promotional banner";
      toast.error(errorMessage);

      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteBanner = async (bannerId: string): Promise<boolean> => {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/admin/promotional-banners/${bannerId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete promotional banner");
      }

      toast.success("Banner quảng cáo đã được xóa thành công!");
      await fetchBanners(); // Refresh list
      return true;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to delete promotional banner";
      toast.error(errorMessage);

      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    banners,
    loading,
    error,
    fetchBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    clearError,
  };
}
