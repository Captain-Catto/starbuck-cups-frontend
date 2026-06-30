import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { generateSEO } from "@/lib/seo";
import HomePageComponent from "@/components/pages/HomePage";
import { Category, Product } from "@/types";
import { getApiUrl } from "@/lib/server-api";
import { convertDriveUrl } from "@/utils/googleDriveHelper";

export const revalidate = 3600;
export const dynamic = "force-static";

const HERO_PRELOAD_WIDTHS = [320, 640, 828, 960, 1200];

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
  categories: Category[];
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

async function getHomePageData(locale: string): Promise<HomePageProps> {
  try {
    const categoriesResponse = await fetch(getApiUrl("categories/public/"), {
      next: { revalidate: 300 },
      cache: "force-cache",
    });

    let categories: Category[] = [];

    if (categoriesResponse.ok) {
      const categoriesData = await categoriesResponse.json();

      if (categoriesData.success && categoriesData.data?.items) {
        categories = categoriesData.data.items;
      }
    }

    let heroImages: HeroImageData[] = [];
    try {
      const heroImagesUrl = getApiUrl("hero-images/public");

      const heroImagesResponse = await fetch(heroImagesUrl, {
        next: { revalidate: 300 },
        cache: "force-cache",
      });

      if (heroImagesResponse.ok) {
        const heroImagesData = await heroImagesResponse.json();

        if (heroImagesData.success && heroImagesData.data) {
          heroImages = heroImagesData.data;
        }
      }
    } catch {}

    let promotionalBanner: PromotionalBannerData | null = null;
    try {
      const bannerUrl = getApiUrl("promotional-banners");

      const bannerResponse = await fetch(bannerUrl, {
        next: { revalidate: 60 },
        cache: "force-cache",
      });

      if (bannerResponse.ok) {
        const bannerData = await bannerResponse.json();

        if (bannerData.success && bannerData.data) {
          promotionalBanner = bannerData.data;
        }
      }
    } catch {}

    let products: Product[] = [];
    try {
      const productsResponse = await fetch(
        getApiUrl(
          `products?sortBy=createdAt&sortOrder=desc&limit=12&locale=${locale}`
        ),
        {
          next: { revalidate: 300 },
          cache: "force-cache",
        }
      );

      if (productsResponse.ok) {
        const productsData = await productsResponse.json();

        if (productsData.success && productsData.data?.items) {
          products = productsData.data.items;
        }
      }
    } catch {}

    return {
      categories,
      heroImages,
      promotionalBanner,
      products,
    };
  } catch {
    return {
      categories: [],
      heroImages: [],
      promotionalBanner: null,
      products: [],
    };
  }
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
