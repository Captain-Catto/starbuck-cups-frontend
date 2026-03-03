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

export function FeaturedToggle({
  value,
  onChange,
  disabled = false,
  className = "",
  size = "md",
}: FeaturedToggleProps) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
  };

  return (
    <label
      className={`
      inline-flex items-center gap-3 cursor-pointer
      ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      ${className}
    `}
    >
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => !disabled && onChange(e.target.checked)}
        disabled={disabled}
        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:focus:ring-blue-600"
      />
      <div className="flex items-center gap-2">
        <Sparkles className={`text-blue-500 fill-current ${iconSizes[size]}`} />
        <span
          className={`font-medium text-gray-900 dark:text-white ${sizeClasses[size]}`}
        >
          Đánh dấu là sản phẩm nổi bật
        </span>
      </div>
    </label>
  );
}
