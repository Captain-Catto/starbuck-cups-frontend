"use client";

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
  const [stylesReady, setStylesReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Load Swiper styles after hydration to avoid blocking initial render CSS.
    Promise.all([import("swiper/css"), import("swiper/css/pagination")])
      .then(() => {
        if (isMounted) {
          setStylesReady(true);
        }
      })
      .catch(() => {
        if (isMounted) {
          // Keep carousel usable even if style loading fails.
          setStylesReady(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!stylesReady || images.length === 0) {
    const fallbackImage = images[0];

    if (!fallbackImage) {
      return <div className="h-full w-full bg-zinc-900" />;
    }

    return (
      <div className="relative h-full w-full">
        <OptimizedImage
          src={fallbackImage.imageUrl}
          alt={fallbackImage.altText}
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
          <div className="relative h-full w-full">
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
