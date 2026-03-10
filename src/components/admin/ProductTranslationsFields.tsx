"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { ProductLocale, ProductTranslationsInput } from "@/types";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const RichTextEditor = dynamic(() => import("@/components/ui/RichTextEditor"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] border rounded-md flex items-center justify-center">
      <LoadingSpinner />
    </div>
  ),
});

type TranslationField = "name" | "description" | "metaTitle" | "metaDescription";

interface LocaleConfig {
  code: ProductLocale;
  flag: string;
  label: string;
  sublabel?: string;
  requiredName?: boolean;
}

const LOCALES: LocaleConfig[] = [
  { code: "vi", flag: "VN", label: "Tiếng Việt", sublabel: "(Mặc định)", requiredName: true },
  { code: "en", flag: "GB", label: "English" },
  { code: "zh", flag: "CN", label: "Chinese" },
];

interface ProductTranslationsFieldsProps {
  translations: ProductTranslationsInput;
  onChange: (locale: ProductLocale, field: TranslationField, value: string) => void;
}

export function ProductTranslationsFields({
  translations,
  onChange,
}: ProductTranslationsFieldsProps) {
  const [activeLocale, setActiveLocale] = useState<ProductLocale>("vi");

  return (
    <div className="space-y-4">
      {/* Locale Tabs */}
      <div className="flex border-b border-gray-200">
        {LOCALES.map((locale) => (
          <button
            key={locale.code}
            type="button"
            onClick={() => setActiveLocale(locale.code)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeLocale === locale.code
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <span className="text-xs font-bold mr-1">{locale.flag}</span>
            {locale.label}
            {locale.sublabel && (
              <span className="text-xs text-gray-400 ml-1">{locale.sublabel}</span>
            )}
          </button>
        ))}
      </div>

      {/* Active Locale Fields */}
      {LOCALES.map((locale) => (
        <div
          key={locale.code}
          className={activeLocale === locale.code ? "space-y-4" : "hidden"}
        >
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {locale.requiredName && <span className="text-red-500">* </span>}
              Product Name
            </label>
            <input
              type="text"
              value={translations[locale.code].name}
              onChange={(e) => onChange(locale.code, "name", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder={
                locale.code === "vi"
                  ? "Tên sản phẩm tiếng Việt"
                  : locale.code === "en"
                  ? "English product name"
                  : "产品名称"
              }
            />
          </div>

          {/* Product Description - Rich Text Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Description
            </label>
            <RichTextEditor
              value={translations[locale.code].description}
              onChange={(htmlContent) =>
                onChange(locale.code, "description", htmlContent)
              }
              placeholder={
                locale.code === "vi"
                  ? "Nhập mô tả chi tiết sản phẩm..."
                  : locale.code === "en"
                  ? "Enter product description..."
                  : "输入产品描述..."
              }
              height={300}
            />
          </div>

          {/* Meta Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Meta title
              </label>
              <input
                type="text"
                value={translations[locale.code].metaTitle}
                onChange={(e) =>
                  onChange(locale.code, "metaTitle", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Meta title"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Meta description
              </label>
              <input
                type="text"
                value={translations[locale.code].metaDescription}
                onChange={(e) =>
                  onChange(locale.code, "metaDescription", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Meta description"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
