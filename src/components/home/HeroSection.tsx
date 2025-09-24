"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { ArrowRight } from "lucide-react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface HeroImageData {
  id: string;
  title: string;
  imageUrl: string;
  altText: string;
  order: number;
  isActive: boolean;
}

interface HeroSectionProps {
  loading?: boolean;
  heroImages?: HeroImageData[];
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
}) => {
  console.log("🎯 HeroSection props:", {
    loading,
    heroImagesCount: heroImages.length,
    heroImages,
  });

  if (loading) {
    return <HeroSectionSkeleton />;
  }

  // Fallback to default images if no dynamic images available
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

  return (
    <section className="py-4 md:py-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Left text card */}
          <div className="bg-zinc-900 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-12 flex flex-col justify-center order-2 lg:order-1">
            <h1 className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 md:mb-6 leading-tight">
              Starbucks
              <br />
              <span className="text-green-400">Collections</span>
            </h1>
            <p className="text-zinc-300 text-sm md:text-lg mb-6 md:mb-8 leading-relaxed">
              Khám phá bộ sưu tập ly Starbucks đa dạng với nhiều màu sắc và dung
              tích. Tư vấn miễn phí qua Messenger.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-3 bg-white text-black px-6 md:px-8 py-3 md:py-4 rounded-full font-medium hover:bg-zinc-100 transition-colors w-fit text-sm md:text-base"
            >
              Xem tất cả sản phẩm
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </Link>
          </div>

          {/* Right image carousel */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="h-48 md:h-64 lg:h-full rounded-2xl md:rounded-3xl overflow-hidden bg-zinc-900">
              <Swiper
                modules={[Autoplay, Pagination]}
                autoplay={{
                  delay: 4000,
                  disableOnInteraction: false,
                }}
                pagination={{
                  clickable: true,
                  bulletClass: "swiper-pagination-bullet !bg-white/50",
                  bulletActiveClass:
                    "swiper-pagination-bullet-active !bg-white",
                }}
                className="h-full"
              >
                {imagesToShow.map((image, index) => (
                  <SwiperSlide key={image.id}>
                    <div className="relative h-full w-full">
                      <Image
                        src={image.imageUrl}
                        alt={image.altText}
                        fill
                        className="object-contain"
                        priority={index === 0}
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
