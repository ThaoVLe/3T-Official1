
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useImageCache, isBlobUrl, safeImageUrl } from '@/lib/image-cache';
import { Skeleton } from '@/components/ui/skeleton';

interface ProgressiveImageProps {
  src?: string;
  alt?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export function ProgressiveImage({
  src,
  alt = '',
  className,
  sizes,
  priority = false,
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const { getFromCache, addToCache } = useImageCache();

  // Early return if no src
  if (!src) {
    return (
      <div className={cn("relative bg-muted", className)}>
        <Skeleton className="w-full h-full absolute inset-0" />
      </div>
    );
  }

  // Get from cache if available
  const cachedImage = !isBlobUrl(src) ? getFromCache(src) : null;

  useEffect(() => {
    // Reset states when src changes
    setIsLoaded(false);
    setError(false);
    
    if (cachedImage) {
      setIsLoaded(true);
      return;
    }

    // Create a new image element
    const img = new Image();
    
    // Set up load handlers
    img.onload = () => {
      setIsLoaded(true);
      setError(false);
      // Only cache non-blob images
      if (src && !isBlobUrl(src)) {
        addToCache(src, img);
      }
    };

    img.onerror = () => {
      console.error(`Failed to load image: ${src}`);
      setError(true);
      setIsLoaded(false);
    };

    // Set the src - for blob URLs use directly, for others add quality
    img.src = safeImageUrl(src);

    // Cleanup
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, addToCache, cachedImage]);

  // If there's an error loading the image
  if (error) {
    return (
      <div
        className={cn(
          "relative bg-muted/50 flex items-center justify-center",
          className
        )}
      >
        <span className="text-muted-foreground text-sm">Image failed to load</span>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {!isLoaded && !priority && (
        <Skeleton className="w-full h-full absolute inset-0" />
      )}
      <img
        src={safeImageUrl(src)}
        alt={alt}
        sizes={sizes}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        loading={priority ? "eager" : "lazy"}
      />
    </div>
  );
}
