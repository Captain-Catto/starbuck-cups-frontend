import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { generateSEO } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  return generateSEO({
    title: t("productsPageTitle"),
    description: t("productsPageDescription"),
    keywords: t("siteKeywords"),
    locale,
    openGraph: {
      title: `${t("productsPageTitle")} | ${t("siteTitle")}`,
      description: t("productsPageDescription"),
      image: "/logo.png",
      url: "/products",
      type: "website",
    },
  });
}

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  return <>{children}</>;
}
