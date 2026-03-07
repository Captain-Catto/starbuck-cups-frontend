import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { generateSEO } from "@/lib/seo";

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const t = await getTranslations({ locale, namespace: "productDetail" });

  // Mock product data - in real app, fetch from API
  const productName = slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  return generateSEO({
    title: `${productName} - H's shoucangpu`,
    description: t("metaDescription", { name: productName }),
    keywords: `${productName}, starbucks, ly starbucks, cups, tumbler`,
    locale,
    openGraph: {
      title: `${productName} - H's shoucangpu`,
      description: t("metaDescriptionShort", { name: productName }),
      image: "/images/placeholder.webp",
      url: `/products/${slug}`,
      type: "website",
    },
  });
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
