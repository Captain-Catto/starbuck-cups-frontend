import { NewsForm } from "@/components/admin/news/NewsForm";
import { getApiUrl } from "@/lib/api-config";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import type { News } from "@/types";

export const dynamic = "force-dynamic";

async function getNews(id: string): Promise<News | null> {
  try {
    const cookieStore = await cookies();
    const res = await fetch(getApiUrl(`news/admin/${id}`), {
      cache: "no-store",
      headers: { cookie: cookieStore.toString() },
    });
    const data = await res.json();
    return data.success ? data.data?.news : null;
  } catch {
    return null;
  }
}

export default async function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const news = await getNews(id);

  if (!news) notFound();

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Chỉnh sửa bài viết</h1>
      <NewsForm initialData={news} />
    </div>
  );
}
