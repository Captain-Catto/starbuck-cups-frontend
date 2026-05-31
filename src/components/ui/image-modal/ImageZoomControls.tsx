"use client";

import React from "react";

interface ImageZoomControlsProps {
  scale: number;
  isMobile: boolean;
  MAX_SCALE: number;
  MIN_SCALE: number;
  handleZoom: (scale: number) => void;
  resetZoom: () => void;
  t: (key: string, values?: any) => string;
  hasMultipleImages: boolean;
}

export function ImageZoomControls({
  scale,
  isMobile,
  MAX_SCALE,
  MIN_SCALE,
  handleZoom,
  resetZoom,
  t,
  hasMultipleImages,
}: ImageZoomControlsProps) {
  if (isMobile) return null;

  return (
    <div
      className={`absolute top-4 flex flex-col gap-2 z-10 ${
        hasMultipleImages ? "left-28 md:left-32" : "left-4"
      }`}
    >
      <button
        type="button"
        onClick={() => handleZoom(scale + 0.5)}
        disabled={scale >= MAX_SCALE}
        className="p-2 bg-zinc-950 bg-opacity-50 text-white rounded hover:bg-opacity-70 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={t("zoomIn")}
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
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>

      <button
        type="button"
        onClick={() => handleZoom(scale - 0.5)}
        disabled={scale <= MIN_SCALE}
        className="p-2 bg-zinc-950 bg-opacity-50 text-white rounded hover:bg-opacity-70 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={t("zoomOut")}
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
            d="M20 12H4"
          />
        </svg>
      </button>

      {scale > MIN_SCALE && (
        <button
          type="button"
          onClick={resetZoom}
          className="p-2 bg-zinc-950 bg-opacity-50 text-white rounded hover:bg-opacity-70"
          aria-label={t("resetZoom")}
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
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      )}

      {/* Zoom indicator */}
      <div className="px-2 py-1 bg-zinc-950 bg-opacity-50 text-white text-xs rounded text-center">
        {Math.round(scale * 100)}%
      </div>
    </div>
  );
}
