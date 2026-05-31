import { getApiUrl } from "@/lib/api-config";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import type { News } from "@/types";
import type { Metadata } from "next";

export const revalidate = 600;

interface NewsListResponse {
  success: boolean;
  data?: { items: News[]; pagination: { total_pages: number } };
}

async function getNewsList(locale: string): Promise<News[]> {
  try {
    const res = await fetch(
      `${getApiUrl("news/public")}?locale=${locale}&limit=12`,
      { next: { revalidate: 600 } }
    );
    const data: NewsListResponse = await res.json();
    return data.success ? (data.data?.items ?? []) : [];
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return {
    title: t("newsTitle"),
    description: t("newsDescription"),
    alternates: { canonical: locale === "vi" ? "https://hasron.vn/news" : `https://hasron.vn/${locale}/news` },
  };
}

export default async function NewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const newsList = await getNewsList(locale);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="container mx-auto px-4 pt-20 pb-12 md:px-6 lg:px-8 md:pt-24">
        <h1 className="text-3xl font-bold mb-2">Tin tức</h1>
        <p className="text-gray-400 mb-10">Cập nhật mới nhất về sản phẩm và bộ sưu tập Starbucks</p>

        {newsList.length === 0 ? (
          <div className="text-center py-20 text-gray-500">Chưa có bài viết nào.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsList.map((news) => {
              const t = news.translations?.find((tr) => tr.locale === locale) ?? news.translations?.[0];
              return (
                <Link
                  key={news.id}
                  href={`/news/${news.slug}`}
                  className="group block bg-zinc-900 rounded-xl overflow-hidden hover:ring-1 hover:ring-white/20 transition-all"
                >
                  {news.thumbnail ? (
                    <div className="aspect-video overflow-hidden">
                      <Image
                        src={news.thumbnail}
                        alt={t?.title ?? ""}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-zinc-800 flex items-center justify-center text-4xl">☕</div>
                  )}
                  <div className="p-5">
                    <p className="text-xs text-gray-500 mb-2">
                      {news.publishedAt
                        ? new Date(news.publishedAt).toLocaleDateString("vi-VN")
                        : ""}
                    </p>
                    <h2 className="font-semibold text-white line-clamp-2 mb-2 group-hover:text-green-400 transition-colors">
                      {t?.title ?? ""}
                    </h2>
                    {t?.summary && (
                      <p className="text-sm text-gray-400 line-clamp-3">{t.summary}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
