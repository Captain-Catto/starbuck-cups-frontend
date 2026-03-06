'use client';

import { useMemo, ImgHTMLAttributes } from 'react';
import { convertDriveUrl } from '@/utils/googleDriveHelper';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  className?: string;
  fetchPriority?: 'high' | 'low' | 'auto';
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

/**
 * Custom optimized image component that works without Vercel
 * Uses our custom /api/image endpoint for optimization
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  quality = 75,
  priority = false,
  fill = false,
  sizes,
  className = '',
  fetchPriority,
  onError,
  style,
  ...props
}: OptimizedImageProps) {
  const resolvedSizes = useMemo(() => {
    if (sizes) return sizes;
    if (!width) return "100vw";
    return `${width}px`;
  }, [sizes, width]);

  // Compute image src synchronously so the URL is available on first render
  // This is critical for LCP — useEffect delays image discovery until after hydration
  const imageSrc = useMemo(() => {
    const normalizedSrc = normalizeSource(src);
    if (isLocalOrInlineSource(normalizedSrc)) {
      return normalizedSrc;
    }

    const convertedSrc = normalizeSource(convertDriveUrl(normalizedSrc));
    return getOptimizedUrl(convertedSrc, width, quality);
  }, [src, width, quality]);

  // Generate srcSet for responsive images
  const srcSet = useMemo(() => {
    const normalizedSrc = normalizeSource(src);
    if (isLocalOrInlineSource(normalizedSrc)) {
      return undefined;
    }

    const convertedSrc = normalizeSource(convertDriveUrl(normalizedSrc));
    const widths = getResponsiveWidths(width);

    return widths
      .map(w => `${getOptimizedUrl(convertedSrc, w, quality)} ${w}w`)
      .join(', ');
  }, [src, width, quality]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (onError) {
      onError(e);
    } else {
      const target = e.currentTarget;
      target.src = '/images/placeholder.webp';
    }
  };

  if (fill) {
    return (
      <img
        src={imageSrc}
        srcSet={srcSet}
        sizes={srcSet ? resolvedSizes : undefined}
        alt={alt}
        className={className}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={fetchPriority}
        decoding={priority ? 'sync' : 'async'}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          left: 0,
          top: 0,
          objectFit: 'cover',
          ...style,
        }}
        {...props}
      />
    );
  }

  return (
    <img
      src={imageSrc}
      srcSet={srcSet}
      sizes={srcSet ? resolvedSizes : undefined}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={handleError}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={fetchPriority}
      decoding={priority ? 'sync' : 'async'}
      style={style}
      {...props}
    />
  );
}

/**
 * Generate optimized image URL using our API
 */
function getOptimizedUrl(src: string, width?: number, quality?: number): string {
  const params = new URLSearchParams();
  params.set('url', src);

  if (width) {
    params.set('w', width.toString());
  }

  if (quality) {
    params.set('q', quality.toString());
  }

  // Default to WebP format for best compression
  params.set('f', 'webp');

  return `/api/image?${params.toString()}`;
}

/**
 * Preload critical images
 */
export function preloadImage(src: string, width?: number) {
  if (typeof window === 'undefined') return;

  const normalizedSrc = normalizeSource(src);
  const optimizedUrl = isLocalOrInlineSource(normalizedSrc)
    ? normalizedSrc
    : getOptimizedUrl(normalizeSource(convertDriveUrl(normalizedSrc)), width, 85);

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = optimizedUrl;
  document.head.appendChild(link);
}

function normalizeSource(src: string): string {
  const normalized = src.trim();

  // Protocol-relative URLs (//cdn.example.com/...) are external URLs, not local paths.
  if (normalized.startsWith('//')) {
    return `https:${normalized}`;
  }

  return normalized;
}

function isLocalOrInlineSource(src: string): boolean {
  return (
    (src.startsWith('/') && !src.startsWith('//')) ||
    src.startsWith('data:') ||
    src.startsWith('blob:')
  );
}

const RESPONSIVE_WIDTHS = [
  64, 96, 128, 160, 192, 228, 256, 320, 384, 456, 512, 640, 750, 828, 960,
  1080, 1200, 1600, 1920,
];

function getResponsiveWidths(width?: number): number[] {
  if (!width) {
    return [256, 320, 384, 456, 512, 640, 750, 828, 960, 1080, 1200];
  }

  const targetWidths = [
    Math.round(width * 0.4),
    Math.round(width * 0.56),
    Math.round(width * 0.75),
    width,
    Math.round(width * 1.25),
    Math.round(width * 1.5),
    Math.round(width * 2),
  ];

  const snapped = targetWidths.map((target) => {
    const clamped = Math.max(64, Math.min(1920, target));
    return getNearestWidth(clamped);
  });

  return Array.from(new Set(snapped)).sort((a, b) => a - b);
}

function getNearestWidth(target: number): number {
  return RESPONSIVE_WIDTHS.reduce((closest, current) => {
    return Math.abs(current - target) < Math.abs(closest - target)
      ? current
      : closest;
  }, RESPONSIVE_WIDTHS[0]);
}
