import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  generateSEO,
  generateProductStructuredData,
  generateBreadcrumbStructuredData,
} from "@/lib/seo";
import { getApiUrl } from "@/lib/api-config";
import { Product } from "@/types";

interface Props {
  params: Promise<{ slug: string; locale: string }>;
  children: React.ReactNode;
}

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const response = await fetch(getApiUrl(`products/public/${slug}`), {
      next: { revalidate: 300 },
    });
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
  const t = await getTranslations({ locale, namespace: "productDetail" });
  const product = await getProduct(slug);

  const productName =
    product?.name ||
    slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  const description = product?.description
    ? product.description.replace(/<[^>]*>/g, "").slice(0, 160)
    : t("metaDescription", { name: productName });

  const ogImage =
    product?.productImages?.[0]?.url || "/logo.png";

  const categories =
    product?.productCategories
      ?.map((pc) => pc.category.name)
      .join(", ") || "";

  const keywords = [
    productName,
    categories,
    "starbucks",
    "ly starbucks",
    "cốc starbucks",
    "starbucks cups",
  ]
    .filter(Boolean)
    .join(", ");

  return generateSEO({
    title: `${productName} - H's shoucangpu`,
    description,
    keywords,
    locale,
    openGraph: {
      title: `${productName} - H's shoucangpu`,
      description,
      image: ogImage,
      url: `/products/${slug}`,
      type: "website",
    },
  });
}

export default async function ProductLayout({ children, params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);

  const productJsonLd = product
    ? generateProductStructuredData(product)
    : null;

  const breadcrumbJsonLd = generateBreadcrumbStructuredData([
    { name: "Trang chủ", url: "/" },
    { name: "Sản phẩm", url: "/products" },
    { name: product?.name || slug, url: `/products/${slug}` },
  ]);

  return (
    <>
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}
