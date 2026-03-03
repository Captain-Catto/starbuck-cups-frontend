"use client";

import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight } from "lucide-react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

// Dynamic import toàn bộ Swiper bundle
const SwiperCarousel = dynamic(() => import("./SwiperCarousel"), {
  ssr: false,
  loading: () => (
    <div className="h-full bg-gray-200 rounded-2xl md:rounded-3xl animate-pulse" />
  ),
});

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

interface HeroSectionProps {
  loading?: boolean;
  heroImages?: HeroImageData[];
  promotionalBanner?: PromotionalBannerData | null;
}

const HeroSectionSkeleton = () => (
  <SkeletonTheme baseColor="#18181b" highlightColor="#27272a">
    <section className="py-4 md:py-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Left text card skeleton */}
          <div className="bg-zinc-900 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-12 flex flex-col justify-center order-2 lg:order-1">
            <div className="mb-4 md:mb-6">
              <Skeleton height={32} width="80%" className="mb-2 md:mb-2" />
              <Skeleton height={32} width="60%" className="md:h-14" />
            </div>
            <div className="mb-6 md:mb-8">
              <Skeleton height={16} className="mb-2 md:h-5 md:mb-2" />
              <Skeleton height={16} className="mb-2 md:h-5 md:mb-2" />
              <Skeleton height={16} width="70%" className="md:h-5" />
            </div>
            <Skeleton
              height={40}
              width={180}
              className="rounded-full md:h-12 md:w-48"
            />
          </div>

          {/* Right image carousel skeleton */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="h-48 md:h-64 lg:h-full rounded-2xl md:rounded-3xl overflow-hidden bg-zinc-900">
              <Skeleton height="100%" />
            </div>
          </div>
        </div>
      </div>
    </section>
  </SkeletonTheme>
);

const HeroSection: React.FC<HeroSectionProps> = ({
  loading = false,
  heroImages = [],
  promotionalBanner = null,
}) => {
  // Load Swiper immediately to enable priority loading for first hero image (LCP optimization)
  const showSwiper = true;

  if (loading) {
    return <HeroSectionSkeleton />;
  }

  // Default hero images nếu không có data từ API
  const defaultImages = [
    {
      id: "default-1",
      title: "Starbucks Collection Card 2",
      imageUrl:
        "https://starbucks-shop.s3.ap-southeast-1.amazonaws.com/uploads/HASRON-+CARD-2.webp",
      altText: "Starbucks Collection Card 2",
      order: 0,
      isActive: true,
    },
    {
      id: "default-2",
      title: "Starbucks Collection Card 1",
      imageUrl:
        "https://starbucks-shop.s3.ap-southeast-1.amazonaws.com/uploads/HASRON-+CARD-1.webp",
      altText: "Starbucks Collection Card 1",
      order: 1,
      isActive: true,
    },
  ];

  const imagesToShow = heroImages.length > 0 ? heroImages : defaultImages;
  const activeImages = imagesToShow
    .filter((img) => img.isActive)
    .sort((a, b) => a.order - b.order);

  // Default banner data
  const defaultBanner = {
    title: "Bộ Sưu Tập",
    highlightText: "Ly Starbucks",
    highlightColor: "#10b981",
    description:
      "Khám phá bộ sưu tập ly Starbucks đa dạng với nhiều màu sắc và dung tích. Tư vấn miễn phí qua Messenger.",
    buttonText: "Khám Phá Ngay",
    buttonLink: "/products",
  };

  const bannerData = promotionalBanner || defaultBanner;

  return (
    <section className="py-4 md:py-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Left text card - Dynamic from promotional banner */}
          <div className="bg-zinc-900 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-12 flex flex-col justify-center order-2 lg:order-1">
            <div className="mb-4 md:mb-6">
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                {bannerData.title}
                {bannerData.highlightText && (
                  <>
                    <br />
                    <span
                      className="font-bold"
                      style={{ color: bannerData.highlightColor || "#10b981" }}
                    >
                      {bannerData.highlightText}
                    </span>
                  </>
                )}
              </h1>
            </div>
            <div
              className="text-gray-300 text-sm md:text-base lg:text-lg mb-6 md:mb-8 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: bannerData.description }}
            />
            <Link
              href={bannerData.buttonLink}
              className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-gray-200 transition-all duration-300 w-fit text-sm md:text-base"
            >
              {bannerData.buttonText}
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </Link>
          </div>

          {/* Hero carousel - lazy loaded sau LCP */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="h-64 md:h-96 lg:h-full rounded-2xl md:rounded-3xl overflow-hidden bg-zinc-900">
              {!showSwiper ? (
                // Fast loading fallback - skeleton placeholder
                <div className="relative h-full bg-gray-200 rounded-2xl md:rounded-3xl animate-pulse" />
              ) : (
                // Swiper carousel sau khi LCP đã tối ưu
                <SwiperCarousel images={activeImages} />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
