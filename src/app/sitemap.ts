import { MetadataRoute } from "next";
import { getApiUrl } from "@/lib/api-config";
import { locales, defaultLocale } from "@/i18n/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hasron.vn";
  const apiUrl = getApiUrl("");

  // Helper to generate locale-aware URLs
  const getLocalizedUrl = (path: string, locale: string) => {
    if (locale === defaultLocale) {
      return `${baseUrl}${path}`;
    }
    return `${baseUrl}/${locale}${path}`;
  };

  // Helper to generate alternates for a path
  const getAlternates = (path: string) => {
    const languages: Record<string, string> = {};
    for (const locale of locales) {
      languages[locale] = getLocalizedUrl(path, locale);
    }
    languages["x-default"] = getLocalizedUrl(path, defaultLocale);
    return { languages };
  };

  // Static pages with locale variants
  // NOTE: /cart is intentionally excluded — cart pages are user-specific and should not be indexed
  const staticPaths = [
    { path: "", changeFrequency: "daily" as const, priority: 1 },
    { path: "/products", changeFrequency: "daily" as const, priority: 0.9 },
    { path: "/contacts", changeFrequency: "monthly" as const, priority: 0.7 },
  ];

  const staticPages: MetadataRoute.Sitemap = staticPaths.flatMap(
    ({ path, changeFrequency, priority }) =>
      locales.map((locale) => ({
        url: getLocalizedUrl(path, locale),
        lastModified: new Date(),
        changeFrequency,
        priority,
        alternates: getAlternates(path),
      }))
  );

  // Fetch dynamic product pages from API (paginated)
  let productPages: MetadataRoute.Sitemap = [];
  const PAGE_SIZE = 100;

  try {
    const fetchPage = (page: number) =>
      fetch(`${apiUrl}/products/public?limit=${PAGE_SIZE}&page=${page}`, {
        next: { revalidate: 3600, tags: ["products"] },
        headers: { "User-Agent": "Sitemap Generator" },
      }).then((r) => r.json());

    const firstData = await fetchPage(1);

    if (firstData.success && firstData.data?.items) {
      const totalPages: number = firstData.data.pagination?.total_pages || firstData.data.totalPages || 1;

      // Fetch remaining pages in parallel
      const remainingData =
        totalPages > 1
          ? await Promise.all(
              Array.from({ length: totalPages - 1 }, (_, i) =>
                fetchPage(i + 2)
              )
            )
          : [];

      const allProducts = [firstData, ...remainingData].flatMap(
        (data) => (data.success && Array.isArray(data.data?.items) ? data.data.items : [])
      );

      productPages = allProducts.flatMap(
        (product: { slug: string; createdAt: string; updatedAt?: string }) =>
          locales.map((locale) => ({
            url: getLocalizedUrl(`/products/${product.slug}`, locale),
            lastModified: new Date(product.updatedAt || product.createdAt),
            changeFrequency: "weekly" as const,
            priority: 0.8,
            alternates: getAlternates(`/products/${product.slug}`),
          }))
      );
    }
  } catch {
    // Fallback to empty array if API fails
  }

  // Fetch category pages
  let categoryPages: MetadataRoute.Sitemap = [];

  try {
    const catRes = await fetch(`${apiUrl}/categories/public?limit=100`, {
      next: { revalidate: 3600 },
      headers: { "User-Agent": "Sitemap Generator" },
    });
    const catData = await catRes.json();

    if (catData.success && Array.isArray(catData.data?.items)) {
      categoryPages = catData.data.items
        .filter((cat: { isActive: boolean; slug: string }) => cat.isActive)
        .flatMap((cat: { slug: string; updatedAt?: string; createdAt: string }) =>
          locales.map((locale) => ({
            url: getLocalizedUrl(`/category/${cat.slug}`, locale),
            lastModified: new Date(cat.updatedAt || cat.createdAt),
            changeFrequency: "weekly" as const,
            priority: 0.85,
            alternates: getAlternates(`/category/${cat.slug}`),
          }))
        );
    }
  } catch {
    // Fallback to empty array if API fails
  }

  return [...staticPages, ...categoryPages, ...productPages];
}
