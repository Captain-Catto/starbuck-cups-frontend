"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ProductLocale, ProductTranslationsInput } from "@/types";
import { useAppSelector } from "@/hooks/redux";
import { invalidateProductDependentCaches } from "@/lib/adminCacheInvalidation";

type TranslationField = "name" | "description" | "metaTitle" | "metaDescription";

const EMPTY_TRANSLATIONS: ProductTranslationsInput = {
  vi: { name: "", description: "", metaTitle: "", metaDescription: "" },
  en: { name: "", description: "", metaTitle: "", metaDescription: "" },
  zh: { name: "", description: "", metaTitle: "", metaDescription: "" },
};

const createInitialTranslations = (
  initialData?: Partial<ProductFormData>
): ProductTranslationsInput => {
  const initialTranslations = initialData?.translations;

  return {
    vi: {
      name: initialTranslations?.vi?.name || initialData?.name || "",
      description:
        initialTranslations?.vi?.description || initialData?.description || "",
      metaTitle: initialTranslations?.vi?.metaTitle || "",
      metaDescription: initialTranslations?.vi?.metaDescription || "",
    },
    en: {
      name: initialTranslations?.en?.name || "",
      description: initialTranslations?.en?.description || "",
      metaTitle: initialTranslations?.en?.metaTitle || "",
      metaDescription: initialTranslations?.en?.metaDescription || "",
    },
    zh: {
      name: initialTranslations?.zh?.name || "",
      description: initialTranslations?.zh?.description || "",
      metaTitle: initialTranslations?.zh?.metaTitle || "",
      metaDescription: initialTranslations?.zh?.metaDescription || "",
    },
  };
};

const toOptionalValue = (value: string): string | undefined => {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const buildTranslationsPayload = (
  translations: ProductTranslationsInput,
  fallbackName: string,
  fallbackDescription: string
) => {
  const buildLocale = (
    locale: ProductLocale
  ): Record<string, string> | undefined => {
    const source = translations[locale];
    const entry: Record<string, string> = {};

    const name =
      locale === "vi"
        ? source.name.trim() || fallbackName.trim()
        : source.name.trim();
    if (name) {
      entry.name = name;
    }

    const description =
      locale === "vi"
        ? source.description.trim() || fallbackDescription.trim()
        : source.description.trim();
    if (description) {
      entry.description = description;
    }

    const metaTitle = toOptionalValue(source.metaTitle);
    if (metaTitle) {
      entry.metaTitle = metaTitle;
    }

    const metaDescription = toOptionalValue(source.metaDescription);
    if (metaDescription) {
      entry.metaDescription = metaDescription;
    }

    return Object.keys(entry).length > 0 ? entry : undefined;
  };

  const vi = buildLocale("vi");
  const en = buildLocale("en");
  const zh = buildLocale("zh");

  return {
    ...(vi && { vi }),
    ...(en && { en }),
    ...(zh && { zh }),
  };
};

export interface ProductFormData {
  name: string;
  description: string;
  imageUrl: string;
  images: string[];
  colorIds: string[];
  capacityIds: string[];
  categoryIds: string[];
  isActive: boolean;
  isVip: boolean;
  isFeatured: boolean;
  hasVariants: boolean;
  stockQuantity: number;
  productUrl: string;
  translations: ProductTranslationsInput;
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
  updateTranslation: (
    locale: ProductLocale,
    field: TranslationField,
    value: string
  ) => void;
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
    isVip: initialData?.isVip ?? false,
    isFeatured: initialData?.isFeatured ?? false,
    hasVariants: (initialData as any)?.hasVariants ?? true,
    stockQuantity: initialData?.stockQuantity || 0,
    productUrl: initialData?.productUrl || "",
    translations: createInitialTranslations(initialData),
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  const updateField = useCallback(
    (field: keyof ProductFormData, value: unknown) => {
      setFormData((prev) => {
        const next = {
          ...prev,
          [field]: value,
        } as ProductFormData;

        if (field === "name" && typeof value === "string") {
          next.translations = {
            ...prev.translations,
            vi: {
              ...prev.translations.vi,
              name: value,
            },
          };
        }

        if (field === "description" && typeof value === "string") {
          next.translations = {
            ...next.translations,
            vi: {
              ...next.translations.vi,
              description: value,
            },
          };
        }

        return next;
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

  const updateTranslation = useCallback(
    (locale: ProductLocale, field: TranslationField, value: string) => {
      setFormData((prev) => {
        const nextTranslations: ProductTranslationsInput = {
          ...prev.translations,
          [locale]: {
            ...prev.translations[locale],
            [field]: value,
          },
        };

        const nextData: ProductFormData = {
          ...prev,
          translations: nextTranslations,
        };

        if (locale === "vi" && field === "name") {
          nextData.name = value;
        }
        if (locale === "vi" && field === "description") {
          nextData.description = value;
        }

        return nextData;
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

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateFormData = useCallback((data: ProductFormData): boolean => {
    const newErrors: ValidationErrors = {};
    const viName = data.translations.vi.name.trim() || data.name.trim();

    if (!viName) {
      newErrors.name = "Tên sản phẩm là bắt buộc";
    }

    if (data.hasVariants && data.colorIds.length === 0) {
      newErrors.colorIds = "Phải chọn ít nhất một màu sắc";
    }

    if (data.hasVariants && data.capacityIds.length === 0) {
      newErrors.capacityIds = "Phải chọn ít nhất một dung tích";
    }

    if (data.categoryIds.length === 0) {
      newErrors.categoryIds = "Phải chọn ít nhất một danh mục";
    }

    if (data.images.length === 0 && !data.imageUrl.trim()) {
      newErrors.images = "Phải có ít nhất một hình ảnh sản phẩm";
    }

    if (data.imageUrl && !isValidUrl(data.imageUrl)) {
      newErrors.imageUrl = "URL hình ảnh không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  const validateForm = useCallback((): boolean => {
    return validateFormData(formData);
  }, [formData, validateFormData]);

  const submitWithImages = useCallback(
    async (images: string[]) => {
      const tempFormData: ProductFormData = {
        ...formData,
        name: formData.translations.vi.name || formData.name,
        description: formData.translations.vi.description || formData.description,
        images,
        imageUrl: images.length > 0 ? images[0] : formData.imageUrl,
      };

      if (!validateFormData(tempFormData)) {
        toast.error("Vui lòng kiểm tra lại thông tin");
        return;
      }

      try {
        setIsSubmitting(true);

        const imagesWithOrder =
          images.length > 0
            ? images.map((url, index) => ({ url, order: index }))
            : tempFormData.imageUrl.trim()
            ? [{ url: tempFormData.imageUrl.trim(), order: 0 }]
            : [];

        const payload = {
          name: tempFormData.name.trim(),
          description: toOptionalValue(tempFormData.description) || "",
          productImages: imagesWithOrder,
          colorIds: tempFormData.hasVariants ? tempFormData.colorIds : [],
          capacityId: tempFormData.hasVariants ? (tempFormData.capacityIds[0] || null) : null,
          categoryIds: tempFormData.categoryIds,
          stockQuantity: tempFormData.stockQuantity,
          productUrl: toOptionalValue(tempFormData.productUrl) || "",
          isVip: tempFormData.isVip,
          isFeatured: tempFormData.isFeatured,
          translations: buildTranslationsPayload(
            tempFormData.translations,
            tempFormData.name,
            tempFormData.description
          ),
          ...(isEditing && productId && { id: productId }),
        };

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

        toast.success(
          isEditing
            ? "Cập nhật sản phẩm thành công!"
            : "Tạo sản phẩm thành công!"
        );
        invalidateProductDependentCaches();

        if (onSuccess) {
          onSuccess(data.data);
        } else {
          router.push("/admin/products");
        }
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Có lỗi xảy ra";
        toast.error(errorMsg);
        if (onError) onError(errorMsg);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      formData,
      getAuthHeaders,
      isEditing,
      onError,
      onSuccess,
      productId,
      router,
      validateFormData,
    ]
  );

  const submitForm = useCallback(async () => {
    await submitWithImages(formData.images);
  }, [formData.images, submitWithImages]);

  const submitFormWithImages = useCallback(
    async (images: string[]) => {
      await submitWithImages(images);
    },
    [submitWithImages]
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
      isVip: initialData?.isVip ?? false,
      isFeatured: initialData?.isFeatured ?? false,
      hasVariants: (initialData as any)?.hasVariants ?? true,
      stockQuantity: initialData?.stockQuantity || 0,
      productUrl: initialData?.productUrl || "",
      translations: createInitialTranslations(initialData) || EMPTY_TRANSLATIONS,
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
    updateTranslation,
    toggleArrayField,
    validateForm,
    submitForm,
    submitFormWithImages,
    resetForm,
  };
}
