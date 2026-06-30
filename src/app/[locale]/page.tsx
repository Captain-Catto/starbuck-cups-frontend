import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { generateSEO } from "@/lib/seo";
import HomePageComponent from "@/components/pages/HomePage";
import { Product } from "@/types";
import { getApiUrl } from "@/lib/server-api";
import { convertDriveUrl } from "@/utils/googleDriveHelper";

export const revalidate = 3600;
export const dynamic = "force-static";

const HERO_PRELOAD_WIDTHS = [384, 512, 750, 828, 960, 1200, 1600, 1920];

function buildHeroPreloadSrcSet(rawUrl: string): string {
  const converted = convertDriveUrl(rawUrl);
  return HERO_PRELOAD_WIDTHS.map(
    (w) => `/api/image?url=${encodeURIComponent(converted)}&w=${w}&q=75&f=webp ${w}w`
  ).join(", ");
}

interface HeroImageData {
  id: string;
  title: string;
  imageUrl: string;
  altText: string;
  order: number;
  isActive: boolean;
}

interface PromotionalBannerData {
  id: string;
  title: string;
  highlightText: string | null;
  highlightColor: string | null;
  description: string;
  buttonText: string;
  buttonLink: string;
}

interface HomePageProps {
  heroImages: HeroImageData[];
  promotionalBanner: PromotionalBannerData | null;
  products: Product[];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  return generateSEO({
    title: t("homeTitle"),
    description: t("homeDescription"),
    keywords: t("siteKeywords"),
    locale,
    openGraph: {
      title: t("homeOgTitle"),
      description: t("homeOgDescription"),
      image: "/images/placeholder.webp",
      url: "/",
      type: "website",
    },
  });
}

async function fetchHeroImages(): Promise<HeroImageData[]> {
  try {
    const res = await fetch(getApiUrl("hero-images/public"), {
      next: { revalidate: 300 },
      cache: "force-cache",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.success && data.data ? data.data : [];
  } catch {
    return [];
  }
}

async function fetchPromotionalBanner(): Promise<PromotionalBannerData | null> {
  try {
    const res = await fetch(getApiUrl("promotional-banners"), {
      next: { revalidate: 300 },
      cache: "force-cache",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.success && data.data ? data.data : null;
  } catch {
    return null;
  }
}

async function fetchProducts(locale: string): Promise<Product[]> {
  try {
    const res = await fetch(
      getApiUrl(`products/public?sortBy=createdAt&sortOrder=desc&limit=12&locale=${locale}`),
      { next: { revalidate: 300 }, cache: "force-cache" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.success && data.data?.items ? data.data.items : [];
  } catch {
    return [];
  }
}

async function getHomePageData(locale: string): Promise<HomePageProps> {
  const [heroImages, promotionalBanner, products] = await Promise.all([
    fetchHeroImages(),
    fetchPromotionalBanner(),
    fetchProducts(locale),
  ]);
  return { heroImages, promotionalBanner, products };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const homePageData = await getHomePageData(locale);

  const firstHeroImage = homePageData.heroImages
    .filter((img) => img.isActive)
    .sort((a, b) => a.order - b.order)[0];

  return (
    <>
      {firstHeroImage && (
        <link
          rel="preload"
          as="image"
          imageSrcSet={buildHeroPreloadSrcSet(firstHeroImage.imageUrl)}
          imageSizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, (max-width: 1024px) 60vw, 50vw"
        />
      )}
      <HomePageComponent
        heroImages={homePageData.heroImages}
        promotionalBanner={homePageData.promotionalBanner}
        products={homePageData.products}
      />
    </>
  );
}
