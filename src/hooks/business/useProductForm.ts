"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppSelector } from "@/hooks/redux";

export interface ProductFormData {
  name: string;
  description: string;
  imageUrl: string;
  images: string[];
  colorIds: string[];
  capacityIds: string[];
  categoryIds: string[];
  isActive: boolean;
  stockQuantity: number;
  productUrl: string;
}

export interface ValidationErrors {
  [key: string]: string;
}

export interface UseProductFormOptions {
  initialData?: Partial<ProductFormData>;
  isEditing?: boolean;
  productId?: string;
  onSuccess?: (product: unknown) => void;
  onError?: (error: string) => void;
}

export interface UseProductFormReturn {
  formData: ProductFormData;
  errors: ValidationErrors;
  loading: boolean;
  isSubmitting: boolean;
  updateField: (field: keyof ProductFormData, value: unknown) => void;
  toggleArrayField: (
    field: "colorIds" | "capacityIds" | "categoryIds",
    value: string
  ) => void;
  validateForm: () => boolean;
  submitForm: () => Promise<void>;
  submitFormWithImages: (images: string[]) => Promise<void>;
  resetForm: () => void;
}

export function useProductForm(
  options: UseProductFormOptions = {}
): UseProductFormReturn {
  const {
    initialData,
    isEditing = false,
    productId,
    onSuccess,
    onError,
  } = options;

  const router = useRouter();
  const { token } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    imageUrl: initialData?.imageUrl || "",
    images: initialData?.images || [],
    colorIds: initialData?.colorIds || [],
    capacityIds: initialData?.capacityIds || [],
    categoryIds: initialData?.categoryIds || [],
    isActive: initialData?.isActive ?? true,
    stockQuantity: initialData?.stockQuantity || 0,
    productUrl: initialData?.productUrl || "",
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    console.log("getAuthHeaders: Redux token exists?", !!token);
    console.log(
      "getAuthHeaders: Redux token preview:",
      token?.substring(0, 20) + "..."
    );
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  const updateField = useCallback(
    (field: keyof ProductFormData, value: unknown) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

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
    (field: "colorIds" | "capacityIds" | "categoryIds", value: string) => {
      setFormData((prev) => {
        const currentArray = prev[field];
        const newArray = currentArray.includes(value)
          ? currentArray.filter((id) => id !== value)
          : [...currentArray, value];

        return {
          ...prev,
          [field]: newArray,
        };
      });

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

    if (formData.colorIds.length === 0) {
      newErrors.colorIds = "Phải chọn ít nhất một màu sắc";
    }

    if (formData.capacityIds.length === 0) {
      newErrors.capacityIds = "Phải chọn ít nhất một dung tích";
    }

    if (formData.categoryIds.length === 0) {
      newErrors.categoryIds = "Phải chọn ít nhất một danh mục";
    }

    // Validate that at least one image is provided
    if (formData.images.length === 0 && !formData.imageUrl.trim()) {
      newErrors.images = "Phải có ít nhất một hình ảnh sản phẩm";
    }

    if (formData.imageUrl && !isValidUrl(formData.imageUrl)) {
      newErrors.imageUrl = "URL hình ảnh không hợp lệ";
    }

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
    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    try {
      setIsSubmitting(true);

      // Debug current form state
      console.log("[DEBUG] submitForm - formData.images:", formData.images);
      console.log("[DEBUG] submitForm - formData.imageUrl:", formData.imageUrl);
      console.log("[DEBUG] submitForm - full formData:", formData);

      // Prepare images with order information
      const imagesWithOrder =
        formData.images.length > 0
          ? formData.images.map((url, index) => ({ url, order: index }))
          : formData.imageUrl.trim()
          ? [{ url: formData.imageUrl.trim(), order: 0 }]
          : [];

      console.log("[DEBUG] submitForm - imagesWithOrder:", imagesWithOrder);

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        productImages: imagesWithOrder,
        colorIds: formData.colorIds,
        capacityId: formData.capacityIds[0] || "",
        categoryIds: formData.categoryIds,
        stockQuantity: formData.stockQuantity,
        productUrl: formData.productUrl.trim() || undefined,
        ...(isEditing && productId && { id: productId }),
      };

      console.log("[DEBUG] submitForm - final payload:", payload);

      const url =
        isEditing && productId
          ? `/api/admin/products/${productId}`
          : "/api/admin/products";

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMsg =
          data.message ||
          (isEditing
            ? "Không thể cập nhật sản phẩm"
            : "Không thể tạo sản phẩm");
        throw new Error(errorMsg);
      }

      const successMsg = isEditing
        ? "Cập nhật sản phẩm thành công!"
        : "Tạo sản phẩm thành công!";

      toast.success(successMsg);

      if (onSuccess) {
        onSuccess(data.data);
      } else {
        router.push("/admin/products");
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Có lỗi xảy ra";
      toast.error(errorMsg);

      if (onError) {
        onError(errorMsg);
      }

      console.error("Error submitting product form:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    formData,
    isEditing,
    productId,
    validateForm,
    onSuccess,
    onError,
    router,
    getAuthHeaders,
  ]);

  const validateFormData = useCallback((data: ProductFormData): boolean => {
    const newErrors: ValidationErrors = {};

    if (!data.name.trim()) {
      newErrors.name = "Tên sản phẩm là bắt buộc";
    }

    if (data.colorIds.length === 0) {
      newErrors.colorIds = "Phải chọn ít nhất một màu sắc";
    }

    if (data.capacityIds.length === 0) {
      newErrors.capacityIds = "Phải chọn ít nhất một dung tích";
    }

    if (data.categoryIds.length === 0) {
      newErrors.categoryIds = "Phải chọn ít nhất một danh mục";
    }

    // Validate that at least one image is provided
    if (data.images.length === 0 && !data.imageUrl.trim()) {
      newErrors.images = "Phải có ít nhất một hình ảnh sản phẩm";
    }

    if (data.imageUrl && !isValidUrl(data.imageUrl)) {
      newErrors.imageUrl = "URL hình ảnh không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  const submitFormWithImages = useCallback(
    async (images: string[]) => {
      // Create temporary form data with provided images
      const tempFormData = {
        ...formData,
        images: images,
        imageUrl: images.length > 0 ? images[0] : formData.imageUrl,
      };

      if (!validateFormData(tempFormData)) {
        toast.error("Vui lòng kiểm tra lại thông tin");
        return;
      }

      try {
        setIsSubmitting(true);

        // Debug current form state
        console.log("[DEBUG] submitFormWithImages - provided images:", images);
        console.log(
          "[DEBUG] submitFormWithImages - tempFormData:",
          tempFormData
        );

        // Prepare images with order information
        const imagesWithOrder =
          images.length > 0
            ? images.map((url, index) => ({ url, order: index }))
            : tempFormData.imageUrl.trim()
            ? [{ url: tempFormData.imageUrl.trim(), order: 0 }]
            : [];

        console.log(
          "[DEBUG] submitFormWithImages - imagesWithOrder:",
          imagesWithOrder
        );

        const payload = {
          name: tempFormData.name.trim(),
          description: tempFormData.description.trim() || undefined,
          productImages: imagesWithOrder,
          colorIds: tempFormData.colorIds,
          capacityId: tempFormData.capacityIds[0] || "",
          categoryIds: tempFormData.categoryIds,
          stockQuantity: tempFormData.stockQuantity,
          productUrl: tempFormData.productUrl.trim() || undefined,
          ...(isEditing && productId && { id: productId }),
        };

        console.log("[DEBUG] submitFormWithImages - final payload:", payload);

        const url =
          isEditing && productId
            ? `/api/admin/products/${productId}`
            : "/api/admin/products";

        const method = isEditing ? "PUT" : "POST";

        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          const errorMsg =
            data.message ||
            (isEditing
              ? "Không thể cập nhật sản phẩm"
              : "Không thể tạo sản phẩm");
          throw new Error(errorMsg);
        }

        const successMsg = isEditing
          ? "Cập nhật sản phẩm thành công!"
          : "Tạo sản phẩm thành công!";

        toast.success(successMsg);

        if (onSuccess) {
          onSuccess(data.data);
        } else {
          router.push("/admin/products");
        }
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Có lỗi xảy ra";
        toast.error(errorMsg);

        if (onError) {
          onError(errorMsg);
        }

        console.error("Error submitting product form with images:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, isEditing, productId, onSuccess, onError, router, getAuthHeaders, validateFormData]
  );


  const resetForm = useCallback(() => {
    setFormData({
      name: initialData?.name || "",
      description: initialData?.description || "",
      imageUrl: initialData?.imageUrl || "",
      images: initialData?.images || [],
      colorIds: initialData?.colorIds || [],
      capacityIds: initialData?.capacityIds || [],
      categoryIds: initialData?.categoryIds || [],
      isActive: initialData?.isActive ?? true,
      stockQuantity: initialData?.stockQuantity || 0,
      productUrl: initialData?.productUrl || "",
    });
    setErrors({});
    setIsSubmitting(false);
  }, [initialData]);

  return {
    formData,
    errors,
    loading,
    isSubmitting,
    updateField,
    toggleArrayField,
    validateForm,
    submitForm,
    submitFormWithImages,
    resetForm,
  };
}
