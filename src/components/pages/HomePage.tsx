"use client";

import React, { lazy, Suspense } from "react";
import { useTranslations } from "next-intl";
import { Category } from "@/types";
import { ProductGridSkeleton } from "@/components/ui/LoadingSkeleton";
import { StructuredData } from "@/components/seo/StructuredData";

// Hero Section không lazy load để tối ưu LCP
import HeroSection from "@/components/home/HeroSection";

// Lazy load các components khác để giảm bundle size và TBT
const HomeProductGrid = lazy(() =>
  import("@/components/HomeProductGrid").then((module) => ({
    default: module.default,
  }))
);

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
  heroImages?: HeroImageData[];
  promotionalBanner?: PromotionalBannerData | null;
  loading?: boolean;
}

const HomePage: React.FC<HomePageProps> = ({
  heroImages = [],
  promotionalBanner = null,
  loading = false,
}) => {
  const t = useTranslations("homePage");

  return (
    <div className="min-h-screen bg-black text-white pt-12">
      {/* SEO Structured Data */}
      <StructuredData />

      {/* Hero Section */}
      <HeroSection
        loading={loading}
        heroImages={heroImages}
        promotionalBanner={promotionalBanner}
      />

      {/* Categories Section */}
      <section className="py-4 md:py-8">
        <div className="container mx-auto px-2 md:px-6">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 px-2">{t("latestProducts")}</h2>

          {/* Products Grid */}
          <Suspense fallback={<ProductGridSkeleton />}>
            <HomeProductGrid selectedCategory={null} />
          </Suspense>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
