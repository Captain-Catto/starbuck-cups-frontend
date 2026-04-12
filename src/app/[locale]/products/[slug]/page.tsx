import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getApiUrl } from "@/lib/api-config";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Cart } from "@/components/ui/Cart";
import ProductClient from "@/components/ProductClient";
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
      <div className="pt-18 lg:pt-14">
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
