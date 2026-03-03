import { Metadata } from "next";
import { generateSEO } from "@/lib/seo";
import HomePageComponent from "@/components/pages/HomePage";
import { Category } from "@/types";

// Enable static generation with revalidation for better performance
export const revalidate = 300; // 5 minutes
export const dynamic = "force-static";

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
}

export const metadata: Metadata = generateSEO({
  title: "Trang chủ",
  description:
    "Ly ST@RBUCKS CHÍNH HÃNG các nước. 95% MẪU TRÊN PAGE là HÀNG SẴN SHIP HOẢ TỐC📍HCM📍 Quà tặng cao cấp Luxury. Có dịch vụ gói quà. FB: Hasron Leung. Dịch vụ ship hoả tốc 24/7",
  keywords:
    "ly starbucks, tumbler starbucks, cốc starbucks, ly giữ nhiệt, starbucks vietnam, mua ly starbucks, ly gai starbucks, shoucangpu, hasron.com, hasron, hasron starbucks chính hãng, hasron starbucks, hasron ly starbucks chính hãng, h's, h's shoucangpu, hasron leung",
  openGraph: {
    title: "H’s shoucangpu - Trang chủ",
    description:
      "Ly ST@RBUCKS CHÍNH HÃNG các nước. 95% MẪU TRÊN PAGE là HÀNG SẴN SHIP HOẢ TỐC📍HCM📍 Quà tặng cao cấp Luxury. Có dịch vụ gói quà. FB: Hasron Leung",
    image: "/images/placeholder.webp",
    url: "/",
    type: "website",
  },
});

// Server-side data fetching
async function getHomePageData(): Promise<HomePageProps> {
  try {
    // Fetch categories from API
    const categoriesResponse = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL ||
        "https://api-starbuck-cups.lequangtridat.com/api"
      }/categories/public/`,
      {
        next: { revalidate: 300 }, // Revalidate every 5 minutes
        cache: "force-cache",
      }
    );

    let categories: Category[] = [];

    if (categoriesResponse.ok) {
      const categoriesData = await categoriesResponse.json();

      if (categoriesData.success && categoriesData.data?.items) {
        categories = categoriesData.data.items;
      }
    }

    // Fetch hero images from API
    let heroImages: HeroImageData[] = [];
    try {
      const heroImagesUrl = `${
        process.env.NEXT_PUBLIC_API_URL ||
        "https://api-starbuck-cups.lequangtridat.com/api"
      }/hero-images/public`;

      const heroImagesResponse = await fetch(heroImagesUrl, {
        next: { revalidate: 300 }, // Revalidate every 5 minutes
        cache: "force-cache",
      });

      if (heroImagesResponse.ok) {
        const heroImagesData = await heroImagesResponse.json();

        if (heroImagesData.success && heroImagesData.data) {
          heroImages = heroImagesData.data;
        }
      } else {
      }
    } catch {}

    // Fetch promotional banner from API
    let promotionalBanner: PromotionalBannerData | null = null;
    try {
      const bannerUrl = `${
        process.env.NEXT_PUBLIC_API_URL ||
        "https://api-starbuck-cups.lequangtridat.com/api"
      }/promotional-banners`;

      const bannerResponse = await fetch(bannerUrl, {
        next: { revalidate: 60 }, // Revalidate every 1 minute for promotional content
        cache: "force-cache",
      });

      if (bannerResponse.ok) {
        const bannerData = await bannerResponse.json();

        if (bannerData.success && bannerData.data) {
          promotionalBanner = bannerData.data;
        }
      } else {
      }
    } catch {}

    return {
      categories,
      heroImages,
      promotionalBanner,
    };
  } catch {
    return {
      categories: [],
      heroImages: [],
      promotionalBanner: null,
    };
  }
}

export default async function HomePage() {
  const homePageData = await getHomePageData();

  return (
    <HomePageComponent
      categories={homePageData.categories || []}
      heroImages={homePageData.heroImages || []}
      promotionalBanner={homePageData.promotionalBanner}
    />
  );
}
