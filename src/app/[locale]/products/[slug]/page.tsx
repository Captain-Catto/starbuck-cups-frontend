import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getApiUrl } from "@/lib/server-api";
import { convertDriveUrl } from "@/utils/googleDriveHelper";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Cart } from "@/components/ui/Cart";
import ProductClient from "@/components/ProductClient";
import { generateSEO } from "@/lib/seo";
import type { Product } from "@/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const [t, product] = await Promise.all([
    getTranslations({ locale, namespace: "productDetail" }),
    getProduct(slug, locale),
  ]);

  const localeKey = locale as "vi" | "en" | "zh";
  const translation = product?.translations?.[localeKey];
  const productName = translation?.metaTitle || product?.name ||
    slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  const categories =
    product?.productCategories
      ?.map((pc) => pc.category.name)
      .join(", ") || "";

  const colors =
    product?.productColors
      ?.map((pc) => pc.color.name)
      .join(", ") || "";

  let description: string;
  if (translation?.metaDescription) {
    description = translation.metaDescription.slice(0, 160);
  } else if (product) {
    const parts = [product.name];
    if (categories) parts.push(categories);
    if (colors) parts.push(colors);
    const suffix =
      locale === "en"
        ? "Authentic Starbucks. In stock, express delivery nationwide."
        : locale === "zh"
        ? "正品星巴克。现货，全国快速配送。"
        : "Starbucks chính hãng. Sẵn hàng, ship hỏa tốc toàn quốc.";
    description = `${parts.join(" · ")} — ${suffix}`.slice(0, 160);
  } else {
    description = t("metaDescription", { name: productName });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hasron.vn";
  const rawOgImage = product?.productImages?.[0]?.url ?? null;

  const capacity = product?.capacity?.name || "";

  const keywords = [
    productName,
    categories,
    colors,
    capacity,
    "starbucks",
    "ly starbucks",
    "cốc starbucks",
    "starbucks cups",
    "ly starbuck chính hãng",
    "mua ly starbucks",
  ]
    .filter(Boolean)
    .join(", ");

  const ogImageUrl = rawOgImage
    ? `${siteUrl}/api/image?url=${encodeURIComponent(convertDriveUrl(rawOgImage))}&w=1200&q=85&f=jpeg`
    : `${siteUrl}/logo.png`;

  const ogTitleSuffix: Record<string, string> = {
    vi: "Mua ly Starbucks chính hãng",
    en: "Authentic Starbucks Cups",
    zh: "正品星巴克杯",
  };

  return generateSEO({
    title: productName,
    description,
    keywords,
    locale,
    openGraph: {
      title: `${productName} - ${ogTitleSuffix[locale] ?? ogTitleSuffix.vi}`,
      description,
      image: ogImageUrl,
      url: `/products/${slug}`,
      type: "website",
    },
  });
}

const PRELOAD_WIDTHS = [320, 456, 640, 828, 960, 1200];

function buildPreloadSrcSet(rawUrl: string): string {
  const converted = convertDriveUrl(rawUrl);
  return PRELOAD_WIDTHS.map(
    (w) => `/api/image?url=${encodeURIComponent(converted)}&w=${w}&q=75&f=webp ${w}w`
  ).join(", ");
}

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const res = await fetch(
      `${getApiUrl("products/public")}?limit=500&locale=vi`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const items: Array<{ slug: string }> = data.data?.items ?? [];
    return items.map(({ slug }) => ({ slug }));
  } catch {
    return [];
  }
}

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

  const [t, tProduct] = await Promise.all([
    getTranslations({ locale, namespace: "common" }),
    getTranslations({ locale, namespace: "productDetail" }),
  ]);

  const firstImageUrl = product.productImages?.reduce(
    (firstImage, image) => (image.order < firstImage.order ? image : firstImage),
    product.productImages[0]
  )?.url;

  return (
    <>
      {/* Preload the main gallery image so browser starts fetching before JS hydration (LCP) */}
      {firstImageUrl && (
        <link
          rel="preload"
          as="image"
          imageSrcSet={buildPreloadSrcSet(firstImageUrl)}
          imageSizes="(max-width: 1024px) 100vw, calc(50vw - 2rem)"
        />
      )}
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="pt-20 lg:pt-14">
        <div className="container mx-auto p-4">
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
    </>
  );
}
