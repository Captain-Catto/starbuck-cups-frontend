import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getApiUrl } from "@/lib/api-config";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Cart } from "@/components/ui/Cart";
import ProductClient from "@/components/ProductClient";
import { generateSEO, siteConfig } from "@/lib/seo";
import type { Product } from "@/types";

async function getProduct(slug: string, locale: string): Promise<Product | null> {
  try {
    const response = await fetch(
      `${getApiUrl(`products/public/${slug}`)}?locale=${encodeURIComponent(locale)}`,
      { next: { revalidate: 3600, tags: ["products"] } }
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data.data || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const product = await getProduct(slug, locale);

  if (!product) {
    return { robots: { index: false, follow: false } };
  }

  const cleanDescription = product.description
    ? product.description
        .replace(/<[^>]*>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&nbsp;/g, " ")
        .trim()
        .slice(0, 160)
    : undefined;

  const firstImage = product.productImages?.[0]?.url;
  const ogImage = firstImage?.startsWith("http") ? firstImage : firstImage ? `${siteConfig.url}${firstImage}` : "/logo.png";

  return generateSEO({
    title: product.name,
    description: cleanDescription,
    locale,
    openGraph: {
      title: product.name,
      description: cleanDescription ?? "",
      image: ogImage,
      url: `/products/${slug}`,
      type: "website",
    },
  });
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  setRequestLocale(locale);

  const product = await getProduct(slug, locale);
  if (!product) notFound();

  const t = await getTranslations({ locale, namespace: "common" });
  const tProduct = await getTranslations({ locale, namespace: "productDetail" });

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="pt-20 lg:pt-14">
        <div className="container mx-auto px-4 py-4">
          <Breadcrumb
            items={[
              { label: t("home"), href: "/" },
              { label: t("products"), href: "/products" },
              { label: product.name },
            ]}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8">
        <ProductClient product={product} relatedTitle={tProduct("youMayLike")} />
      </div>

      <Cart />
    </div>
  );
}
