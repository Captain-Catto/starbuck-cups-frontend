"use client";

import React from "react";
import { Sparkles } from "lucide-react";

interface FeaturedToggleProps {
  value: boolean;
  onChange: (isFeatured: boolean) => void;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md";
}

const FEATURED_TOGGLE_SIZE_CLASSES: Record<string, string> = {
  sm: "text-sm",
  md: "text-base",
};

const FEATURED_TOGGLE_ICON_SIZES: Record<string, string> = {
  sm: "size-4",
  md: "size-5",
};

export function FeaturedToggle({
  value,
  onChange,
  disabled = false,
  className = "",
  size = "md",
}: FeaturedToggleProps) {

  return (
    <label
      className={`
      inline-flex items-center gap-3 cursor-pointer
      ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      ${className}
    `}
    >
      <input aria-label="checkbox"
        type="checkbox"
        checked={value}
        onChange={(e) => !disabled && onChange(e.target.checked)}
        disabled={disabled}
        className="size-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:focus:ring-blue-600"
      />
      <div className="flex items-center gap-2">
        <Sparkles className={`text-blue-500 fill-current ${FEATURED_TOGGLE_ICON_SIZES[size]}`} />
        <span
          className={`font-medium text-gray-900 dark:text-white ${FEATURED_TOGGLE_SIZE_CLASSES[size]}`}
        >
          Đánh dấu là sản phẩm nổi bật
        </span>
      </div>
    </label>
  );
}
