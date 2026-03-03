"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import OptimizedImage from "@/components/OptimizedImage";

// Import Swiper CSS
import "swiper/css";
import "swiper/css/pagination";

interface HeroImageData {
  id: string;
  title: string;
  imageUrl: string;
  altText: string;
  order: number;
  isActive: boolean;
}

interface SwiperCarouselProps {
  images: HeroImageData[];
}

export default function SwiperCarousel({ images }: SwiperCarouselProps) {
  return (
    <Swiper
      modules={[Autoplay, Pagination]}
      autoplay={{
        delay: 4000,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
        bulletClass: "swiper-pagination-bullet !bg-white/50",
        bulletActiveClass: "swiper-pagination-bullet-active !bg-white",
      }}
      className="h-full"
    >
      {images.map((image, index) => (
        <SwiperSlide key={image.id}>
          <div className="relative h-full w-full">
            <OptimizedImage
              src={image.imageUrl}
              alt={image.altText}
              fill
              width={1600}
              className="object-contain"
              priority={index === 0}
              loading={index === 0 ? "eager" : "lazy"}
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, (max-width: 1024px) 60vw, 50vw"
              quality={75}
              style={{ objectFit: "contain" }}
            />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
