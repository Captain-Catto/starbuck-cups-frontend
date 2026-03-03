"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import OptimizedImage from "@/components/OptimizedImage";

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
}: ImageModalProps) {
  const [activeIndex, setActiveIndex] = useState(currentIndex);

  // Zoom states
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastTouchDistance, setLastTouchDistance] = useState(0);

  // Swipe states
  const [isSwipping, setIsSwipping] = useState(false);
  const [swipeStartX, setSwipeStartX] = useState(0);
  const [swipeStartY, setSwipeStartY] = useState(0);
  const [swipeCurrentX, setSwipeCurrentX] = useState(0);

  // Refs
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const MIN_SCALE = 1;
  const MAX_SCALE = 5;
  const SWIPE_THRESHOLD = 50; // px

  // Detect mobile using screen width and touch support
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || "ontouchstart" in window);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Reset zoom khi chuyển ảnh
  const resetZoom = useCallback(() => {
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);
  }, []);

  // Zoom function
  const handleZoom = useCallback(
    (newScale: number, centerX?: number, centerY?: number) => {
      const clampedScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));

      if (clampedScale === MIN_SCALE) {
        setScale(MIN_SCALE);
        setTranslateX(0);
        setTranslateY(0);
      } else {
        setScale(clampedScale);

        // Adjust translation để zoom vào điểm click
        if (
          centerX !== undefined &&
          centerY !== undefined &&
          imageContainerRef.current
        ) {
          const rect = imageContainerRef.current.getBoundingClientRect();
          const scaleRatio = clampedScale / scale;

          const newTranslateX =
            translateX * scaleRatio +
            (centerX - rect.width / 2) * (1 - scaleRatio);
          const newTranslateY =
            translateY * scaleRatio +
            (centerY - rect.height / 2) * (1 - scaleRatio);

          setTranslateX(newTranslateX);
          setTranslateY(newTranslateY);
        }
      }
    },
    [scale, translateX, translateY, MIN_SCALE, MAX_SCALE]
  );

  // Mouse wheel zoom - enabled for all devices
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      const centerX = e.clientX - rect.left;
      const centerY = e.clientY - rect.top;

      const delta = e.deltaY > 0 ? -0.2 : 0.2;
      handleZoom(scale + delta, centerX, centerY);
    },
    [scale, handleZoom]
  );

  // Touch distance for pinch zoom
  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  // Touch start - handle both mobile and desktop
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        // Pinch zoom start (desktop)
        setLastTouchDistance(getTouchDistance(e.touches));
        setIsSwipping(false);
      } else if (e.touches.length === 1) {
        const touch = e.touches[0];

        if (scale > MIN_SCALE) {
          // Pan start when zoomed
          setIsDragging(true);
          dragStartRef.current = {
            x: touch.clientX - translateX,
            y: touch.clientY - translateY,
          };
          setIsSwipping(false);
        } else {
          // Swipe start when not zoomed - enabled for all devices
          setIsSwipping(true);
          setSwipeStartX(touch.clientX);
          setSwipeStartY(touch.clientY);
          setSwipeCurrentX(touch.clientX);
          setIsDragging(false);
        }
      }
    },
    [scale, MIN_SCALE, translateX, translateY]
  );

  // Touch move - handle both mobile and desktop
  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();

      if (e.touches.length === 2) {
        // Pinch zoom (desktop)
        const distance = getTouchDistance(e.touches);
        if (lastTouchDistance > 0) {
          const scaleChange = distance / lastTouchDistance;
          handleZoom(scale * scaleChange);
        }
        setLastTouchDistance(distance);
        setIsSwipping(false);
      } else if (e.touches.length === 1) {
        const touch = e.touches[0];

        if (isDragging && scale > MIN_SCALE) {
          // Direct, immediate pan for smoothest touch dragging
          setTranslateX(touch.clientX - dragStartRef.current.x);
          setTranslateY(touch.clientY - dragStartRef.current.y);
        } else if (isSwipping && scale === MIN_SCALE) {
          // Swipe for navigation when not zoomed
          setSwipeCurrentX(touch.clientX);
        }
      }
    },
    [scale, lastTouchDistance, isDragging, isSwipping, MIN_SCALE, handleZoom]
  );

  // Navigation functions
  const nextImage = useCallback(() => {
    const newIndex = activeIndex < images.length - 1 ? activeIndex + 1 : 0;
    setActiveIndex(newIndex);
    resetZoom();
  }, [activeIndex, images.length, resetZoom]);

  const prevImage = useCallback(() => {
    const newIndex = activeIndex > 0 ? activeIndex - 1 : images.length - 1;
    setActiveIndex(newIndex);
    resetZoom();
  }, [activeIndex, images.length, resetZoom]);

  // Touch end - handle swipe detection
  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (isSwipping) {
        const deltaX = swipeCurrentX - swipeStartX;
        const deltaY = Math.abs(e.changedTouches[0]?.clientY - swipeStartY);
        const distance = Math.abs(deltaX);

        // Check if horizontal swipe with enough distance
        if (distance > SWIPE_THRESHOLD && Math.abs(deltaX) > deltaY) {
          if (deltaX > 0) {
            // Swipe right - previous image
            prevImage();
          } else {
            // Swipe left - next image
            nextImage();
          }
        }
      }

      // Reset states
      setIsDragging(false);
      setIsSwipping(false);
      setLastTouchDistance(0);
      setSwipeStartX(0);
      setSwipeStartY(0);
      setSwipeCurrentX(0);
    },
    [
      isSwipping,
      swipeCurrentX,
      swipeStartX,
      swipeStartY,
      SWIPE_THRESHOLD,
      prevImage,
      nextImage,
    ]
  );

  // Mouse drag and swipe for laptops
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault(); // Prevent text selection and other default behaviors

      if (scale > MIN_SCALE) {
        // Pan when zoomed
        setIsDragging(true);
        dragStartRef.current = {
          x: e.clientX - translateX,
          y: e.clientY - translateY,
        };
      } else {
        // Swipe for navigation when not zoomed
        setIsSwipping(true);
        setSwipeStartX(e.clientX);
        setSwipeStartY(e.clientY);
        setSwipeCurrentX(e.clientX);
      }
    },
    [scale, MIN_SCALE, translateX, translateY]
  );

  // Remove local mouse move/up handlers since we use global ones

  // Sync activeIndex với currentIndex và reset zoom
  useEffect(() => {
    setActiveIndex(currentIndex);
    resetZoom(); // Reset zoom khi chuyển ảnh
  }, [currentIndex, isOpen, resetZoom]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Global mouse events for smooth dragging
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging && scale > MIN_SCALE) {
        // Direct, immediate update for smoothest possible dragging
        e.preventDefault();
        setTranslateX(e.clientX - dragStartRef.current.x);
        setTranslateY(e.clientY - dragStartRef.current.y);
      } else if (isSwipping && scale === MIN_SCALE) {
        // Track swipe movement
        setSwipeCurrentX(e.clientX);
      }
    };

    const handleGlobalMouseUp = (e: MouseEvent) => {
      if (isSwipping && scale === MIN_SCALE) {
        const deltaX = swipeCurrentX - swipeStartX;
        const deltaY = Math.abs(e.clientY - swipeStartY);
        const distance = Math.abs(deltaX);

        // Check if horizontal swipe with enough distance
        if (distance > SWIPE_THRESHOLD && Math.abs(deltaX) > deltaY) {
          if (deltaX > 0) {
            // Swipe right - previous image
            prevImage();
          } else {
            // Swipe left - next image
            nextImage();
          }
        }
      }

      // Reset states
      setIsDragging(false);
      setIsSwipping(false);
      setSwipeStartX(0);
      setSwipeStartY(0);
      setSwipeCurrentX(0);
    };

    if (isDragging || isSwipping) {
      // Add global listeners for smooth dragging
      document.addEventListener("mousemove", handleGlobalMouseMove, {
        passive: false,
      });
      document.addEventListener("mouseup", handleGlobalMouseUp);

      // Prevent text selection during drag
      document.body.style.userSelect = "none";
      document.body.style.cursor = isDragging ? "grabbing" : "default";
    }

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [
    isDragging,
    isSwipping,
    scale,
    MIN_SCALE,
    swipeCurrentX,
    swipeStartX,
    swipeStartY,
    SWIPE_THRESHOLD,
    prevImage,
    nextImage,
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          e.preventDefault();
          setActiveIndex((prev) => {
            const newIndex = prev > 0 ? prev - 1 : images.length - 1;
            return newIndex;
          });
          break;
        case "ArrowRight":
          e.preventDefault();
          setActiveIndex((prev) => {
            const newIndex = prev < images.length - 1 ? prev + 1 : 0;
            return newIndex;
          });
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, images.length, onClose]);

  if (!isOpen) return null;

  const handleThumbnailClick = (index: number, event: React.MouseEvent) => {
    setActiveIndex(index);
    resetZoom();
    // Remove focus from the clicked button to prevent hover state persistence
    (event.target as HTMLElement).blur();
  };

  const modal = (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-zinc-300 z-10"
        aria-label="Đóng"
      >
        <svg
          className="w-8 h-8"
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

      {/* Zoom controls - hidden on mobile */}
      {!isMobile && (
        <div
          className={`absolute top-4 flex flex-col gap-2 z-10 ${
            images.length > 1 ? "left-28 md:left-32" : "left-4"
          }`}
        >
          <button
            onClick={() => handleZoom(scale + 0.5)}
            disabled={scale >= MAX_SCALE}
            className="p-2 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Zoom in"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>

          <button
            onClick={() => handleZoom(scale - 0.5)}
            disabled={scale <= MIN_SCALE}
            className="p-2 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Zoom out"
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
                d="M20 12H4"
              />
            </svg>
          </button>

          {scale > MIN_SCALE && (
            <button
              onClick={resetZoom}
              className="p-2 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-70"
              aria-label="Reset zoom"
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          )}

          {/* Zoom indicator */}
          <div className="px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded text-center">
            {Math.round(scale * 100)}%
          </div>
        </div>
      )}

      {/* Thumbnail gallery - left side vertical (hidden on mobile) */}
      {images.length > 1 && !isMobile && (
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
          <div className="flex flex-col gap-2 max-h-96 overflow-y-auto scrollbar-hide bg-black bg-opacity-50 rounded-lg p-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={(e) => handleThumbnailClick(index, e)}
              className={`relative h-12 w-16 md:h-16 md:w-20 flex-shrink-0 rounded overflow-hidden border-2 transition-all focus:outline-none ${
                  index === activeIndex
                    ? "border-white scale-110"
                    : "border-zinc-500 hover:border-zinc-300 focus:border-zinc-200"
                }`}
              >
                <OptimizedImage
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
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
      )}

      {/* Main image */}
      <div
        className={`relative w-full h-full flex items-center justify-center py-4 pb-20 ${
          !isMobile && images.length > 1 ? "pl-28 md:pl-32 pr-4" : "px-4"
        }`}
      >
        <div
          ref={imageContainerRef}
          className="relative w-full h-full max-w-4xl overflow-hidden cursor-pointer"
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
            className="w-full h-full"
            style={{
              transform: `scale(${scale}) translate(${translateX / scale}px, ${
                translateY / scale
              }px)`,
              transformOrigin: "center center",
              willChange: isDragging ? "transform" : "auto", // Optimize for dragging
            }}
          >
            <OptimizedImage
              src={images[activeIndex]}
              alt={`Hình ${activeIndex + 1}`}
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
              onClick={prevImage}
              className={`absolute top-1/2 transform -translate-y-1/2 text-white hover:text-zinc-300 p-3 ${
                !isMobile ? "left-28 md:left-32" : "left-4"
              }`}
              aria-label="Hình trước"
            >
              <svg
                className="w-8 h-8"
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
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-zinc-300 p-3"
              aria-label="Hình tiếp theo"
            >
              <svg
                className="w-8 h-8"
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
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-90 text-white">
        {/* Image counter */}
        <div className="px-4 py-3 text-center">
          <p className="text-sm text-zinc-300">
            {`Hình ${activeIndex + 1} / ${images.length}`}
          </p>
          {/* Help text - only show on desktop */}
          {!isMobile && (
            <p className="text-xs text-zinc-400 mt-1">
              Cuộn chuột để zoom • Kéo để di chuyển
            </p>
          )}
        </div>
      </div>

      {/* Click outside to close */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
        aria-label="Đóng modal"
      />
    </div>
  );

  return typeof window !== "undefined"
    ? createPortal(modal, document.body)
    : null;
}
