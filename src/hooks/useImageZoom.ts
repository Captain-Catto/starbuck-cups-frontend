"use client";

import { useState, useEffect, useRef, useCallback, useSyncExternalStore } from "react";

// Touch distance for pinch zoom helper
const getTouchDistance = (touches: React.TouchList) => {
  if (touches.length < 2) return 0;
  const touch1 = touches[0];
  const touch2 = touches[1];
  return Math.sqrt(
    Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
  );
};

const getIsMobileSnapshot = () =>
  typeof window !== "undefined" &&
  (window.innerWidth <= 768 || "ontouchstart" in window);

const subscribeToViewport = (onStoreChange: () => void) => {
  window.addEventListener("resize", onStoreChange);
  return () => window.removeEventListener("resize", onStoreChange);
};

interface UseImageZoomProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

export function useImageZoom({ images, initialIndex, onClose }: UseImageZoomProps) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  // Zoom states
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const lastTouchDistanceRef = useRef(0);
  const isMouseSwippingRef = useRef(false);

  // Swipe coordinates
  const swipeRef = useRef({ isSwipping: false, startX: 0, startY: 0, currentX: 0 });

  // Refs
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const MIN_SCALE = 1;
  const MAX_SCALE = 5;
  const SWIPE_THRESHOLD = 50; // px

  const onCloseRef = useRef(onClose);
  const prevImageRef = useRef<() => void>(() => {});
  const nextImageRef = useRef<() => void>(() => {});

  const isMobile = useSyncExternalStore(
    subscribeToViewport,
    getIsMobileSnapshot,
    () => false
  );

  // Reset zoom khi chuyển ảnh
  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Zoom function
  const handleZoom = useCallback(
    (newScale: number, centerX?: number, centerY?: number) => {
      const clampedScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));

      if (clampedScale === MIN_SCALE) {
        setScale(MIN_SCALE);
        setPosition({ x: 0, y: 0 });
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
            position.x * scaleRatio +
            (centerX - rect.width / 2) * (1 - scaleRatio);
          const newTranslateY =
            position.y * scaleRatio +
            (centerY - rect.height / 2) * (1 - scaleRatio);
 
          setPosition({ x: newTranslateX, y: newTranslateY });
        }
      }
    },
    [scale, position.x, position.y, MIN_SCALE, MAX_SCALE]
  );

  // Mouse wheel zoom
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

  // Touch start
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        lastTouchDistanceRef.current = getTouchDistance(e.touches);
        swipeRef.current.isSwipping = false;
      } else if (e.touches.length === 1) {
        const touch = e.touches[0];

        if (scale > MIN_SCALE) {
          setIsDragging(true);
          dragStartRef.current = {
            x: touch.clientX - position.x,
            y: touch.clientY - position.y,
          };
          swipeRef.current.isSwipping = false;
        } else {
          swipeRef.current = { isSwipping: true, startX: touch.clientX, startY: touch.clientY, currentX: touch.clientX };
          setIsDragging(false);
        }
      }
    },
    [scale, MIN_SCALE, position.x, position.y]
  );

  // Touch move
  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();

      if (e.touches.length === 2) {
        const distance = getTouchDistance(e.touches);
        if (lastTouchDistanceRef.current > 0) {
          const scaleChange = distance / lastTouchDistanceRef.current;
          handleZoom(scale * scaleChange);
        }
        lastTouchDistanceRef.current = distance;
        swipeRef.current.isSwipping = false;
      } else if (e.touches.length === 1) {
        const touch = e.touches[0];

        if (isDragging && scale > MIN_SCALE) {
          setPosition({
            x: touch.clientX - dragStartRef.current.x,
            y: touch.clientY - dragStartRef.current.y,
          });
        } else if (swipeRef.current.isSwipping && scale === MIN_SCALE) {
          swipeRef.current.currentX = touch.clientX;
        }
      }
    },
    [scale, isDragging, MIN_SCALE, handleZoom]
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

  useEffect(() => {
    onCloseRef.current = onClose;
    prevImageRef.current = prevImage;
    nextImageRef.current = nextImage;
  }, [nextImage, onClose, prevImage]);

  // Touch end
  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (swipeRef.current.isSwipping) {
        const { startX, startY, currentX } = swipeRef.current;
        const deltaX = currentX - startX;
        const deltaY = Math.abs(e.changedTouches[0]?.clientY - startY);
        const distance = Math.abs(deltaX);

        if (distance > SWIPE_THRESHOLD && Math.abs(deltaX) > deltaY) {
          if (deltaX > 0) prevImage();
          else nextImage();
        }
      }

      setIsDragging(false);
      swipeRef.current = { isSwipping: false, startX: 0, startY: 0, currentX: 0 };
      lastTouchDistanceRef.current = 0;
    },
    [SWIPE_THRESHOLD, prevImage, nextImage]
  );

  // Mouse drag and swipe
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();

      if (scale > MIN_SCALE) {
        setIsDragging(true);
        dragStartRef.current = {
          x: e.clientX - position.x,
          y: e.clientY - position.y,
        };
      } else {
        swipeRef.current = { isSwipping: true, startX: e.clientX, startY: e.clientY, currentX: e.clientX };
        isMouseSwippingRef.current = true;
        document.body.style.userSelect = "none";
        document.body.style.cursor = "default";
      }
    },
    [scale, MIN_SCALE, position.x, position.y]
  );

  // Global mouse events for smooth dragging
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging && scale > MIN_SCALE) {
        e.preventDefault();
        setPosition({
          x: e.clientX - dragStartRef.current.x,
          y: e.clientY - dragStartRef.current.y,
        });
      } else if (swipeRef.current.isSwipping && scale === MIN_SCALE) {
        swipeRef.current.currentX = e.clientX;
      }
    };

    const handleGlobalMouseUp = (e: MouseEvent) => {
      if (swipeRef.current.isSwipping && scale === MIN_SCALE) {
        const { startX, startY, currentX } = swipeRef.current;
        const deltaX = currentX - startX;
        const deltaY = Math.abs(e.clientY - startY);
        const distance = Math.abs(deltaX);

        if (distance > SWIPE_THRESHOLD && Math.abs(deltaX) > deltaY) {
          if (deltaX > 0) prevImage();
          else nextImage();
        }
      }

      setIsDragging(false);
      isMouseSwippingRef.current = false;
      swipeRef.current = { isSwipping: false, startX: 0, startY: 0, currentX: 0 };
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };

    document.addEventListener("mousemove", handleGlobalMouseMove, { passive: false });
    document.addEventListener("mouseup", handleGlobalMouseUp);
    if (isDragging) {
      document.body.style.userSelect = "none";
      document.body.style.cursor = "grabbing";
    }

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [isDragging, scale, MIN_SCALE, SWIPE_THRESHOLD, prevImage, nextImage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onCloseRef.current();
          break;
        case "ArrowLeft":
          e.preventDefault();
          prevImageRef.current();
          break;
        case "ArrowRight":
          e.preventDefault();
          nextImageRef.current();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [images.length]);

  return {
    activeIndex,
    setActiveIndex,
    scale,
    translateX: position.x,
    translateY: position.y,
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
  };
}
