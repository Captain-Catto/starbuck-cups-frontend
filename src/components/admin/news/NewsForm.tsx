"use client";

import { useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { RootState } from "@/store";
import { Save, ArrowLeft, Upload, X } from "lucide-react";
import dynamic from "next/dynamic";
import type { News, NewsTranslationsInput, NewsStatus } from "@/types";
import { useUpload } from "@/hooks/useUpload";

const RichTextEditor = dynamic(() => import("@/components/ui/RichTextEditor"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 border border-gray-300 rounded-lg bg-gray-50 animate-pulse" />
  ),
});

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
  const { uploadSingle } = useUpload();
  const token = useSelector((state: RootState) => state.auth.token);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<NewsStatus>(initialData?.status ?? "draft");
  const [thumbnail, setThumbnail] = useState(initialData?.thumbnail ?? "");
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
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

  const handleThumbnailFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Chỉ chấp nhận file ảnh");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh không được vượt quá 5MB");
      return;
    }
    setThumbnailUploading(true);
    try {
      const res = await uploadSingle(file, "uploads");
      if (res.data?.url) {
        setThumbnail(res.data.url);
        toast.success("Đã upload thumbnail");
      }
    } catch {
      toast.error("Upload thumbnail thất bại");
    } finally {
      setThumbnailUploading(false);
    }
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
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
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

  const current = translations[activeLocale] ?? {
    title: "",
    summary: "",
    content: "",
    metaTitle: "",
    metaDescription: "",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/admin/news")}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="px-4 py-2 text-sm border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
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
          <div className="flex gap-2 border-b border-gray-700">
            {LOCALES.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveLocale(key)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeLocale === key
                    ? "border-green-600 text-green-600"
                    : "border-transparent text-gray-400 hover:text-gray-200"
                }`}
              >
                {label}
                {key === "vi" && <span className="ml-1 text-red-500">*</span>}
              </button>
            ))}
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Tiêu đề {activeLocale === "vi" && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                value={current.title ?? ""}
                onChange={(e) => updateTranslation(activeLocale, "title", e.target.value)}
                placeholder="Nhập tiêu đề bài viết..."
                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Tóm tắt</label>
              <textarea
                value={current.summary ?? ""}
                onChange={(e) => updateTranslation(activeLocale, "summary", e.target.value)}
                placeholder="Tóm tắt ngắn hiển thị trên trang danh sách và SEO..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nội dung</label>
              <RichTextEditor
                value={current.content ?? ""}
                onChange={(val) => updateTranslation(activeLocale, "content", val)}
                placeholder="Nhập nội dung bài viết..."
                height={500}
              />
            </div>
          </div>

          {/* SEO */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white">SEO</h3>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Meta Title</label>
              <input
                type="text"
                value={current.metaTitle ?? ""}
                onChange={(e) => updateTranslation(activeLocale, "metaTitle", e.target.value)}
                placeholder="Tiêu đề SEO (để trống sẽ dùng tiêu đề bài viết)"
                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Meta Description</label>
              <textarea
                value={current.metaDescription ?? ""}
                onChange={(e) => updateTranslation(activeLocale, "metaDescription", e.target.value)}
                placeholder="Mô tả SEO (tối đa 160 ký tự)"
                rows={3}
                maxLength={160}
                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {(current.metaDescription ?? "").length}/160
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white">Cài đặt</h3>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Trạng thái</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as NewsStatus)}
                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="draft">Nháp</option>
                <option value="published">Xuất bản</option>
              </select>
            </div>

            {/* Thumbnail upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Thumbnail</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleThumbnailFile(file);
                  e.target.value = "";
                }}
              />
              {thumbnail ? (
                <div className="relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumbnail}
                    alt="thumbnail"
                    className="w-full aspect-video object-cover rounded-lg border border-gray-600"
                  />
                  <button
                    onClick={() => setThumbnail("")}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 w-full px-3 py-1.5 text-xs border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Đổi ảnh
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={thumbnailUploading}
                  className="w-full border-2 border-dashed border-gray-600 rounded-lg p-6 flex flex-col items-center gap-2 hover:border-green-500 hover:bg-green-900/20 transition-colors disabled:opacity-50"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleThumbnailFile(file);
                  }}
                >
                  <Upload className="w-6 h-6 text-gray-500" />
                  <span className="text-sm text-gray-400">
                    {thumbnailUploading ? "Đang upload..." : "Click hoặc kéo thả ảnh"}
                  </span>
                  <span className="text-xs text-gray-500">PNG, JPG, WebP tối đa 5MB</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
