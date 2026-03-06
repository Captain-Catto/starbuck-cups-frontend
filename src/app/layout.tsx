import type { Metadata } from "next";
import React from "react";
import "./globals.css";
import StoreProvider from "@/components/StoreProvider";
import ClientLayout from "@/components/layout/ClientLayout";
import { generateSEO, generateOrganizationStructuredData } from "@/lib/seo";

export const metadata: Metadata = {
  ...generateSEO({
    title: "H's shoucangpu - Collectible Gift Shop",
    description:
      "Ly ST@RBUCKS CHÍNH HÃNG các nước. 95% MẪU TRÊN PAGE là HÀNG SẴN SHIP HOẢ TỐC📍HCM📍 Quà tặng cao cấp Luxury. Có dịch vụ gói quà. FB: Hasron Leung. Dịch vụ ship hoả tốc 24/7",
    keywords:
      "starbucks, ly starbucks, cups, tumbler, ly giữ nhiệt, starbucks vietnam, ly starbucks chính hãng, ly starbuck chính hãng, ly starbucks auth, starbuck chính hãng,  starbucks chính hãng, mua ly starbuck chính hãng, bình starbucks chính hãng, bình giữ nhiệt starbucks, ly giữ nhiệt starbucks, ly sứ starbucks, hasron.com, hasron, hasron starbucks chính hãng, hasron starbucks, hasron ly starbucks chính hãng, h's, h's shoucangpu, hasron leung",
    openGraph: {
      title: "H's shoucangpu - Collectible Gift Shop",
      description:
        "Ly ST@RBUCKS CHÍNH HÃNG các nước. 95% MẪU TRÊN PAGE là HÀNG SẴN SHIP HOẢ TỐC📍HCM📍 Quà tặng cao cấp Luxury. Có dịch vụ gói quà",
      image: "/images/placeholder.webp",
      url: "/",
      type: "website",
    },
  }),
  twitter: {
    card: "summary",
    title: "H's shoucangpu - Tiệm sưu tầm của H",
    description:
      "Ly ST@RBUCKS CHÍNH HÃNG các nước. 95% MẪU TRÊN PAGE là HÀNG SẴN SHIP HOẢ TỐC📍HCM📍 Quà tặng cao cấp Luxury",
    images: ["/images/placeholder.webp"],
  },
  icons: {
    icon: [
      { url: "/logo.png", sizes: "any", type: "image/png" },
      { url: "/logo.png", sizes: "16x16", type: "image/png" },
      { url: "/logo.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/logo.png",
    apple: [{ url: "/logo.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationData = generateOrganizationStructuredData();
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const hasGoogleAnalytics =
    !!gaMeasurementId && gaMeasurementId !== "G-XXXXXXXXXX";

  return (
    <html lang="vi">
      <head>
        {/* Preload critical fonts để tối ưu LCP */}
        <link
          rel="preload"
          href="/font/JetBrainsMono-Bold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/font/JetBrainsMono-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />

        {/* Optimize viewport for mobile performance */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#000000" />

        {/* Performance hints */}
        <meta httpEquiv="x-dns-prefetch-control" content="on" />

        {/* Google Analytics 4 */}
        {hasGoogleAnalytics && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaMeasurementId}', {
                    page_title: document.title,
                    page_location: window.location.href,
                    anonymize_ip: true,
                    allow_google_signals: false,
                    cookie_flags: 'SameSite=None;Secure'
                  });
                `,
              }}
            />
          </>
        )}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationData),
          }}
        />
      </head>
      <body>
        <StoreProvider>
          <ClientLayout>{children}</ClientLayout>
        </StoreProvider>
      </body>
    </html>
  );
}
