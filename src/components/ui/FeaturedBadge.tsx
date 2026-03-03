"use client";

interface FeaturedBadgeProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function FeaturedBadge({
  size = "md",
  className = "",
}: FeaturedBadgeProps) {
  // Featured badge sizes - max 24px
  const sizes = {
    sm: { fontSize: "20px", lineHeight: "20px" },
    md: { fontSize: "24px", lineHeight: "24px" },
    lg: { fontSize: "24px", lineHeight: "24px" },
  };

  return (
    <div className={`inline-block featured-shimmer ${className}`}>
      <span style={sizes[size]}>⭐</span>

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
