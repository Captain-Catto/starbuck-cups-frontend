import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";
import createNextIntlPlugin from "next-intl/plugin";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  images: {
    // Disable Next.js built-in image optimization (for non-Vercel deployments)
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "example.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "flagcdn.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "hasron-starbucks-shop.s3.ap-southeast-1.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "starbucks-shop.s3.ap-southeast-1.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "drive.google.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
    ],
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 31536000, // 1 year
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 300, 384, 512],
    qualities: [75, 80, 85, 90, 95, 100],
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Bundle optimization
  experimental: {
    // Split CSS by route more aggressively to reduce shared blocking CSS.
    cssChunking: "strict",
    // Inline critical CSS into HTML to reduce render-blocking stylesheet requests.
    inlineCss: true,
    optimizePackageImports: [
      "lucide-react",
      "react-loading-skeleton",
      "@lexical/react",
      "@lexical/html",
      "@lexical/utils",
      "lodash",
      "swiper",
    ],
    webpackBuildWorker: true,
  },
  // Disable source maps in production to reduce bundle size (~2-3MB)
  productionBrowserSourceMaps: false,
  // Compression
  compress: true,
  modularizeImports: {
    lodash: {
      transform: "lodash/{{member}}",
    },
    "@lexical/react": {
      transform: "@lexical/react/{{member}}",
    },
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withBundleAnalyzer(withNextIntl(nextConfig));
