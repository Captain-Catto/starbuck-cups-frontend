import { getApiUrl } from "@/lib/server-api";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import type { News } from "@/types";
import type { Metadata } from "next";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const res = await fetch(`${getApiUrl("news/public")}?limit=100`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const items: Array<{ slug: string }> = data.data?.items ?? [];
    const locales = ["vi", "en", "zh"];
    return locales.flatMap((locale) =>
      items.map(({ slug }) => ({ locale, slug }))
    );
  } catch {
    return [];
  }
}

async function getNews(slug: string, locale: string): Promise<News | null> {
  try {
    const res = await fetch(`${getApiUrl(`news/public/${slug}`)}?locale=${locale}`, {
      next: { revalidate: 3600 },
    });
    const data = await res.json();
    return data.success ? data.data?.news : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const news = await getNews(slug, locale);
  if (!news) return {};

  const t = news.translations?.find((tr) => tr.locale === locale) ?? news.translations?.[0];
  const title = t?.metaTitle || t?.title || "";
  const description = t?.metaDescription || t?.summary || "";
  const canonical = locale === "vi" ? `https://hasron.vn/news/${slug}` : `https://hasron.vn/${locale}/news/${slug}`;

  return {
    title: title ? `${title} | Hasron` : "Hasron",
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      images: news.thumbnail ? [{ url: news.thumbnail }] : [],
      type: "article",
      publishedTime: news.publishedAt ?? undefined,
    },
  };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const news = await getNews(slug, locale);
  if (!news) notFound();

  const t = news.translations?.find((tr) => tr.locale === locale) ?? news.translations?.[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: t?.title ?? "",
    description: t?.summary ?? "",
    image: news.thumbnail ? [news.thumbnail] : [],
    datePublished: news.publishedAt ?? news.createdAt,
    dateModified: news.updatedAt,
    author: { "@type": "Organization", name: "Hasron", url: "https://hasron.vn" },
    publisher: {
      "@type": "Organization",
      name: "Hasron",
      logo: { "@type": "ImageObject", url: "https://hasron.vn/logo.png" },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://hasron.vn/${locale}/news/${slug}` },
  };

  return (
    <>
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>

      <div className="min-h-screen bg-zinc-950 text-white">
        <div className="container mx-auto max-w-3xl px-4 pt-20 pb-12 md:px-6 md:pt-24">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <span>/</span>
            <Link href="/news" className="hover:text-white transition-colors">Tin tức</Link>
            <span>/</span>
            <span className="text-gray-300 line-clamp-1">{t?.title}</span>
          </nav>

          {/* Thumbnail */}
          {news.thumbnail && (
            <div className="aspect-video rounded-xl overflow-hidden mb-8">
              <Image src={news.thumbnail} alt={t?.title ?? ""} fill sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
            </div>
          )}

          {/* Header */}
          <header className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">{t?.title}</h1>
            {t?.summary && <p className="text-gray-400 text-lg leading-relaxed">{t.summary}</p>}
            <p className="text-sm text-gray-600 mt-3">
              {news.publishedAt
                ? new Date(news.publishedAt).toLocaleDateString("vi-VN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : ""}
            </p>
          </header>

          {/* Content */}
          {t?.content && (
            <div className="max-w-none text-gray-300 leading-relaxed whitespace-pre-wrap [&_h1]:text-white [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-8 [&_h1]:mb-4 [&_h2]:text-white [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-white [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2 [&_p]:mb-4 [&_a]:text-green-400 [&_a]:underline [&_a:hover]:text-green-300 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_li]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-green-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-400 [&_blockquote]:my-4 [&_code]:bg-zinc-800 [&_code]:text-green-400 [&_code]:px-1 [&_code]:rounded [&_pre]:bg-zinc-800 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:my-4 [&_img]:rounded-lg [&_img]:my-4 [&_img]:max-w-full [&_hr]:border-zinc-700 [&_hr]:my-6">
              {t.content}
            </div>
          )}

          {/* Back link */}
          <div className="mt-12 pt-8 border-t border-zinc-800">
            <Link href="/news" className="text-sm text-green-400 hover:text-green-300 transition-colors">
              ← Xem tất cả tin tức
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
