"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { ImageModal } from "./ImageModal";
import { VipBadge } from "./VipBadge";
import OptimizedImage from "@/components/OptimizedImage";
import { useTranslations } from "next-intl";

interface PropertyGalleryProps {
  images: string[];
  title: string;
  isVip?: boolean;
}

type ImageViewerTranslations = ReturnType<typeof useTranslations>;

function EmptyGallery({ t }: { t: ImageViewerTranslations }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      <div className="h-96 bg-zinc-800 flex items-center justify-center">
        <span className="text-zinc-400">{t("noImages")}</span>
      </div>
    </div>
  );
}

function ZoomHint({ t }: { t: ImageViewerTranslations }) {
  return (
    <div className="absolute bottom-4 left-4 bg-zinc-800 bg-opacity-80 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg">
      <span className="flex items-center gap-2">
        <svg
          className="size-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
          />
        </svg>
        {t("clickToZoom")}
      </span>
    </div>
  );
}

function GalleryNavButtons({
  show,
  onPrevious,
  onNext,
  t,
}: {
  show: boolean;
  onPrevious: () => void;
  onNext: () => void;
  t: ImageViewerTranslations;
}) {
  if (!show) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onPrevious();
        }}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-zinc-800 bg-opacity-80 backdrop-blur-md text-white p-3 rounded-full hover:bg-zinc-700 hover:scale-110 transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none shadow-lg"
        aria-label={t("previousImage")}
      >
        <svg
          className="size-6"
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
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-zinc-800 bg-opacity-80 backdrop-blur-md text-white p-3 rounded-full hover:bg-zinc-700 hover:scale-110 transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none shadow-lg"
        aria-label={t("nextImage")}
      >
        <svg
          className="size-6"
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
  );
}

function MainImageButton({
  images,
  title,
  isVip,
  currentImage,
  imgVisible,
  onOpenModal,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  t,
}: {
  images: string[];
  title: string;
  isVip: boolean;
  currentImage: number;
  imgVisible: boolean;
  onOpenModal: () => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: (e: React.MouseEvent) => void;
  t: ImageViewerTranslations;
}) {
  return (
    <button
      type="button"
      aria-label={t("clickToZoom")}
      className="relative block h-[350px] md:h-[500px] lg:h-[600px] w-full group cursor-pointer appearance-none border-0 bg-transparent p-0 text-left"
      onClick={onOpenModal}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    >
      <OptimizedImage
        src={images[currentImage]}
        alt={t("imageWithTitleAlt", {
          title,
          index: currentImage + 1,
        })}
        fill
        className={`object-contain transition-opacity duration-150 ${
          imgVisible ? "opacity-100" : "opacity-0"
        }`}
        priority
        style={{ objectFit: "contain" }}
        onError={(e) => {
          const target = e.currentTarget;
          target.src = "/images/placeholder-product.jpg";
        }}
      />

      {isVip && (
        <div className="absolute top-4 right-4 z-10">
          <VipBadge size="lg" />
        </div>
      )}

      <div className="absolute bottom-4 right-4 bg-zinc-800 bg-opacity-80 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
        {currentImage + 1} / {images.length}
      </div>

      <ZoomHint t={t} />
    </button>
  );
}

function ThumbnailGallery({
  images,
  currentImage,
  onThumbnailClick,
  onOpenModal,
  t,
}: {
  images: string[];
  currentImage: number;
  onThumbnailClick: (index: number, event: React.MouseEvent) => void;
  onOpenModal: () => void;
  t: ImageViewerTranslations;
}) {
  return (
    <div className="px-4 py-2 bg-zinc-800">
      <div className="w-full overflow-hidden">
        <div className="flex gap-2 md:gap-3 pb-2 thumbnail-scroll">
          {images.map((image, index) => (
            <button
              type="button"
              key={image}
              onClick={(e) => onThumbnailClick(index, e)}
              className={`relative h-16 w-20 md:h-20 md:w-28 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200 focus:outline-none cursor-pointer ${
                index === currentImage
                  ? "border-white scale-[1.04] shadow-lg shadow-black/50"
                  : "border-zinc-700 hover:border-zinc-500 hover:scale-[1.02] opacity-70 hover:opacity-100"
              }`}
              style={{ minWidth: "5rem" }}
            >
              <OptimizedImage
                src={image}
                alt={t("thumbnailAlt", { index: index + 1 })}
                fill
                className="object-contain"
                style={{ objectFit: "contain" }}
                onError={(e) => {
                  const target = e.currentTarget;
                  target.src = "/images/placeholder-product.jpg";
                }}
              />
            </button>
          ))}
        </div>
      </div>

      {images.length > 8 && (
        <div className="flex justify-center mt-3">
          <button
            type="button"
            onClick={onOpenModal}
            className="text-zinc-300 hover:text-white text-sm font-medium"
          >
            {t("viewAllImages", { count: images.length })}
          </button>
        </div>
      )}
    </div>
  );
}

export function PropertyGallery({
  images,
  title,
  isVip = false,
}: PropertyGalleryProps) {
  const t = useTranslations("imageViewer");
  const [currentImage, setCurrentImage] = useState(0);
  const [imgVisible, setImgVisible] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Swipe state (refs — never rendered, so no useState needed)
  const swipeRef = useRef({ isSwipping: false, startX: 0, startY: 0, currentX: 0 });

  // Navigation functions with crossfade
  const switchToImage = useCallback((getNext: (prev: number) => number) => {
    setImgVisible(false);
    setTimeout(() => {
      setCurrentImage(getNext);
      setImgVisible(true);
    }, 150);
  }, []);

  const nextImage = useCallback(() => {
    switchToImage((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length, switchToImage]);

  const prevImage = useCallback(() => {
    switchToImage((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length, switchToImage]);

  const SWIPE_THRESHOLD = 50;

  // Touch handlers for swipe - enabled for all devices
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    swipeRef.current = { isSwipping: true, startX: touch.clientX, startY: touch.clientY, currentX: touch.clientX };
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!swipeRef.current.isSwipping || e.touches.length !== 1) return;
    swipeRef.current.currentX = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!swipeRef.current.isSwipping) return;
      const { startX, startY, currentX } = swipeRef.current;
      const deltaX = currentX - startX;
      const deltaY = Math.abs(e.changedTouches[0]?.clientY - startY);
      const distance = Math.abs(deltaX);

      if (distance > SWIPE_THRESHOLD && Math.abs(deltaX) > deltaY) {
        if (deltaX > 0) prevImage();
        else nextImage();
      }
      swipeRef.current = { isSwipping: false, startX: 0, startY: 0, currentX: 0 };
    },
    [nextImage, prevImage]
  );

  // Mouse handlers for swipe on laptops
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    swipeRef.current = { isSwipping: true, startX: e.clientX, startY: e.clientY, currentX: e.clientX };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!swipeRef.current.isSwipping) return;
    swipeRef.current.currentX = e.clientX;
  }, []);

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (!swipeRef.current.isSwipping) return;
      const { startX, startY, currentX } = swipeRef.current;
      const deltaX = currentX - startX;
      const deltaY = Math.abs(e.clientY - startY);
      const distance = Math.abs(deltaX);

      if (distance > SWIPE_THRESHOLD && Math.abs(deltaX) > deltaY) {
        if (deltaX > 0) prevImage();
        else nextImage();
      }
      swipeRef.current = { isSwipping: false, startX: 0, startY: 0, currentX: 0 };
    },
    [nextImage, prevImage]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isModalOpen) return; // Let modal handle keyboard events when open

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentImage((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentImage((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [images.length, isModalOpen]);

  if (!images || images.length === 0) {
    return <EmptyGallery t={t} />;
  }

  const handleThumbnailClick = (index: number, event: React.MouseEvent) => {
    if (index === currentImage) return;
    const target = event.target as HTMLElement;
    target.blur();
    switchToImage(() => index);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <div className="relative group">
          <MainImageButton
            images={images}
            title={title}
            isVip={isVip}
            currentImage={currentImage}
            imgVisible={imgVisible}
            onOpenModal={openModal}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            t={t}
          />

          <GalleryNavButtons
            show={images.length > 1}
            onPrevious={prevImage}
            onNext={nextImage}
            t={t}
          />

          <ThumbnailGallery
            images={images}
            currentImage={currentImage}
            onThumbnailClick={handleThumbnailClick}
            onOpenModal={openModal}
            t={t}
          />
        </div>
      </div>

      {/* Fullscreen Modal */}
      <ImageModal
        images={images}
        currentIndex={currentImage}
        isOpen={isModalOpen}
        onClose={closeModal}
        title={title}
      />
    </>
  );
}
