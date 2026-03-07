import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://starbucks-cups.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/products", "/products/*", "/en/*", "/zh/*", "/contacts"],
        disallow: ["/admin/*", "/api/*", "/_next/*"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
