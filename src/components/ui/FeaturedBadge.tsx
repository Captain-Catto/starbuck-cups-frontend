"use client";

interface FeaturedBadgeProps {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

export function FeaturedBadge({
  size = "md",
  className = "",
}: FeaturedBadgeProps) {
  const sizes = {
    xs: "px-1.5 py-0 text-[10px]",
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  return (
    <div className={`inline-block featured-shimmer ${className}`}>
      <span
        className={`${sizes[size]} font-bold text-white bg-red-500 rounded-sm uppercase tracking-wide`}
      >
        HOT
      </span>

      <style jsx>{`
        .featured-shimmer {
          position: relative;
          overflow: hidden !important;
          isolation: isolate;
        }

        .featured-shimmer::before {
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
          animation: featured-shimmer-sweep 2.5s infinite;
          z-index: 2;
          pointer-events: none;
        }

        @keyframes featured-shimmer-sweep {
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

// Conditional Featured Badge - only shows if product is featured
interface ConditionalFeaturedBadgeProps extends FeaturedBadgeProps {
  product: { isFeatured?: boolean };
}

export function ConditionalFeaturedBadge({
  product,
  ...badgeProps
}: ConditionalFeaturedBadgeProps) {
  if (!product.isFeatured) {
    return null;
  }

  return <FeaturedBadge {...badgeProps} />;
}
