"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export interface UpdateProductFormData {
  name: string;
  description: string;
  categoryIds: string[];
  colorIds: string[];
  capacityId: string;
  stockQuantity: number;
  images: string[];
  productUrl: string;
  isActive: boolean;
  // For file uploads
  newImages?: File[];
  keepExistingImages?: boolean;
}

export interface ValidationErrors {
  [key: string]: string;
}

export interface UseUpdateProductOptions {
  productId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export interface UseUpdateProductReturn {
  formData: UpdateProductFormData;
  errors: ValidationErrors;
  loading: boolean;
  isSubmitting: boolean;
  updateField: (field: keyof UpdateProductFormData, value: unknown) => void;
  toggleArrayField: (field: "categoryIds" | "colorIds", value: string) => void;
  validateForm: () => boolean;
  submitForm: () => Promise<void>;
  loadProductData: () => Promise<void>;
}

export function useUpdateProduct(
  options: UseUpdateProductOptions
): UseUpdateProductReturn {
  const { productId, onSuccess, onError } = options;

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const [formData, setFormData] = useState<UpdateProductFormData>({
    name: "",
    description: "",
    categoryIds: [],
    colorIds: [],
    capacityId: "",
    stockQuantity: 0,
    images: [],
    productUrl: "",
    isActive: true,
    newImages: [],
    keepExistingImages: true,
  });

  const getAuthHeaders = (): Record<string, string> => {
    if (typeof window === "undefined") return {};
    const token = localStorage.getItem("admin_token");
    console.log("[DEBUG] getAuthHeaders - token exists:", !!token);
    console.log(
      "[DEBUG] getAuthHeaders - token preview:",
      token?.substring(0, 20) + "..."
    );
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const loadProductData = useCallback(async () => {
    try {
      setLoading(true);
      console.log("[DEBUG] loadProductData - loading product:", productId);

      const response = await fetch(`/api/admin/products/${productId}`, {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });

      const data = await response.json();
      console.log("[DEBUG] loadProductData - API response:", data);

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Không thể tải thông tin sản phẩm");
      }

      const product = data.data;
      console.log("[DEBUG] loadProductData - product data:", product);

      // Map API data to form format
      const mappedData = {
        name: product.name || "",
        description: product.description || "",
        categoryIds: product.productCategories?.map((pc: { category: { id: string } }) => pc.category.id) || [],
        colorIds: product.productColors?.map((pc: { color: { id: string } }) => pc.color.id) || [],
        capacityId: product.capacity?.id || "",
        stockQuantity: product.stockQuantity || 0,
        images: product.productImages?.map((img: { url: string }) => img.url) || [],
        productUrl: product.productUrl || "",
        isActive: product.isActive ?? true,
        newImages: [],
        keepExistingImages: true,
      };

      console.log("[DEBUG] loadProductData - mapped form data:", mappedData);

      setFormData(mappedData);
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi tải dữ liệu";
      console.error("[DEBUG] loadProductData - error:", error);
      toast.error(errorMsg);
      if (onError) {
        onError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  }, [productId, onError]);

  // Load product data when component mounts
  useEffect(() => {
    if (productId) {
      loadProductData();
    }
  }, [productId, loadProductData]);

  const updateField = useCallback(
    (field: keyof UpdateProductFormData, value: unknown) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Clear error for this field if it exists
      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: "",
        }));
      }
    },
    [errors]
  );

  const toggleArrayField = useCallback(
    (field: "categoryIds" | "colorIds", value: string) => {
      setFormData((prev) => {
        const currentArray = prev[field] || [];
        const newArray = currentArray.includes(value)
          ? currentArray.filter((item) => item !== value)
          : [...currentArray, value];

        return {
          ...prev,
          [field]: newArray,
        };
      });

      // Clear error for this field if it exists
      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: "",
        }));
      }
    },
    [errors]
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên sản phẩm là bắt buộc";
    }

    if (!formData.categoryIds || formData.categoryIds.length === 0) {
      newErrors.categoryIds = "Vui lòng chọn ít nhất một danh mục";
    }

    if (!formData.colorIds || formData.colorIds.length === 0) {
      newErrors.colorIds = "Vui lòng chọn ít nhất một màu sắc";
    }

    if (!formData.capacityId) {
      newErrors.capacityId = "Dung tích là bắt buộc";
    }

    if (formData.stockQuantity < 0) {
      newErrors.stockQuantity = "Số lượng tồn kho không thể âm";
    }

    // Validate product URL if provided
    if (formData.productUrl && !isValidUrl(formData.productUrl)) {
      newErrors.productUrl = "URL sản phẩm không hợp lệ";
    }

    // Validate image URLs
    formData.images.forEach((url, index) => {
      if (url && !isValidUrl(url)) {
        newErrors[`image_${index}`] = `URL hình ảnh ${index + 1} không hợp lệ`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const submitForm = useCallback(async () => {
    console.log("🚀 [useUpdateProduct] submitForm started");
    console.log("📋 [useUpdateProduct] Current formData:", formData);
    console.log("📊 [useUpdateProduct] Images to submit:", formData.images);

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    try {
      setIsSubmitting(true);

      // Decide whether to use file upload endpoint or regular update
      const hasNewFiles = formData.newImages && formData.newImages.length > 0;
      console.log("📁 [useUpdateProduct] Has new files:", hasNewFiles);
      console.log(
        "📁 [useUpdateProduct] New files count:",
        formData.newImages?.length || 0
      );

      if (hasNewFiles) {
        // Use multipart/form-data endpoint for file uploads
        const formDataToSend = new FormData();

        // Add text fields
        formDataToSend.append("name", formData.name.trim());
        formDataToSend.append("description", formData.description.trim() || "");
        formDataToSend.append("categoryIds", JSON.stringify(formData.categoryIds));
        formDataToSend.append("colorIds", JSON.stringify(formData.colorIds));
        formDataToSend.append("capacityId", formData.capacityId);
        formDataToSend.append(
          "stockQuantity",
          formData.stockQuantity.toString()
        );

        // Only add productUrl if it's a valid URL or empty
        const productUrlValue = formData.productUrl.trim();
        if (productUrlValue) {
          // Validate URL format before sending
          try {
            new URL(productUrlValue);
            formDataToSend.append("productUrl", productUrlValue);
          } catch {
            // If invalid URL, don't include it (will be empty string on backend)
            console.warn(
              "Invalid product URL format, skipping:",
              productUrlValue
            );
          }
        }

        formDataToSend.append(
          "keepExistingImages",
          formData.keepExistingImages?.toString() || "true"
        );

        // Add image files
        formData.newImages?.forEach((file) => {
          formDataToSend.append("images", file);
        });

        console.log(
          "Uploading with files:",
          formData.newImages?.map((f) => f.name) || []
        );

        const response = await fetch(
          `/api/admin/products/${productId}/upload`,
          {
            method: "PUT",
            headers: {
              ...getAuthHeaders(),
              // Don't set Content-Type, let browser set it with boundary for FormData
            },
            body: formDataToSend,
          }
        );

        const data = await response.json();
        console.log("Update with upload response:", {
          status: response.status,
          data,
        });

        if (!response.ok || !data.success) {
          console.error("Update product error details:", data);
          throw new Error(data.message || "Không thể cập nhật sản phẩm");
        }
      } else {
        // Use regular JSON update endpoint (no file uploads)
        const payload = {
          name: formData.name.trim(),
          description: formData.description.trim() || "",
          categoryIds: formData.categoryIds,
          colorIds: formData.colorIds,
          capacityId: formData.capacityId,
          stockQuantity: formData.stockQuantity,
          productUrl: formData.productUrl.trim() || "",
          isActive: formData.isActive,
          // Include images array for image reordering
          productImages: formData.images,
        };

        console.log("🚀 [useUpdateProduct] Update product payload:", payload);
        console.log(
          "📊 [useUpdateProduct] Images being sent:",
          formData.images
        );

        const response = await fetch(`/api/admin/products/${productId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        console.log("✅ [useUpdateProduct] Update product response:", {
          status: response.status,
          data,
        });

        if (!response.ok || !data.success) {
          console.error("Update product error details:", data);
          throw new Error(data.message || "Không thể cập nhật sản phẩm");
        }
      }

      toast.success("Cập nhật sản phẩm thành công!");

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Có lỗi xảy ra";
      toast.error(errorMsg);

      if (onError) {
        onError(errorMsg);
      }

      console.error("Error updating product:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, productId, validateForm, onSuccess, onError]);

  return {
    formData,
    errors,
    loading,
    isSubmitting,
    updateField,
    toggleArrayField,
    validateForm,
    submitForm,
    loadProductData,
  };
}
