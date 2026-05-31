"use client";

import { useReducer, useRef, type RefObject } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { RootState } from "@/store";
import { Save, ArrowLeft, Upload, X } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
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

type NewsLocale = (typeof LOCALES)[number]["key"];
type NewsTranslationDraft = NonNullable<NewsTranslationsInput[NewsLocale]>;

interface NewsFormProps {
  initialData?: News;
}

const emptyTranslation: NewsTranslationDraft = {
  title: "",
  summary: "",
  content: "",
  metaTitle: "",
  metaDescription: "",
};

function NewsFormHeader({
  saving,
  onBack,
  onSaveDraft,
  onPublish,
}: {
  saving: boolean;
  onBack: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="size-4" />
        Quay lại
      </button>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={saving}
          className="px-4 py-2 text-sm border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          Lưu nháp
        </button>
        <button
          type="button"
          onClick={onPublish}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          <Save className="size-4" />
          {saving ? "Đang lưu..." : "Xuất bản"}
        </button>
      </div>
    </div>
  );
}

function LocaleTabs({
  activeLocale,
  onChange,
}: {
  activeLocale: NewsLocale;
  onChange: (locale: NewsLocale) => void;
}) {
  return (
    <div className="flex gap-2 border-b border-gray-700">
      {LOCALES.map(({ key, label }) => (
        <button
          type="button"
          key={key}
          onClick={() => onChange(key)}
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
  );
}

function NewsContentFields({
  locale,
  current,
  onUpdate,
}: {
  locale: NewsLocale;
  current: NewsTranslationDraft;
  onUpdate: (locale: NewsLocale, field: string, value: string) => void;
}) {
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
      <div>
        <label
          className="block text-sm font-medium text-gray-300 mb-1"
          htmlFor="newsform-nh-p-ti-u-b-i-vi-t"
        >
          Tiêu đề {locale === "vi" && <span className="text-red-500">*</span>}
        </label>
        <input
          aria-label="Nhập tiêu đề bài viết..."
          type="text"
          value={current.title ?? ""}
          onChange={(e) => onUpdate(locale, "title", e.target.value)}
          placeholder="Nhập tiêu đề bài viết..."
          className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          id="newsform-nh-p-ti-u-b-i-vi-t"
        />
      </div>

      <div>
        <label
          className="block text-sm font-medium text-gray-300 mb-1"
          htmlFor="newsform-t-m-t-t-ng-n-hi-n-th-tr-n-trang-danh-s-"
        >
          Tóm tắt
        </label>
        <textarea
          aria-label="Tóm tắt ngắn hiển thị trên trang danh sách và SEO..."
          value={current.summary ?? ""}
          onChange={(e) => onUpdate(locale, "summary", e.target.value)}
          placeholder="Tóm tắt ngắn hiển thị trên trang danh sách và SEO..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          id="newsform-t-m-t-t-ng-n-hi-n-th-tr-n-trang-danh-s-"
        />
      </div>

      <div>
        <span className="block text-sm font-medium text-gray-300 mb-2">
          Nội dung
        </span>
        <RichTextEditor
          value={current.content ?? ""}
          onChange={(val) => onUpdate(locale, "content", val)}
          placeholder="Nhập nội dung bài viết..."
          height={500}
        />
      </div>
    </div>
  );
}

function SeoFields({
  locale,
  current,
  onUpdate,
}: {
  locale: NewsLocale;
  current: NewsTranslationDraft;
  onUpdate: (locale: NewsLocale, field: string, value: string) => void;
}) {
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
      <h3 className="text-sm font-semibold text-white">SEO</h3>
      <div>
        <label
          className="block text-sm font-medium text-gray-300 mb-1"
          htmlFor="newsform-ti-u-seo-tr-ng-s-d-ng-ti-u-b-i-vi-t"
        >
          Meta Title
        </label>
        <input
          aria-label="Tiêu đề SEO (để trống sẽ dùng tiêu đề bài viết)"
          type="text"
          value={current.metaTitle ?? ""}
          onChange={(e) => onUpdate(locale, "metaTitle", e.target.value)}
          placeholder="Tiêu đề SEO (để trống sẽ dùng tiêu đề bài viết)"
          className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          id="newsform-ti-u-seo-tr-ng-s-d-ng-ti-u-b-i-vi-t"
        />
      </div>
      <div>
        <label
          className="block text-sm font-medium text-gray-300 mb-1"
          htmlFor="newsform-m-t-seo-t-i-a-160-k-t"
        >
          Meta Description
        </label>
        <textarea
          aria-label="Mô tả SEO (tối đa 160 ký tự)"
          value={current.metaDescription ?? ""}
          onChange={(e) => onUpdate(locale, "metaDescription", e.target.value)}
          placeholder="Mô tả SEO (tối đa 160 ký tự)"
          rows={3}
          maxLength={160}
          className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          id="newsform-m-t-seo-t-i-a-160-k-t"
        />
        <p className="text-xs text-gray-500 mt-1">
          {(current.metaDescription ?? "").length}/160
        </p>
      </div>
    </div>
  );
}

function NewsSettingsPanel({
  status,
  thumbnail,
  thumbnailUploading,
  fileInputRef,
  onStatusChange,
  onThumbnailFile,
  onClearThumbnail,
}: {
  status: NewsStatus;
  thumbnail: string;
  thumbnailUploading: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onStatusChange: (status: NewsStatus) => void;
  onThumbnailFile: (file: File) => void;
  onClearThumbnail: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white">Cài đặt</h3>
        <div>
          <label
            className="block text-sm font-medium text-gray-300 mb-1"
            htmlFor="newsform-select-option"
          >
            Trạng thái
          </label>
          <select
            aria-label="Select option"
            value={status}
            onChange={(e) => onStatusChange(e.target.value as NewsStatus)}
            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            id="newsform-select-option"
          >
            <option value="draft">Nháp</option>
            <option value="published">Xuất bản</option>
          </select>
        </div>

        <div>
          <label
            className="block text-sm font-medium text-gray-300 mb-2"
            htmlFor="newsform-file"
          >
            Thumbnail
          </label>
          <input
            aria-label="file"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onThumbnailFile(file);
              e.target.value = "";
            }}
            id="newsform-file"
          />
          {thumbnail ? (
            <div className="relative group w-full aspect-video rounded-lg overflow-hidden border border-gray-600">
              <Image
                src={thumbnail}
                alt="thumbnail"
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover"
              />
              <button
                type="button"
                onClick={onClearThumbnail}
                className="absolute top-2 right-2 p-1 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
              >
                <X className="size-4 text-red-500" />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 w-full px-3 py-1.5 text-xs border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Đổi ảnh
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={thumbnailUploading}
              className="w-full border-2 border-dashed border-gray-600 rounded-lg p-6 flex flex-col items-center gap-2 hover:border-green-500 hover:bg-green-900/20 transition-colors disabled:opacity-50"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) onThumbnailFile(file);
              }}
            >
              <Upload className="size-6 text-gray-500" />
              <span className="text-sm text-gray-400">
                {thumbnailUploading ? "Đang upload..." : "Click hoặc kéo thả ảnh"}
              </span>
              <span className="text-xs text-gray-500">
                PNG, JPG, WebP tối đa 5MB
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface NewsState {
  status: NewsStatus;
  thumbnail: string;
  thumbnailUploading: boolean;
  activeLocale: NewsLocale;
  translations: NewsTranslationsInput;
  saving: boolean;
}

type NewsAction =
  | { type: "SET_STATUS"; payload: NewsStatus }
  | { type: "SET_THUMBNAIL"; payload: string }
  | { type: "SET_THUMBNAIL_UPLOADING"; payload: boolean }
  | { type: "SET_ACTIVE_LOCALE"; payload: NewsLocale }
  | { type: "UPDATE_TRANSLATION"; payload: { locale: NewsLocale; field: string; value: string } }
  | { type: "SET_SAVING"; payload: boolean };

const initialNewsState = (initialData?: News): NewsState => {
  const translationsResult: NewsTranslationsInput = {};
  const translationsByLocale = new Map(
    initialData?.translations?.map((translation) => [
      translation.locale,
      translation,
    ]) ?? []
  );
  for (const { key } of LOCALES) {
    const t = translationsByLocale.get(key);
    translationsResult[key] = {
      title: t?.title ?? "",
      summary: t?.summary ?? "",
      content: t?.content ?? "",
      metaTitle: t?.metaTitle ?? "",
      metaDescription: t?.metaDescription ?? "",
    };
  }

  return {
    status: initialData?.status ?? "draft",
    thumbnail: initialData?.thumbnail ?? "",
    thumbnailUploading: false,
    activeLocale: "vi",
    translations: translationsResult,
    saving: false,
  };
};

function newsReducer(state: NewsState, action: NewsAction): NewsState {
  switch (action.type) {
    case "SET_STATUS":
      return { ...state, status: action.payload };
    case "SET_THUMBNAIL":
      return { ...state, thumbnail: action.payload };
    case "SET_THUMBNAIL_UPLOADING":
      return { ...state, thumbnailUploading: action.payload };
    case "SET_ACTIVE_LOCALE":
      return { ...state, activeLocale: action.payload };
    case "UPDATE_TRANSLATION":
      return {
        ...state,
        translations: {
          ...state.translations,
          [action.payload.locale]: {
            ...state.translations[action.payload.locale],
            [action.payload.field]: action.payload.value,
          },
        },
      };
    case "SET_SAVING":
      return { ...state, saving: action.payload };
    default:
      return state;
  }
}

export function NewsForm({ initialData }: NewsFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;
  const { uploadSingle } = useUpload();
  const token = useSelector((state: RootState) => state.auth.token);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [state, dispatch] = useReducer(newsReducer, initialNewsState(initialData));
  const { status, thumbnail, thumbnailUploading, activeLocale, translations, saving } = state;

  const updateTranslation = (locale: NewsLocale, field: string, value: string) => {
    dispatch({ type: "UPDATE_TRANSLATION", payload: { locale, field, value } });
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
    dispatch({ type: "SET_THUMBNAIL_UPLOADING", payload: true });
    try {
      const res = await uploadSingle(file, "uploads");
      if (res.data?.url) {
        dispatch({ type: "SET_THUMBNAIL", payload: res.data.url });
        toast.success("Đã upload thumbnail");
      }
    } catch {
      toast.error("Upload thumbnail thất bại");
    } finally {
      dispatch({ type: "SET_THUMBNAIL_UPLOADING", payload: false });
    }
  };

  const handleSave = async (saveStatus?: NewsStatus) => {
    const finalStatus = saveStatus ?? status;

    if (!translations.vi?.title?.trim()) {
      toast.error("Tiêu đề tiếng Việt là bắt buộc");
      return;
    }

    dispatch({ type: "SET_SAVING", payload: true });
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
      dispatch({ type: "SET_SAVING", payload: false });
    }
  };

  const current = translations[activeLocale] ?? emptyTranslation;

  return (
    <div className="space-y-6">
      <NewsFormHeader
        saving={saving}
        onBack={() => router.push("/admin/news")}
        onSaveDraft={() => void handleSave("draft")}
        onPublish={() => void handleSave("published")}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <LocaleTabs activeLocale={activeLocale} onChange={(locale) => dispatch({ type: "SET_ACTIVE_LOCALE", payload: locale })} />
          <NewsContentFields
            locale={activeLocale}
            current={current}
            onUpdate={updateTranslation}
          />
          <SeoFields
            locale={activeLocale}
            current={current}
            onUpdate={updateTranslation}
          />
        </div>

        <NewsSettingsPanel
          status={status}
          thumbnail={thumbnail}
          thumbnailUploading={thumbnailUploading}
          fileInputRef={fileInputRef}
          onStatusChange={(status) => dispatch({ type: "SET_STATUS", payload: status })}
          onThumbnailFile={(file) => void handleThumbnailFile(file)}
          onClearThumbnail={() => dispatch({ type: "SET_THUMBNAIL", payload: "" })}
        />
      </div>
    </div>
  );
}
