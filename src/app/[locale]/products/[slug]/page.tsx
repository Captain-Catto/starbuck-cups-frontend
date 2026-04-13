import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getApiUrl } from "@/lib/api-config";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Cart } from "@/components/ui/Cart";
import ProductClient from "@/components/ProductClient";
import { generateSEO, generateProductStructuredData, generateBreadcrumbStructuredData, siteConfig } from "@/lib/seo";
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

  // Priority: dedicated metaDescription from translation > generated from attributes
  const localeKey = locale as "vi" | "en" | "zh";
  const translation = product.translations?.[localeKey];
  const metaTitle = translation?.metaTitle || product.name;

  let description: string;
  if (translation?.metaDescription) {
    description = translation.metaDescription.slice(0, 160);
  } else {
    // Generate clean description from structured product data
    const category = product.productCategories
      ?.map((pc) => pc.category.name)
      .join(", ");
    const color = product.productColors
      ?.map((pc) => pc.color.name)
      .join(", ");

    const parts = [product.name];
    if (category) parts.push(category);
    if (color) parts.push(color);

    const suffix =
      locale === "en"
        ? "Authentic Starbucks. In stock, express delivery nationwide."
        : locale === "zh"
        ? "正品星巴克。现货，全国快速配送。"
        : "Starbucks chính hãng. Sẵn hàng, ship hỏa tốc toàn quốc.";

    description = `${parts.join(" · ")} — ${suffix}`.slice(0, 160);
  }

  const firstImage = product.productImages?.[0]?.url;
  const ogImage = firstImage?.startsWith("http") ? firstImage : firstImage ? `${siteConfig.url}${firstImage}` : "/logo.png";

  return generateSEO({
    title: metaTitle,
    description,
    locale,
    openGraph: {
      title: metaTitle,
      description,
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

  const productStructuredData = generateProductStructuredData(product);
  const breadcrumbStructuredData = generateBreadcrumbStructuredData(
    [
      { name: t("home"), url: "/" },
      { name: t("products"), url: "/products" },
      { name: product.name, url: `/products/${product.slug}` },
    ],
    locale
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
      />
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
