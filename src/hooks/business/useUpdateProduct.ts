"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type {
  ProductLocale,
  ProductTranslationsInput,
  ProductTranslationsMap,
} from "@/types";
import { invalidateProductDependentCaches } from "@/lib/adminCacheInvalidation";

type TranslationField = "name" | "description" | "metaTitle" | "metaDescription";

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
    if (name) entry.name = name;

    const description =
      locale === "vi"
        ? source.description.trim() || fallbackDescription.trim()
        : source.description.trim();
    if (description) entry.description = description;

    const metaTitle = toOptionalValue(source.metaTitle);
    if (metaTitle) entry.metaTitle = metaTitle;

    const metaDescription = toOptionalValue(source.metaDescription);
    if (metaDescription) entry.metaDescription = metaDescription;

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

const createDefaultTranslations = (
  name = "",
  description = "",
  translations?: ProductTranslationsMap
): ProductTranslationsInput => {
  return {
    vi: {
      name: translations?.vi?.name || name,
      description: translations?.vi?.description || description,
      metaTitle: translations?.vi?.metaTitle || "",
      metaDescription: translations?.vi?.metaDescription || "",
    },
    en: {
      name: translations?.en?.name || "",
      description: translations?.en?.description || "",
      metaTitle: translations?.en?.metaTitle || "",
      metaDescription: translations?.en?.metaDescription || "",
    },
    zh: {
      name: translations?.zh?.name || "",
      description: translations?.zh?.description || "",
      metaTitle: translations?.zh?.metaTitle || "",
      metaDescription: translations?.zh?.metaDescription || "",
    },
  };
};

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
  isVip: boolean;
  hasVariants: boolean;
  isFeatured: boolean;
  translations: ProductTranslationsInput;
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
  updateTranslation: (
    locale: ProductLocale,
    field: TranslationField,
    value: string
  ) => void;
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
    isVip: false,
    hasVariants: true,
    isFeatured: false,
    translations: createDefaultTranslations(),
    newImages: [],
    keepExistingImages: true,
  });

  const getAuthHeaders = (): Record<string, string> => {
    if (typeof window === "undefined") return {};
    const token = localStorage.getItem("admin_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const loadProductData = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch(`/api/admin/products/${productId}`, {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Không thể tải thông tin sản phẩm");
      }

      const product = data.data as {
        name?: string;
        description?: string;
        productCategories?: { category: { id: string } }[];
        productColors?: { color: { id: string } }[];
        capacity?: { id?: string };
        stockQuantity?: number;
        productImages?: { url: string }[];
        productUrl?: string;
        isActive?: boolean;
        isVip?: boolean;
        isFeatured?: boolean;
        translations?: ProductTranslationsMap;
      };

      const mappedData: UpdateProductFormData = {
        name: product.name || "",
        description: product.description || "",
        categoryIds:
          product.productCategories?.map((pc) => pc.category.id) || [],
        colorIds: product.productColors?.map((pc) => pc.color.id) || [],
        capacityId: product.capacity?.id || "",
        stockQuantity: product.stockQuantity || 0,
        images: product.productImages?.map((img) => img.url) || [],
        productUrl: product.productUrl || "",
        isActive: product.isActive ?? true,
        isVip: product.isVip ?? false,
        hasVariants:
          Boolean(product.capacity?.id != null) ||
          Boolean(product.productColors && product.productColors.length > 0),
        isFeatured: product.isFeatured ?? false,
        translations: createDefaultTranslations(
          product.name || "",
          product.description || "",
          product.translations
        ),
        newImages: [],
        keepExistingImages: true,
      };

      setFormData(mappedData);
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi tải dữ liệu";
      toast.error(errorMsg);
      if (onError) onError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [productId, onError]);

  useEffect(() => {
    if (productId) {
      loadProductData();
    }
  }, [productId, loadProductData]);

  const updateField = useCallback(
    (field: keyof UpdateProductFormData, value: unknown) => {
      setFormData((prev) => {
        const next = {
          ...prev,
          [field]: value,
        } as UpdateProductFormData;

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

        const nextData: UpdateProductFormData = {
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

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};
    const viName = formData.translations.vi.name.trim() || formData.name.trim();

    if (!viName) {
      newErrors.name = "Tên sản phẩm là bắt buộc";
    }

    if (!formData.categoryIds || formData.categoryIds.length === 0) {
      newErrors.categoryIds = "Vui lòng chọn ít nhất một danh mục";
    }

    if (formData.hasVariants && (!formData.colorIds || formData.colorIds.length === 0)) {
      newErrors.colorIds = "Vui lòng chọn ít nhất một màu sắc";
    }

    if (formData.hasVariants && !formData.capacityId) {
      newErrors.capacityId = "Dung tích là bắt buộc";
    }

    if (formData.stockQuantity < 0) {
      newErrors.stockQuantity = "Số lượng tồn kho không thể âm";
    }

    if (formData.productUrl && !isValidUrl(formData.productUrl)) {
      newErrors.productUrl = "URL sản phẩm không hợp lệ";
    }

    formData.images.forEach((url, index) => {
      if (url && !isValidUrl(url)) {
        newErrors[`image_${index}`] = `URL hình ảnh ${index + 1} không hợp lệ`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const submitForm = useCallback(async () => {
    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    try {
      setIsSubmitting(true);

      const canonicalName = formData.translations.vi.name.trim() || formData.name.trim();
      const canonicalDescription =
        formData.translations.vi.description.trim() || formData.description.trim();
      const translationsPayload = buildTranslationsPayload(
        formData.translations,
        canonicalName,
        canonicalDescription
      );
      const hasNewFiles = formData.newImages && formData.newImages.length > 0;

      if (hasNewFiles) {
        const formDataToSend = new FormData();
        formDataToSend.append("name", canonicalName);
        formDataToSend.append("description", canonicalDescription);
        formDataToSend.append("categoryIds", JSON.stringify(formData.categoryIds));
        formDataToSend.append("colorIds", JSON.stringify(formData.hasVariants ? formData.colorIds : []));
        formDataToSend.append("capacityId", formData.hasVariants ? formData.capacityId : "");
        formDataToSend.append("stockQuantity", formData.stockQuantity.toString());
        formDataToSend.append("isActive", formData.isActive.toString());
        formDataToSend.append("isVip", formData.isVip.toString());
        formDataToSend.append("isFeatured", formData.isFeatured.toString());
        formDataToSend.append("translations", JSON.stringify(translationsPayload));

        const productUrlValue = formData.productUrl.trim();
        if (productUrlValue) {
          try {
            new URL(productUrlValue);
            formDataToSend.append("productUrl", productUrlValue);
          } catch {}
        }

        formDataToSend.append(
          "keepExistingImages",
          formData.keepExistingImages?.toString() || "true"
        );

        formData.newImages?.forEach((file) => {
          formDataToSend.append("images", file);
        });

        const response = await fetch(`/api/admin/products/${productId}/upload`, {
          method: "PUT",
          headers: {
            ...getAuthHeaders(),
          },
          body: formDataToSend,
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || "Không thể cập nhật sản phẩm");
        }
      } else {
        const payload = {
          name: canonicalName,
          description: canonicalDescription,
          categoryIds: formData.categoryIds,
          colorIds: formData.hasVariants ? formData.colorIds : [],
          capacityId: formData.hasVariants ? (formData.capacityId || null) : null,
          stockQuantity: formData.stockQuantity,
          productUrl: formData.productUrl.trim() || "",
          isActive: formData.isActive,
          isVip: formData.isVip,
          isFeatured: formData.isFeatured,
          translations: translationsPayload,
          productImages: formData.images.map((url, index) => ({
            url,
            order: index,
          })),
        };

        const response = await fetch(`/api/admin/products/${productId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || "Không thể cập nhật sản phẩm");
        }
      }

      invalidateProductDependentCaches();
      toast.success("Cập nhật sản phẩm thành công!");
      if (onSuccess) onSuccess();
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Có lỗi xảy ra";
      toast.error(errorMsg);
      if (onError) onError(errorMsg);
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
    updateTranslation,
    toggleArrayField,
    validateForm,
    submitForm,
    loadProductData,
  };
}
