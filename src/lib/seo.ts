import { Metadata } from "next";
import { PageSEO, Product } from "@/types";

export const siteConfig = {
  name: "H's shoucangpu - Collectible Gift Shop",
  description:
    "Chuyên ly Starbucks, cốc Starbucks chính hãng các nước. Starbucks Cups, Tumbler, bình giữ nhiệt chính hãng. 95% mẫu hàng sẵn, ship hoả tốc HCM. Quà tặng cao cấp, có dịch vụ gói quà.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://hasron.vn",
  image: "/logo.png",
  keywords:
    "starbucks, ly starbucks, ly starbuck, cốc starbucks, cốc starbuck, starbucks cups, starbucks cup, starbuck cups, starbuck cup, cups, tumbler, ly giữ nhiệt, starbucks vietnam, ly starbucks chính hãng, ly starbuck chính hãng, mua ly starbuck, mua ly starbucks, mua cốc starbucks, bình starbucks chính hãng, bình giữ nhiệt starbucks, ly giữ nhiệt starbucks, ly sứ starbucks, ly starbucks giá rẻ, ly starbucks hcm, starbuck vietnam, quà tặng starbucks, ly starbucks chính hãng hcm, cốc starbucks sưu tầm, mua ly starbucks auth, ly starbucks auth, ly starbucks nhập khẩu, ly starbucks limited edition, ly starbucks các nước, tumbler starbucks chính hãng, bình nước starbucks, ly starbucks quà tặng",
};

export function generateSEO(
  seo: Partial<PageSEO> & { locale?: string }
): Metadata {
  const title = seo.title
    ? `${seo.title} | ${siteConfig.name}`
    : siteConfig.name;
  const description = seo.description || siteConfig.description;

  const ogLocaleMap: Record<string, string> = {
    vi: "vi_VN",
    en: "en_US",
    zh: "zh_CN",
  };
  const locale = seo.locale || "vi";
  const image = seo.openGraph?.image || siteConfig.image;
  const pathFromSeo = seo.openGraph?.url || "/";
  const normalizedPath =
    pathFromSeo.startsWith("http://") || pathFromSeo.startsWith("https://")
      ? new URL(pathFromSeo).pathname
      : pathFromSeo;
  const cleanPath = normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`;
  const localePrefix = locale === "vi" ? "" : `/${locale}`;
  const canonicalPath =
    cleanPath === "/" ? `${localePrefix || "/"}` : `${localePrefix}${cleanPath}`;
  const canonicalUrl = seo.canonical || new URL(canonicalPath, siteConfig.url).toString();
  const ogLocale = ogLocaleMap[locale] || "vi_VN";

  const buildLocalizedUrl = (targetLocale: "vi" | "en" | "zh") => {
    const prefix = targetLocale === "vi" ? "" : `/${targetLocale}`;
    const localizedPath =
      cleanPath === "/" ? `${prefix || "/"}` : `${prefix}${cleanPath}`;
    return new URL(localizedPath, siteConfig.url).toString();
  };

  return {
    title,
    description,
    keywords: seo.keywords || siteConfig.keywords,
    authors: [{ name: siteConfig.name }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        vi: buildLocalizedUrl("vi"),
        en: buildLocalizedUrl("en"),
        zh: buildLocalizedUrl("zh"),
        "x-default": buildLocalizedUrl("vi"),
      },
    },
    openGraph: {
      title: seo.openGraph?.title || title,
      description: seo.openGraph?.description || description,
      url: canonicalUrl,
      siteName: siteConfig.name,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: seo.openGraph?.title || title,
        },
      ],
      locale: ogLocale,
      type: seo.openGraph?.type || "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seo.openGraph?.title || title,
      description: seo.openGraph?.description || description,
      images: [image],
      creator: "@hasron_leung",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    },
  };
}

export function generateProductStructuredData(product: Product) {
  const cleanDescription = product.description
    ? product.description.replace(/<[^>]*>/g, "").slice(0, 500)
    : "";

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: cleanDescription,
    image: product.productImages?.map((img: { url: string }) =>
      img.url.startsWith("http") ? img.url : `${siteConfig.url}${img.url}`
    ),
    url: `${siteConfig.url}/products/${product.slug}`,
    brand: {
      "@type": "Brand",
      name: "Starbucks",
    },
    category:
      product.productCategories
        ?.map((pc: { category: { name: string } }) => pc.category.name)
        .join(", ") || "",
    color:
      product.productColors
        ?.map((pc: { color: { name: string } }) => pc.color.name)
        .join(", ") || "",
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceCurrency: "VND",
      seller: {
        "@type": "Organization",
        name: siteConfig.name,
      },
    },
  };
}

export function generateBreadcrumbStructuredData(
  items: Array<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.url}`,
    })),
  };
}

export function generateOrganizationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    logo: `${siteConfig.url}/images/logo.png`,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["Vietnamese", "English", "Chinese"],
    },
    sameAs: [
      "https://www.facebook.com/profile.php?id=61560973846348",
      "https://www.instagram.com/hasron_leung",
    ],
  };
}
