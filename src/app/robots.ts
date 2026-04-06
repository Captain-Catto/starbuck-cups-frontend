import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://hasron.vn";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/products", "/products/*", "/en/*", "/zh/*", "/contacts", "/api/image"],
        disallow: ["/admin/*", "/api/products*", "/api/categories*", "/api/colors*", "/api/orders*", "/_next/*"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
