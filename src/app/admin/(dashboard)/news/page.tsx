"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Pencil, Trash2, Eye, EyeOff, Newspaper } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { LoadingState } from "@/components/admin/LoadingState";
import { EmptyState } from "@/components/admin/EmptyState";
import type { News } from "@/types";

export const dynamic = "force-dynamic";

export default function AdminNewsPage() {
  const router = useRouter();
  const [newsList, setNewsList] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const authHeader = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchNews = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/admin/news?limit=50", { headers: authHeader() });
      const data = await res.json();
      if (data.success) {
        setNewsList(data.data?.items ?? []);
      } else {
        throw new Error(data.message || "Không thể tải danh sách bài viết");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Không thể tải danh sách bài viết";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNews(); }, [fetchNews]);

  const handleToggleStatus = async (news: News) => {
    setTogglingId(news.id);
    try {
      const res = await fetch(`/api/admin/news/${news.id}/status`, { method: "PATCH", headers: authHeader() });
      const data = await res.json();
      if (data.success) {
        toast.success(news.status === "published" ? "Đã chuyển về nháp" : "Đã xuất bản");
        fetchNews();
      }
    } catch {
      toast.error("Không thể cập nhật trạng thái");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa bài viết này?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/news/${id}`, { method: "DELETE", headers: authHeader() });
      const data = await res.json();
      if (data.success) {
        toast.success("Đã xóa bài viết");
        fetchNews();
      }
    } catch {
      toast.error("Không thể xóa bài viết");
    } finally {
      setDeletingId(null);
    }
  };

  const getTitle = (news: News) =>
    news.translations?.find((t) => t.locale === "vi")?.title ||
    news.translations?.[0]?.title ||
    "(Chưa có tiêu đề)";

  if (loading) return <LoadingState />;

  if (error) {
    return (
      <div className="space-y-6 bg-gray-900 min-h-screen p-6">
        <PageHeader title="Quản lý Bài viết" description="Tạo và quản lý nội dung tin tức, blog để tăng SEO" />
        <div className="bg-gray-800 rounded-xl border border-red-700 p-8 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchNews}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-gray-900 min-h-screen p-6">
      <PageHeader
        title="Quản lý Bài viết"
        description="Tạo và quản lý nội dung tin tức, blog để tăng SEO"
        action={
          <button
            onClick={() => router.push("/admin/news/new")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Thêm bài viết
          </button>
        }
      />

      {newsList.length === 0 ? (
        <EmptyState
          icon={<Newspaper className="w-8 h-8 text-gray-400" />}
          title="Chưa có bài viết nào"
          description="Tạo bài viết đầu tiên để tăng khả năng SEO cho website"
          actionLabel="Tạo bài viết"
          onAction={() => router.push("/admin/news/new")}
        />
      ) : (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700/50 border-b border-gray-700">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Tiêu đề</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Trạng thái</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase">Ngày tạo</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-400 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {newsList.map((news) => (
                <tr key={news.id} className="hover:bg-gray-700/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {news.thumbnail && (
                        <Image src={news.thumbnail} alt={getTitle(news)} width={40} height={40} className="rounded object-cover flex-shrink-0" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-white line-clamp-1">{getTitle(news)}</p>
                        <p className="text-xs text-gray-500">{news.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      news.status === "published"
                        ? "bg-green-900/50 text-green-400"
                        : "bg-gray-700 text-gray-400"
                    }`}>
                      {news.status === "published" ? "Đã xuất bản" : "Nháp"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(news.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleStatus(news)}
                        disabled={togglingId === news.id}
                        title={news.status === "published" ? "Chuyển về nháp" : "Xuất bản"}
                        aria-label={news.status === "published" ? "Chuyển về nháp" : "Xuất bản"}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                      >
                        {news.status === "published" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => router.push(`/admin/news/${news.id}`)}
                        title="Chỉnh sửa"
                        aria-label="Chỉnh sửa bài viết"
                        className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(news.id)}
                        disabled={deletingId === news.id}
                        title="Xóa"
                        aria-label="Xóa bài viết"
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
