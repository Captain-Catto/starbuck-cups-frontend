"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, ArrowLeft } from "lucide-react";
import type { News, NewsTranslationsInput, NewsStatus } from "@/types";

const LOCALES = [
  { key: "vi" as const, label: "Tiếng Việt" },
  { key: "en" as const, label: "English" },
  { key: "zh" as const, label: "中文" },
];

interface NewsFormProps {
  initialData?: News;
}

export function NewsForm({ initialData }: NewsFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [status, setStatus] = useState<NewsStatus>(initialData?.status ?? "draft");
  const [thumbnail, setThumbnail] = useState(initialData?.thumbnail ?? "");
  const [activeLocale, setActiveLocale] = useState<"vi" | "en" | "zh">("vi");
  const [translations, setTranslations] = useState<NewsTranslationsInput>(() => {
    const result: NewsTranslationsInput = {};
    for (const { key } of LOCALES) {
      const t = initialData?.translations?.find((tr) => tr.locale === key);
      result[key] = {
        title: t?.title ?? "",
        summary: t?.summary ?? "",
        content: t?.content ?? "",
        metaTitle: t?.metaTitle ?? "",
        metaDescription: t?.metaDescription ?? "",
      };
    }
    return result;
  });
  const [saving, setSaving] = useState(false);

  const updateTranslation = (locale: "vi" | "en" | "zh", field: string, value: string) => {
    setTranslations((prev) => ({
      ...prev,
      [locale]: { ...prev[locale], [field]: value },
    }));
  };

  const handleSave = async (saveStatus?: NewsStatus) => {
    const finalStatus = saveStatus ?? status;

    if (!translations.vi?.title?.trim()) {
      toast.error("Tiêu đề tiếng Việt là bắt buộc");
      return;
    }

    setSaving(true);
    try {
      const body = { thumbnail, status: finalStatus, translations };
      const url = isEdit ? `/api/admin/news/${initialData!.id}` : "/api/admin/news";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(isEdit ? "Đã cập nhật bài viết" : "Đã tạo bài viết");
        router.push("/admin/news");
      } else {
        toast.error(data.message || "Có lỗi xảy ra");
      }
    } catch {
      toast.error("Không thể lưu bài viết");
    } finally {
      setSaving(false);
    }
  };

  const current = translations[activeLocale] ?? { title: "", summary: "", content: "", metaTitle: "", metaDescription: "" };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/admin/news")}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Lưu nháp
          </button>
          <button
            onClick={() => handleSave("published")}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Đang lưu..." : "Xuất bản"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Locale tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            {LOCALES.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveLocale(key)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeLocale === key
                    ? "border-green-600 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {label}
                {key === "vi" && <span className="ml-1 text-red-500">*</span>}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiêu đề {activeLocale === "vi" && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                value={current.title ?? ""}
                onChange={(e) => updateTranslation(activeLocale, "title", e.target.value)}
                placeholder="Nhập tiêu đề bài viết..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tóm tắt</label>
              <textarea
                value={current.summary ?? ""}
                onChange={(e) => updateTranslation(activeLocale, "summary", e.target.value)}
                placeholder="Tóm tắt ngắn hiển thị trên trang danh sách và SEO..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
              <textarea
                value={current.content ?? ""}
                onChange={(e) => updateTranslation(activeLocale, "content", e.target.value)}
                placeholder="Nội dung bài viết..."
                rows={16}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-y font-mono"
              />
            </div>
          </div>

          {/* SEO */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">SEO</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
              <input
                type="text"
                value={current.metaTitle ?? ""}
                onChange={(e) => updateTranslation(activeLocale, "metaTitle", e.target.value)}
                placeholder="Tiêu đề SEO (để trống sẽ dùng tiêu đề bài viết)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
              <textarea
                value={current.metaDescription ?? ""}
                onChange={(e) => updateTranslation(activeLocale, "metaDescription", e.target.value)}
                placeholder="Mô tả SEO (tối đa 160 ký tự)"
                rows={3}
                maxLength={160}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">{(current.metaDescription ?? "").length}/160</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Cài đặt</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as NewsStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="draft">Nháp</option>
                <option value="published">Xuất bản</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh thumbnail (URL)</label>
              <input
                type="text"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {thumbnail && (
                <img src={thumbnail} alt="thumbnail" className="mt-2 w-full aspect-video object-cover rounded-lg" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
