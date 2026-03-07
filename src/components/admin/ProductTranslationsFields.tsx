"use client";

import type { ProductLocale, ProductTranslationsInput } from "@/types";

type TranslationField = "name" | "description" | "metaTitle" | "metaDescription";

interface LocaleConfig {
  code: ProductLocale;
  label: string;
  requiredName?: boolean;
}

const LOCALES: LocaleConfig[] = [
  { code: "vi", label: "Tiếng Việt", requiredName: true },
  { code: "en", label: "English" },
  { code: "zh", label: "中文" },
];

interface ProductTranslationsFieldsProps {
  translations: ProductTranslationsInput;
  onChange: (locale: ProductLocale, field: TranslationField, value: string) => void;
}

export function ProductTranslationsFields({
  translations,
  onChange,
}: ProductTranslationsFieldsProps) {
  return (
    <div className="space-y-4 border border-gray-200 rounded-md p-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">
          Nội dung đa ngôn ngữ
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          VI là nội dung chính để hiển thị mặc định. EN và ZH là tùy chọn.
        </p>
      </div>

      {LOCALES.map((locale) => (
        <details
          key={locale.code}
          open={locale.code === "vi"}
          className="border border-gray-200 rounded-md p-3"
        >
          <summary className="cursor-pointer text-sm font-medium text-gray-800">
            {locale.label}
          </summary>

          <div className="mt-3 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Tên sản phẩm {locale.requiredName ? "*" : ""}
              </label>
              <input
                type="text"
                value={translations[locale.code].name}
                onChange={(e) => onChange(locale.code, "name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder={
                  locale.code === "vi"
                    ? "Tên tiếng Việt"
                    : locale.code === "en"
                    ? "English product name"
                    : "产品名称"
                }
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Mô tả
              </label>
              <textarea
                value={translations[locale.code].description}
                onChange={(e) =>
                  onChange(locale.code, "description", e.target.value)
                }
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder={
                  locale.code === "vi"
                    ? "Mô tả tiếng Việt"
                    : locale.code === "en"
                    ? "English description"
                    : "中文描述"
                }
              />
            </div>

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
        </details>
      ))}
    </div>
  );
}
