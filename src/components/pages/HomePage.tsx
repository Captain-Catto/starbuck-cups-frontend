"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Product } from "@/types";

import HeroSection from "@/components/home/HeroSection";
import HomeProductGrid from "@/components/HomeProductGrid";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

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
  heroImages?: HeroImageData[];
  promotionalBanner?: PromotionalBannerData | null;
  products?: Product[];
  loading?: boolean;
}

const DEFAULT_HERO_IMAGES: HeroImageData[] = [];
const DEFAULT_PRODUCTS: Product[] = [];

const HomePage: React.FC<HomePageProps> = ({
  heroImages = DEFAULT_HERO_IMAGES,
  promotionalBanner = null,
  products = DEFAULT_PRODUCTS,
  loading = false,
}) => {
  const t = useTranslations("homePage");

  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-12">
      {/* Hero Section */}
      <HeroSection
        loading={loading}
        heroImages={heroImages}
        promotionalBanner={promotionalBanner}
      />

      {/* SEO intro — server-rendered for Google, visually hidden for users */}
      <div className="sr-only">
        <h1>{t("h1Title")}</h1>
        <p>{t("h1Description")}</p>
      </div>

      {/* Categories Section */}
      <section className="py-4 md:py-8">
        <div className="container mx-auto px-6">
          <ScrollReveal>
            <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">{t("latestProducts")}</h2>
          </ScrollReveal>

          {/* Products Grid */}
          <HomeProductGrid products={products} selectedCategory={null} />
        </div>
      </section>
    </div>
  );
};

export default HomePage;
