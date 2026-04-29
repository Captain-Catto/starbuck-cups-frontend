import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getApiUrl } from "@/lib/api-config";
import { convertDriveUrl } from "@/utils/googleDriveHelper";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Cart } from "@/components/ui/Cart";
import ProductClient from "@/components/ProductClient";
import type { Product } from "@/types";

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

  const t = await getTranslations({ locale, namespace: "common" });
  const tProduct = await getTranslations({ locale, namespace: "productDetail" });

  const firstImageUrl = product.productImages
    ?.slice()
    .sort((a, b) => a.order - b.order)[0]?.url;

  return (
    <>
      {/* Preload the main gallery image so browser starts fetching before JS hydration (LCP) */}
      {firstImageUrl && (
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore — imagesrcset/imagesizes are valid HTML attrs not yet in React types
        <link
          rel="preload"
          as="image"
          imagesrcset={buildPreloadSrcSet(firstImageUrl)}
          imagesizes="(max-width: 1024px) 100vw, calc(50vw - 2rem)"
        />
      )}
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
    </>
  );
}
