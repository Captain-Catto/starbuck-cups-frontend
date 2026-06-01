"use client";

import React from "react";
import Image from "next/image";

interface VipBadgeProps {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const VIP_BADGE_IMAGE_SIZES: Record<string, { width: number; height: number }> = {
  xs: { width: 20, height: 20 },
  sm: { width: 32, height: 32 },
  md: { width: 44, height: 44 },
  lg: { width: 56, height: 56 },
};

export function VipBadge({ size = "md", className = "" }: VipBadgeProps) {
  return (
    <div className={`inline-block vip-shimmer ${className}`}>
      <Image
        src="/images/vip-logo.webp"
        alt="VIP"
        width={VIP_BADGE_IMAGE_SIZES[size].width}
        height={VIP_BADGE_IMAGE_SIZES[size].height}
        className="object-contain vip-pulse"
      />

      <style>{`
        .vip-pulse {
          animation: vip-pulse 2.5s ease-in-out infinite;
        }

        .vip-shimmer {
          position: relative;
          overflow: hidden;
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
          will-change: transform, opacity;
          z-index: 2;
        }

        @keyframes vip-pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.06);
            opacity: 0.92;
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

        @media (prefers-reduced-motion: reduce) {
          .vip-pulse,
          .vip-shimmer::before {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

// Utils function to check if product is VIP
function isVipProduct(product: { isVip?: boolean }): boolean {
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
