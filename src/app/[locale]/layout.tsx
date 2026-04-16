import type { Metadata, Viewport } from "next";
import React from "react";
import { notFound } from "next/navigation";
import NextTopLoader from "nextjs-toploader";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { JetBrains_Mono } from "next/font/google";
import { routing } from "@/i18n/routing";
import StoreProvider from "@/components/StoreProvider";
import ClientLayout from "@/components/layout/ClientLayout";
import { generateSEO, generateOrganizationStructuredData, siteConfig } from "@/lib/seo";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://hasron.vn";

  return {
    ...generateSEO({
      title: t("siteTitle"),
      description: t("siteDescription"),
      keywords: t("siteKeywords"),
      locale,
      openGraph: {
        title: t("siteTitle"),
        description: t("siteDescription"),
        image: "/logo.png",
        url: "/",
        type: "website",
      },
    }),
    twitter: {
      card: "summary_large_image",
      title: t("twitterTitle"),
      description: t("twitterDescription"),
      images: ["/logo.png"],
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
    alternates: {
      canonical: locale === "vi" ? baseUrl : `${baseUrl}/${locale}`,
      languages: {
        vi: baseUrl,
        en: `${baseUrl}/en`,
        zh: `${baseUrl}/zh`,
        "x-default": baseUrl,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: "seo" });
  const organizationData = generateOrganizationStructuredData();

  // WebSite schema — helps Google associate the official logo with this site
  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
  };

  // Store structured data — server-side so Googlebot sees it immediately
  const storeData = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: siteConfig.name,
    description: t("siteDescription"),
    url: siteConfig.url,
    logo: {
      "@type": "ImageObject",
      url: `${siteConfig.url}/logo.png`,
      width: "479",
      height: "530",
    },
    image: `${siteConfig.url}/logo.png`,
    telephone: "0896686008",
    sameAs: [
      "https://www.facebook.com/profile.php?id=61560973846348",
      "https://www.instagram.com/hasron_leung",
    ],
    priceRange: "₫₫",
    currenciesAccepted: "VND",
    paymentAccepted: ["Cash", "Bank Transfer", "COD", "Zalo Pay"],
    areaServed: { "@type": "Country", name: "Vietnam" },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "0896686008",
      contactType: "Customer Service",
      availableLanguage: ["Vietnamese", "English", "Chinese"],
    },
  };

  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const hasGoogleAnalytics =
    !!gaMeasurementId && gaMeasurementId !== "G-XXXXXXXXXX";

  return (
    <html lang={locale} className={`${jetbrainsMono.variable}`}>
      <head>

        <meta name="theme-color" content="#000000" />
        <meta httpEquiv="x-dns-prefetch-control" content="on" />
        <link rel="preconnect" href="https://lh3.googleusercontent.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://lh3.googleusercontent.com" />

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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(storeData) }}
        />
      </head>
      <body className="antialiased font-sans">
        <NextTopLoader color="#ffffff" height={2} showSpinner={false} />
        <NextIntlClientProvider messages={messages}>
          <StoreProvider>
            <ClientLayout>{children}</ClientLayout>
          </StoreProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
