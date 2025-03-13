import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useImageCache } from '@/lib/image-cache';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  loadingClassName?: string;
  sizes?: string;
  width?: number | string;
  height?: number | string;
}

export function ProgressiveImage({
  src,
  alt,
  className = '',
  placeholder = '',
  loadingClassName = 'animate-pulse bg-muted',
  sizes = '100vw',
  width,
  height,
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const { getFromCache, addToCache } = useImageCache();

  // Determine if it's a blob URL
  const isBlob = src?.startsWith('blob:');

  // Only use cache for non-blob URLs
  const cachedImage = !isBlob && src ? getFromCache(src) : null;

  // For blob URLs, use the original URL without modifications
  // For regular URLs, add quality and size parameters
  const finalSrc = isBlob 
    ? src 
    : src ? `${src}${src.includes('?') ? '&' : '?'}q=80&w=800` : '';

  // Generate a smaller preview URL for progressive loading
  const previewSrc = isBlob 
    ? src 
    : src ? `${src}${src.includes('?') ? '&' : '?'}q=10&w=20&blur=1` : '';

  useEffect(() => {
    // Reset states when src changes
    setIsLoaded(false);
    setError(false);

    if (cachedImage) {
      setIsLoaded(true);
      return;
    }

    if (!src) {
      setError(true);
      return;
    }

    // Load preview image first (only for non-blob URLs)
    if (!isBlob && previewSrc) {
      const previewImg = new Image();
      previewImg.src = previewSrc;
    }

    // Load full resolution image
    const img = new Image();

    if (!isBlob) {
      img.crossOrigin = "anonymous";
    }

    img.src = finalSrc;

    img.onload = () => {
      setIsLoaded(true);
      setError(false);
      if (src && !isBlob) {
        addToCache(src, img);
      }
    };

    img.onerror = () => {
      console.error(`Failed to load image: ${finalSrc}`);
      setError(true);
      setIsLoaded(false);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, addToCache, finalSrc, previewSrc, cachedImage, isBlob]);

  // If there's an error loading the image
  if (error) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-muted/50 rounded overflow-hidden", 
          className
        )}
        style={{width, height, minHeight: '80px'}}
      >
        <span className="text-muted-foreground text-sm">Failed to load image</span>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden" style={{width, height}}>
      {!isLoaded && (
        <div
          className={cn("w-full h-full absolute inset-0", loadingClassName)}
          style={{
            backgroundImage: previewSrc ? `url(${previewSrc})` : placeholder ? `url(${placeholder})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(8px)',
            transform: 'scale(1.1)'
          }}
        />
      )}
      <img
        src={finalSrc}
        alt={alt}
        sizes={sizes}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        style={{width, height}}
        onError={() => setError(true)}
      />
    </div>
  );
}