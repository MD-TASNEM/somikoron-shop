'use client';

import Image, { ImageProps } from 'next/image';
import { useState, useCallback, useRef } from 'react';
import { Skeleton } from './skeleton';



export default function OptimizedImage({
  src,
  alt,
  fallbackSrc = '/images/placeholder-product.jpg',
  skeletonClassName,
  lazy = true,
  threshold = 0.1,
  rootMargin = '50px',
  className,
  priority = false,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const imgRef = useRef(null);

  // Intersection Observer for lazy loading
  const observerRef = useRef(null);

  const handleIntersection = useCallback((entries) => {
    const [entry] = entries;
    if (entry.isIntersecting) {
      setIsInView(true);
      observerRef.current?.disconnect();
    }
  }, []);

  // Set up intersection observer
  const ref = useCallback((node) => {
    imgRef.current = node;
    
    if (lazy && !priority && node) {
      observerRef.current = new IntersectionObserver(handleIntersection, {
        threshold,
        rootMargin,
      });
      
      observerRef.current.observe(node);
    }
  }, [lazy, priority, threshold, rootMargin, handleIntersection]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  // Generate optimized srcSet for responsive images
  const generateSrcSet = useCallback((imageSrc) => {
    // If it's an external URL, return as-is
    if (imageSrc.startsWith('http')) {
      return undefined;
    }

    // For local images, generate responsive sizes
    const sizes = [
      { width: 640, height: 640 }, // sm
      { width: 750, height: 750 }, // md
      { width: 828, height: 828 }, // lg
      { width: 1080, height: 1080 }, // xl
      { width: 1200, height: 1200 }, // 2xl
    ];

    return sizes
      .map(({ width, height }) => `${imageSrc}?w=${width}&h=${height}&fit=crop ${width}w`)
      .join(', ');
  }, []);

  // Generate responsive sizes attribute
  const generateSizes = useCallback(() => {
    return '(max-width: 640px) 100vw, (max-width: 750px) 50vw, (max-width: 828px) 33vw, (max-width: 1080px) 25vw, 20vw';
  }, []);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Skeleton loader */}
      {isLoading && (
        <Skeleton 
          className={`absolute inset-0 ${skeletonClassName}`}
          variant="rectangular"
        />
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-500">Image not available</p>
          </div>
        </div>
      )}

      {/* Optimized Image */}
      {isInView && (
        <Image
          ref={ref}
          src={hasError ? fallbackSrc : src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          srcSet={generateSrcSet(hasError ? fallbackSrc)}
          sizes={generateSizes()}
          priority={priority}
          fill
          className={`
            transition-opacity duration-300
            ${isLoading ? 'opacity-0' : 'opacity-100'}
            ${hasError ? 'object-contain' : 'object-cover'}
          `}
          {...props}
        />
      )}
    </div>
  );
}

// Product Image component with specific optimizations
export function ProductImage({ 
  src, 
  alt, 
  className = '',
  priority = false 
}: { 
  src: string; 
  alt: string; 
  className?: string; 
  priority?: boolean; 
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={className}
      priority={priority}
      fallbackSrc="/images/placeholder-product.jpg"
      sizes="(max-width: 640px) 100vw, (max-width: 750px) 50vw, (max-width: 828px) 33vw, (max-width: 1080px) 25vw, 20vw"
      skeletonClassName="rounded-lg"
    />
  );
}

// Category Image component
export function CategoryImage({ 
  src, 
  alt, 
  className = '' 
}: { 
  src: string; 
  alt: string; 
  className?: string; 
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={className}
      fallbackSrc="/images/placeholder-category.jpg"
      sizes="(max-width: 640px) 100vw, (max-width: 750px) 50vw, (max-width: 828px) 33vw, 25vw"
      skeletonClassName="rounded-lg"
    />
  );
}

// Avatar Image component
export function AvatarImage({ 
  src, 
  alt, 
  size = 40,
  className = '' 
}: { 
  src?: string; 
  alt: string; 
  size?: number; 
  className?: string; 
}) {
  return (
    <OptimizedImage
      src={src || '/images/placeholder-avatar.jpg'}
      alt={alt}
      className={`rounded-full ${className}`}
      style={{ width, height: size }}
      fallbackSrc="/images/placeholder-avatar.jpg"
      sizes={`${size}px`}
      skeletonClassName="rounded-full"
    />
  );
}

// Banner Image component
export function BannerImage({ 
  src, 
  alt, 
  className = '',
  priority = true 
}: { 
  src: string; 
  alt: string; 
  className?: string; 
  priority?: boolean; 
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={className}
      priority={priority}
      fallbackSrc="/images/placeholder-banner.jpg"
      sizes="100vw"
      skeletonClassName="rounded-lg"
    />
  );
}

// Gallery Image component for product galleries
export function GalleryImage({ 
  src, 
  alt, 
  onClick,
  className = '' 
}: { 
  src: string; 
  alt: string; 
  onClick?: () => void;
  className?: string; 
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={`cursor-pointer ${className}`}
      fallbackSrc="/images/placeholder-product.jpg"
      sizes="(max-width: 640px) 100vw, (max-width: 750px) 50vw, (max-width: 828px) 33vw, (max-width: 1080px) 25vw, 20vw"
      skeletonClassName="rounded-lg"
      onClick={onClick}
    />
  );
}
