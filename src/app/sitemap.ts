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
  const staticPaths = [
    { path: "", changeFrequency: "daily" as const, priority: 1 },
    { path: "/products", changeFrequency: "daily" as const, priority: 0.9 },
    { path: "/contacts", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/cart", changeFrequency: "weekly" as const, priority: 0.8 },
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

  // Fetch dynamic product pages from API
  let productPages: MetadataRoute.Sitemap = [];

  try {
    const response = await fetch(`${apiUrl}/products/public?limit=100`, {
      next: { revalidate: 3600 },
      headers: {
        "User-Agent": "Sitemap Generator",
      },
    });

    if (response.ok) {
      const data = await response.json();

      if (data.success && data.data && data.data.items) {
        const products = data.data.items;

        if (Array.isArray(products)) {
          productPages = products.flatMap(
            (product: { slug: string; createdAt: string }) =>
              locales.map((locale) => ({
                url: getLocalizedUrl(`/products/${product.slug}`, locale),
                lastModified: new Date(product.createdAt),
                changeFrequency: "weekly" as const,
                priority: 0.8,
                alternates: getAlternates(`/products/${product.slug}`),
              }))
          );
        }
      }
    }
  } catch {
    // Fallback to empty array if API fails
  }

  return [...staticPages, ...productPages];
}
