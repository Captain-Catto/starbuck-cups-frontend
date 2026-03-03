"use client";

import React from "react";
import OptimizedImage from "@/components/OptimizedImage";

interface VipBadgeProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function VipBadge({ size = "md", className = "" }: VipBadgeProps) {
  const imageSizes = {
    sm: { width: 24, height: 24 },
    md: { width: 32, height: 32 },
    lg: { width: 40, height: 40 },
  };

  return (
    <div className={`inline-block vip-shimmer ${className}`}>
      <OptimizedImage
        src="/images/vip-logo.webp"
        alt="VIP"
        width={imageSizes[size].width}
        height={imageSizes[size].height}
        className="object-contain vip-pulse"
        priority
      />

      <style jsx>{`
        .vip-pulse {
          animation: vip-pulse 1.5s infinite;
        }

        .vip-shimmer {
          position: relative;
          overflow: hidden !important;
          isolation: isolate;
        }

        .vip-shimmer::before {
          content: "";
          position: absolute;
          top: -10px;
          left: -10px;
          width: calc(100% + 20px);
          height: calc(100% + 20px);
          background: linear-gradient(
            110deg,
            transparent 0%,
            transparent 35%,
            rgba(255, 255, 255, 0.8) 45%,
            rgba(255, 255, 255, 1) 50%,
            rgba(255, 255, 255, 0.8) 55%,
            transparent 65%,
            transparent 100%
          );
          animation: vip-shimmer-sweep 2.5s infinite;
          z-index: 2;
        }

        @keyframes vip-pulse {
          0%,
          100% {
            filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.6));
            box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.9);
          }
          50% {
            filter: drop-shadow(0 0 15px rgba(255, 215, 0, 1))
              drop-shadow(0 0 25px rgba(255, 215, 0, 0.8));
            box-shadow: 0 0 0 8px rgba(255, 215, 0, 0.2);
          }
        }

        @keyframes vip-shimmer-sweep {
          0% {
            transform: translateX(-70%) skewX(-15deg);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          85% {
            opacity: 1;
          }
          100% {
            transform: translateX(70%) skewX(-15deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

// Animated version for special occasions
export function VipBadgeAnimated({
  size = "md",
  className = "",
}: VipBadgeProps) {
  return <VipBadge size={size} className={className} />;
}

// Utils function to check if product is VIP
export function isVipProduct(product: { isVip?: boolean }): boolean {
  return Boolean(product.isVip);
}

// Conditional VIP Badge - only shows if product is VIP
interface ConditionalVipBadgeProps extends VipBadgeProps {
  product: { isVip?: boolean };
}

export function ConditionalVipBadge({
  product,
  ...badgeProps
}: ConditionalVipBadgeProps) {
  if (!isVipProduct(product)) {
    return null;
  }

  return <VipBadge {...badgeProps} />;
}
