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
    title: `${t("siteTitle")} - ${t("productsPageTitle")}`,
    description: t("siteDescription"),
    keywords: t("siteKeywords"),
    locale,
    openGraph: {
      title: `${t("siteTitle")} - ${t("productsPageTitle")}`,
      description: t("siteDescription"),
      image: "/images/placeholder.webp",
      url: "/products",
      type: "website",
    },
  });
}

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
