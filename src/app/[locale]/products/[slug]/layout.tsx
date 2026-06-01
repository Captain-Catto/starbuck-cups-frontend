import { getTranslations } from "next-intl/server";
import {
  generateProductStructuredData,
  generateBreadcrumbStructuredData,
} from "@/lib/seo";
import { getApiUrl } from "@/lib/server-api";
import { Product } from "@/types";

interface Props {
  params: Promise<{ slug: string; locale: string }>;
  children: React.ReactNode;
}

async function getProduct(slug: string, locale?: string): Promise<Product | null> {
  try {
    const url = locale
      ? `${getApiUrl(`products/public/${slug}`)}?locale=${encodeURIComponent(locale)}`
      : getApiUrl(`products/public/${slug}`);
    const response = await fetch(url, { next: { revalidate: 3600, tags: ["products"] } });
    if (!response.ok) return null;
    const data = await response.json();
    return data.data || null;
  } catch {
    return null;
  }
}

export default async function ProductLayout({ children, params }: Props) {
  const { slug, locale } = await params;
  const [product, tCommon] = await Promise.all([
    getProduct(slug, locale),
    getTranslations({ locale, namespace: "common" }),
  ]);

  const productJsonLd = product
    ? generateProductStructuredData(product)
    : null;

  const breadcrumbJsonLd = generateBreadcrumbStructuredData([
    { name: tCommon("home"), url: "/" },
    { name: tCommon("products"), url: "/products" },
    { name: product?.name || slug, url: `/products/${slug}` },
  ], locale);

  return (
    <>
      {productJsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(productJsonLd)}
        </script>
      )}
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbJsonLd)}
      </script>
      {children}
    </>
  );
}
