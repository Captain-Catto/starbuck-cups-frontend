"use client";

import "swiper/css";
import "swiper/css/pagination";
import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import OptimizedImage from "@/components/OptimizedImage";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (images.length === 0) return <div className="size-full bg-zinc-900" />;

  if (!mounted) {
    const fallback = images[0];
    return (
      <div className="relative size-full">
        <OptimizedImage
          src={fallback.imageUrl}
          alt={fallback.altText}
          fill
          width={960}
          className="object-contain"
          priority
          loading="eager"
          fetchPriority="high"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, (max-width: 1024px) 60vw, 50vw"
          quality={75}
          style={{ objectFit: "contain" }}
        />
      </div>
    );
  }

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
          <div className="relative size-full">
            <OptimizedImage
              src={image.imageUrl}
              alt={image.altText}
              fill
              width={960}
              className="object-contain"
              priority={index === 0}
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "auto"}
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
