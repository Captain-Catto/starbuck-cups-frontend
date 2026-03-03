"use client";

import React from "react";
import { Star } from "lucide-react";

interface VipRadioProps {
  value: boolean;
  onChange: (isVip: boolean) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  description?: string;
}

export function VipRadio({
  value,
  onChange,
  disabled = false,
  className = "",
  label = "Trạng thái VIP",
  description = "Đánh dấu sản phẩm này là VIP để hiển thị badge đặc biệt",
}: VipRadioProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-900 dark:text-white">
          {label}
        </label>
      )}

      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}

      <div className="space-y-2">
        {/* VIP Option */}
        <label
          className={`
          flex items-center p-3 border rounded-lg cursor-pointer transition-all
          ${
            value
              ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
        >
          <input
            type="radio"
            name="isVip"
            value="true"
            checked={value === true}
            onChange={() => !disabled && onChange(true)}
            disabled={disabled}
            className="w-4 h-4 text-yellow-600 border-gray-300 focus:ring-yellow-500 dark:border-gray-600 dark:focus:ring-yellow-600"
          />
          <div className="ml-3 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500 fill-current" />
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Sản phẩm VIP
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Hiển thị badge VIP và được ưu tiên trong danh sách
              </p>
            </div>
          </div>
        </label>

        {/* Regular Option */}
        <label
          className={`
          flex items-center p-3 border rounded-lg cursor-pointer transition-all
          ${
            !value
              ? "border-gray-400 bg-gray-50 dark:bg-gray-800"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
        >
          <input
            type="radio"
            name="isVip"
            value="false"
            checked={value === false}
            onChange={() => !disabled && onChange(false)}
            disabled={disabled}
            className="w-4 h-4 text-gray-600 border-gray-300 focus:ring-gray-500 dark:border-gray-600 dark:focus:ring-gray-600"
          />
          <div className="ml-3">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Sản phẩm thường
            </span>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Sản phẩm thông thường không có badge VIP
            </p>
          </div>
        </label>
      </div>
    </div>
  );
}

// Simplified version - just toggle checkbox
interface VipToggleProps {
  value: boolean;
  onChange: (isVip: boolean) => void;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md";
}

export function VipToggle({
  value,
  onChange,
  disabled = false,
  className = "",
  size = "md",
}: VipToggleProps) {
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
        className="w-5 h-5 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500 dark:border-gray-600 dark:focus:ring-yellow-600"
      />
      <div className="flex items-center gap-2">
        <Star className={`text-yellow-500 fill-current ${iconSizes[size]}`} />
        <span
          className={`font-medium text-gray-900 dark:text-white ${sizeClasses[size]}`}
        >
          Đánh dấu là sản phẩm VIP
        </span>
      </div>
    </label>
  );
}
