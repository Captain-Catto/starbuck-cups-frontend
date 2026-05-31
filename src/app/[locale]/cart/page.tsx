import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { generateSEO } from "@/lib/seo";
import CartPageClient from "@/components/pages/CartPageClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  return generateSEO({
    title: t("cartPageTitle") || "Giỏ hàng | Starbucks",
    description: t("cartPageDescription") || "Giỏ hàng tư vấn ly cốc Starbucks chính hãng của bạn",
    locale,
  });
}

export default function CartPage() {
  return <CartPageClient />;
}
