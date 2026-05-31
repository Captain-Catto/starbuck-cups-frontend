"use client";

import { createPortal } from "react-dom";
import OptimizedImage from "@/components/OptimizedImage";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

// Sub-components import
import { ImageZoomControls } from "./image-modal/ImageZoomControls";
import { ImageThumbnails } from "./image-modal/ImageThumbnails";

// Custom hook import
import { useImageZoom } from "@/hooks/useImageZoom";

interface ImageModalProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

export function ImageModal({
  images,
  currentIndex,
  isOpen,
  onClose,
  title,
}: ImageModalProps) {
  if (!isOpen) return null;

  return (
    <ImageModalContent
      key={`${currentIndex}-${images[currentIndex] ?? ""}`}
      images={images}
      initialIndex={currentIndex}
      onClose={onClose}
      title={title}
    />
  );
}

interface ImageModalContentProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
  title: string;
}

function ImageModalContent({
  images,
  initialIndex,
  onClose,
  title,
}: ImageModalContentProps) {
  const t = useTranslations("imageViewer");

  const {
    activeIndex,
    setActiveIndex,
    scale,
    translateX,
    translateY,
    isDragging,
    imageContainerRef,
    handleWheel,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseDown,
    resetZoom,
    handleZoom,
    nextImage,
    prevImage,
    isMobile,
    MIN_SCALE,
    MAX_SCALE,
  } = useImageZoom({ images, initialIndex, onClose });

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleThumbnailClick = (index: number, event: React.MouseEvent) => {
    setActiveIndex(index);
    resetZoom();
    (event.target as HTMLElement).blur();
  };

  const modal = (
    <dialog
      open
      aria-label={title}
      className="fixed inset-0 z-50 bg-zinc-950 bg-opacity-95 flex items-center justify-center m-0 p-0 border-0 outline-none max-w-none max-h-none size-full block"
    >
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-zinc-300 z-10"
        aria-label={t("close")}
      >
        <svg
          className="size-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Zoom controls */}
      <ImageZoomControls
        scale={scale}
        isMobile={isMobile}
        MAX_SCALE={MAX_SCALE}
        MIN_SCALE={MIN_SCALE}
        handleZoom={handleZoom}
        resetZoom={resetZoom}
        t={t}
        hasMultipleImages={images.length > 1}
      />

      {/* Thumbnail gallery */}
      <ImageThumbnails
        images={images}
        isMobile={isMobile}
        activeIndex={activeIndex}
        handleThumbnailClick={handleThumbnailClick}
        t={t}
      />

      {/* Main image */}
      <div
        className={`relative size-full flex items-center justify-center py-4 pb-20 ${
          !isMobile && images.length > 1 ? "pl-28 md:pl-32 pr-4" : "px-4"
        }`}
      >
        <div
          ref={imageContainerRef}
          role="presentation"
          className="relative size-full max-w-4xl overflow-hidden cursor-pointer"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            cursor:
              scale > MIN_SCALE
                ? isDragging
                  ? "grabbing"
                  : "grab"
                : "zoom-in",
          }}
        >
          <div
            className="size-full"
            style={{
              transform: `scale(${scale}) translate(${translateX / scale}px, ${
                translateY / scale
              }px)`,
              transformOrigin: "center center",
            }}
          >
            <OptimizedImage
              src={images[activeIndex]}
              alt={t("imageAlt", { index: activeIndex + 1 })}
              fill
              className="object-contain pointer-events-none"
              key={activeIndex}
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
              style={{ objectFit: "contain" }}
              onError={(e) => {
                e.currentTarget.src = "/images/placeholder-product.jpg";
              }}
            />
          </div>
        </div>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevImage}
              className={`absolute top-1/2 transform -translate-y-1/2 text-white hover:text-zinc-300 p-3 ${
                !isMobile ? "left-28 md:left-32" : "left-4"
              }`}
              aria-label={t("previousImage")}
            >
              <svg
                className="size-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <button
              type="button"
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-zinc-300 p-3"
              aria-label={t("nextImage")}
            >
              <svg
                className="size-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Image info bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-zinc-950 bg-opacity-90 text-white">
        <div className="px-4 py-3 text-center">
          <p className="text-sm text-zinc-300">
            {t("imageCounter", {
              current: activeIndex + 1,
              total: images.length,
            })}
          </p>
          {!isMobile && (
            <p className="text-xs text-zinc-400 mt-1">
              {t("zoomHint")}
            </p>
          )}
        </div>
      </div>

      {/* Click outside to close */}
      <button
        type="button"
        className="absolute inset-0 -z-10"
        onClick={onClose}
        aria-label={t("closeModal")}
      />
    </dialog>
  );

  return typeof window !== "undefined"
    ? createPortal(modal, document.body)
    : null;
}
