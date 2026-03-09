"use client";

import Script from "next/script";
import { useTranslations } from "next-intl";

export function StructuredData() {
  const tSeo = useTranslations("seo");

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "H's shoucangpu - Collectible Gift Shop",
    description: tSeo("siteDescription"),
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://hasron.vn",
    logo: {
      "@type": "ImageObject",
      url: `${
        process.env.NEXT_PUBLIC_SITE_URL || "https://hasron.vn"
      }/logo.png`,
      width: "200",
      height: "200",
    },
    image: `${
      process.env.NEXT_PUBLIC_SITE_URL || "https://hasron.vn"
    }/logo.png`,
    sameAs: [
      "https://www.facebook.com/profile.php?id=61560973846348",
      "https://www.instagram.com/hasron_leung",
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Ly Starbucks",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Product",
            name: "Ly Starbucks Tumbler",
            category: "Drinkware",
            keywords: tSeo("siteKeywords"),
          },
        },
      ],
    },
    priceRange: "₫₫",
    currenciesAccepted: "VND",
    paymentAccepted: ["Cash", "Bank Transfer", "COD", "Zalo Pay"],
    areaServed: {
      "@type": "Country",
      name: "Vietnam",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "0896686008",
      contactType: "Customer Service",
      availableLanguage: "Vietnamese",
      contactOption: "TollFree",
    },
  };

  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
