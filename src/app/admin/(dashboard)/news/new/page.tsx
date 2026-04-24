import { NewsForm } from "@/components/admin/news/NewsForm";

export const dynamic = "force-dynamic";

export default function NewNewsPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Tạo bài viết mới</h1>
      <NewsForm />
    </div>
  );
}
