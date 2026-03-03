import Script from "next/script";

export function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "H's shoucangpu - Collectible Gift Shop",
    description:
      "Khám phá bộ sưu tập ly St@rbucks đa dạng với nhiều màu sắc và dung tích. Tư vấn miễn phí qua Zalo 0896686008.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://starbucks-cups.com",
    logo: {
      "@type": "ImageObject",
      url: `${
        process.env.NEXT_PUBLIC_SITE_URL || "https://starbucks-cups.com"
      }/logo.png`,
      width: "200",
      height: "200",
    },
    image: `${
      process.env.NEXT_PUBLIC_SITE_URL || "https://starbucks-cups.com"
    }/logo.png`,
    sameAs: [
      "https://www.facebook.com/starbuckscupsshop",
      "https://www.instagram.com/starbuckscupsshop",
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Ly St@rbucks",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Product",
            name: "Ly St@rbucks Tumbler",
            category: "Drinkware",
            keywords:
              "starbucks, ly starbucks, cups, tumbler, ly giữ nhiệt, starbucks vietnam, ly starbucks chính hãng, ly starbuck chính hãng, ly starbucks auth, starbuck chính hãng, starbucks chính hãng, mua ly starbuck chính hãng, bình starbucks chính hãng, bình giữ nhiệt starbucks, ly giữ nhiệt starbucks, ly sứ starbucks",
          },
        },
      ],
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "150",
      bestRating: "5",
      worstRating: "1",
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
