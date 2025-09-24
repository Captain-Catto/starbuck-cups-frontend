import { Metadata } from "next";
import { generateSEO } from "@/lib/seo";
import HomePageComponent from "@/components/pages/HomePage";
import { Category } from "@/types";

interface HeroImageData {
  id: string;
  title: string;
  imageUrl: string;
  altText: string;
  order: number;
  isActive: boolean;
}

interface HomePageProps {
  categories: Category[];
  heroImages: HeroImageData[];
}

export const metadata: Metadata = generateSEO({
  title: "Trang chủ",
  description:
    "Khám phá bộ sưu tập ly Starbucks đa dạng với nhiều màu sắc và dung tích. Tư vấn miễn phí qua Messenger.",
  openGraph: {
    title: "Starbucks Cups Shop - Ly Starbucks chính thức",
    description:
      "Khám phá bộ sưu tập ly Starbucks đa dạng với nhiều màu sắc và dung tích",
    image: "/images/og-home.jpg",
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
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
      }/categories/public/`,
      {
        cache: "no-store", // Ensure fresh data
      }
    );
    console.log("Fetched categories response:", categoriesResponse);

    let categories: Category[] = [];

    if (categoriesResponse.ok) {
      const categoriesData = await categoriesResponse.json();
      console.log("Fetched categories data:", categoriesData);
      if (categoriesData.success && categoriesData.data?.items) {
        categories = categoriesData.data.items;
      }
    }

    // Fetch hero images from API
    let heroImages: HeroImageData[] = [];
    try {
      const heroImagesResponse = await fetch(
        `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/api/hero-images/public`,
        {
          cache: "no-store", // Ensure fresh data
        }
      );
      console.log("Fetched hero images response:", heroImagesResponse);

      if (heroImagesResponse.ok) {
        const heroImagesData = await heroImagesResponse.json();
        console.log("✅ Fetched hero images data:", heroImagesData);
        console.log("✅ Hero images count:", heroImagesData.data?.length || 0);
        if (heroImagesData.success && heroImagesData.data) {
          heroImages = heroImagesData.data;
        }
      } else {
        console.error(
          "❌ Hero images API failed:",
          heroImagesResponse.status,
          heroImagesResponse.statusText
        );
      }
    } catch (error) {
      console.error("Error fetching hero images:", error);
    }

    return {
      categories,
      heroImages,
    };
  } catch (error) {
    console.error("Error fetching home page data:", error);
    return {
      categories: [],
      heroImages: [],
    };
  }
}

export default async function HomePage() {
  const homePageData = await getHomePageData();

  return (
    <HomePageComponent
      categories={homePageData.categories || []}
      heroImages={homePageData.heroImages || []}
    />
  );
}
