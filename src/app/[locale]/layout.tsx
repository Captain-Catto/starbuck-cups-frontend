import type { Metadata } from "next";
import React from "react";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { JetBrains_Mono } from "next/font/google";
import { routing } from "@/i18n/routing";
import StoreProvider from "@/components/StoreProvider";
import ClientLayout from "@/components/layout/ClientLayout";
import { generateSEO, generateOrganizationStructuredData } from "@/lib/seo";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  const ogLocaleMap: Record<string, string> = {
    vi: "vi_VN",
    en: "en_US",
    zh: "zh_CN",
  };

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
  const organizationData = generateOrganizationStructuredData();
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const hasGoogleAnalytics =
    !!gaMeasurementId && gaMeasurementId !== "G-XXXXXXXXXX";

  return (
    <html lang={locale} className={`${jetbrainsMono.variable}`}>
      <head>

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#000000" />
        <meta httpEquiv="x-dns-prefetch-control" content="on" />

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
      <body className="antialiased font-sans">
        <NextIntlClientProvider messages={messages}>
          <StoreProvider>
            <ClientLayout>{children}</ClientLayout>
          </StoreProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
