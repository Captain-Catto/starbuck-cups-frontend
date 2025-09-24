"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ImageModal } from "./ImageModal";

interface PropertyGalleryProps {
  images: string[];
  title: string;
}

export function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <div className="h-96 bg-zinc-800 flex items-center justify-center">
          <span className="text-zinc-400">Không có hình ảnh</span>
        </div>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImage((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };


  const handleThumbnailClick = (index: number, event: React.MouseEvent) => {
    setCurrentImage(index);
    // Remove focus from the clicked button to prevent hover state persistence
    const target = event.target as HTMLElement;
    target.blur();
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
        <div className="relative">
          {/* Main Image */}
          <div
            className="relative h-96 w-full group cursor-pointer"
            onClick={openModal}
          >
            <Image
              src={images[currentImage]}
              alt={`${title} - Hình ${currentImage + 1}`}
              fill
              className="object-contain"
              priority
              onError={(e) => {
                const target = e.currentTarget;
                target.src = "/images/placeholder-product.jpg";
              }}
            />

            {/* Navigation buttons - Only show if more than 1 image */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-zinc-800 bg-opacity-80 backdrop-blur-md text-white p-3 rounded-full hover:bg-zinc-700 hover:scale-110 transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none shadow-lg"
                  aria-label="Hình trước"
                >
                  <svg
                    className="w-6 h-6"
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
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-zinc-800 bg-opacity-80 backdrop-blur-md text-white p-3 rounded-full hover:bg-zinc-700 hover:scale-110 transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none shadow-lg"
                  aria-label="Hình tiếp theo"
                >
                  <svg
                    className="w-6 h-6"
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

            {/* Image counter */}
            <div className="absolute bottom-4 right-4 bg-zinc-800 bg-opacity-80 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
              {currentImage + 1} / {images.length}
            </div>

            {/* Click to expand hint */}
            <div className="absolute bottom-4 left-4 bg-zinc-800 bg-opacity-80 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg">
              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
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
                Click để phóng to
              </span>
            </div>
          </div>

          {/* Thumbnail Gallery - Always show for debugging */}
          <div className="px-4 py-2 bg-zinc-800">
            {/* Force container width và enable scrolling */}
            <div className="w-full max-w-full">
              <div className="flex gap-2 md:gap-3 pb-2 thumbnail-scroll">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={(e) => handleThumbnailClick(index, e)}
                    className={`relative h-16 w-20 md:h-20 md:w-28 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all transform focus:outline-none ${
                      index === currentImage
                        ? "border-zinc-400 shadow-lg"
                        : "border-zinc-700 hover:border-zinc-600 focus:border-zinc-500"
                    }`}
                    style={{ minWidth: "5rem" }} // Force minimum width
                  >
                    <Image
                      src={image}
                      alt={`${title} - Thumbnail ${index + 1}`}
                      fill
                      className="object-contain"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.src = "/images/placeholder-product.jpg";
                      }}
                    />
                    {/* Active indicator */}
                    {index === currentImage && (
                      <div className="absolute inset-0 border-2 border-zinc-400 rounded-lg pointer-events-none"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Show all thumbnails button if more than 8 images */}
            {images.length > 8 && (
              <div className="flex justify-center mt-3">
                <button
                  onClick={openModal}
                  className="text-zinc-300 hover:text-white text-sm font-medium"
                >
                  Xem tất cả {images.length} hình ảnh
                </button>
              </div>
            )}
          </div>
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
