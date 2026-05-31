"use client";

import React from "react";
import OptimizedImage from "@/components/OptimizedImage";

interface ImageThumbnailsProps {
  images: string[];
  isMobile: boolean;
  activeIndex: number;
  handleThumbnailClick: (index: number, event: React.MouseEvent) => void;
  t: (key: string, values?: any) => string;
}

export function ImageThumbnails({
  images,
  isMobile,
  activeIndex,
  handleThumbnailClick,
  t,
}: ImageThumbnailsProps) {
  if (images.length <= 1 || isMobile) return null;

  return (
    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
      <div className="flex flex-col gap-2 max-h-[calc(100vh-8rem)] overflow-y-auto bg-zinc-950 bg-opacity-50 rounded-lg p-2">
        {images.map((image, index) => (
          <button
            type="button"
            key={image}
            onClick={(e) => handleThumbnailClick(index, e)}
            className={`relative h-12 w-16 md:h-16 md:w-20 flex-shrink-0 rounded overflow-hidden border-2 transition-all focus:outline-none ${
              index === activeIndex
                ? "border-white scale-110"
                : "border-zinc-500 hover:border-zinc-300 focus:border-zinc-200"
            }`}
          >
            <OptimizedImage
              src={image}
              alt={t("thumbnailAlt", { index: index + 1 })}
              fill
              className="object-cover"
              sizes="80px"
              style={{ objectFit: "cover" }}
              onError={(e) => {
                e.currentTarget.src = "/images/placeholder-product.jpg";
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
