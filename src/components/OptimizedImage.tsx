'use client';

import { useState, useEffect, ImgHTMLAttributes } from 'react';
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
  const [imageSrc, setImageSrc] = useState<string>('');

  useEffect(() => {
    // Convert Google Drive URLs
    const convertedSrc = convertDriveUrl(src);

    // For local images (starting with /), use as-is
    if (convertedSrc.startsWith('/') || convertedSrc.startsWith('data:')) {
      setImageSrc(convertedSrc);
      return;
    }

    // For remote images, use optimization API
    const optimizedUrl = getOptimizedUrl(convertedSrc, width, quality);
    setImageSrc(optimizedUrl);
  }, [src, width, quality]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (onError) {
      onError(e);
    } else {
      // Fallback to placeholder
      const target = e.currentTarget;
      target.src = '/images/placeholder.webp';
    }
  };

  if (fill) {
    return (
      <img
        src={imageSrc}
        alt={alt}
        className={className}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={fetchPriority}
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
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={handleError}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={fetchPriority}
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

  const convertedSrc = convertDriveUrl(src);
  const optimizedUrl = convertedSrc.startsWith('/') 
    ? convertedSrc 
    : getOptimizedUrl(convertedSrc, width, 85);

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = optimizedUrl;
  document.head.appendChild(link);
}
